import os
import requests

from flask import Flask, session, request, render_template, jsonify
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

@app.route("/")
def index():
    #get 3 featured posts and 10 older posts
    qr1="SELECT * FROM books ORDER BY id ASC LIMIT 3;"
    qr2="SELECT * FROM books ORDER BY id ASC LIMIT 10 OFFSET 3;"
    books=db.execute(qr1).fetchall()
    olders = db.execute(qr2).fetchmany(10)
    return render_template("index.html", books=books, olders=olders)

@app.route("/login", methods=["GET", "POST"])
def login():
    #logged-in user tries to login?
    if request.method == "GET":
        if session["islogin"] == True:
            return render_template("error.html", message="Already logged in")
        else:
            return render_template("login.html")
    #process the login
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        #check login
        subj = db.execute("SELECT * FROM users WHERE username = :name",{"name":username}).fetchone()
        #db.execute("SELECT * FROM books WHERE id = :id",{"id":book_id}).fetchone()
        if not subj:
            return render_template("error.html", message="Account doesnt exist!",link=request.referrer)
        if subj.password != password:
            return render_template("error.html", message="Password doesnt match!",link=request.referrer)

        session["username"] = username
        session["user_id"] = subj.id
        # confirm logged-in user
        session["islogin"] = True

        return render_template("login_success.html", username=session["username"],islogin=session["islogin"])

@app.route("/logout")
def logout():
    session.clear()
    # confirm logged out user
    session["islogin"] = False
    return render_template("logout.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    #logged-in user tries to sign up?
    if session["islogin"]:
        return render_template("error.html", message="You are already signed in. You must sign out before signing up for another account.")
    if request.method == "GET":
        return render_template("signup.html")
    if request.method == "POST":
        #db execute
        username = request.form.get("username")
        password = request.form.get("password")
        if not username:
            return render_template("error.html", message="You must fill in username.",link=request.referrer)
        names = db.execute("SELECT username FROM users").fetchall()
        #unique username:
        if username in str(names):
            return render_template("error.html", message="This username has been chosen. Please choose another one.",link=request.referrer)
        if not password:
            return render_template("error.html", message="You must fill in password.",link=request.referrer)

        #all passed? let's add new user
        try:
            db.execute("INSERT INTO users (username,password) VALUES (:username,:password)",{"username":username,"password":password})
        except ValueError:
            return render_template("error.html", message="Cannot create account.")
        db.commit()

        return render_template("signup_success.html", name=username)

@app.route("/review", methods=["POST"])
def review():
    #cannot post review if not logged in
    if not session["islogin"]:
        return render_template("error.html", message="You have to log in to post review.", link=request.referrer)
    #only accept POST  method
    if request.method == "GET":
        return render_template("error.html", message="Action not permitted.")
    #do the db
    if request.method == "POST":
        #db execute
        book_id = request.args.get("book_id")
        user = session["username"]
        #link for go back from error
        link = "book/"+book_id
        review = request.form.get("review_input")
        if not review:
            return render_template("error.html", message="You must write something in the review box.", link=link)
        rating = request.form.get("rating")
        user_id = session["user_id"]
        if not rating:
            return render_template("error.html", message="You must rate the book.", link=link)
        #all data done, do db
        
        try:
            db.execute("INSERT INTO reviews (book_id,user_id,content,rating) VALUES (:bookid,:userid,:content,:rating)",{"bookid":book_id,"userid":user_id,"content":review,"rating":rating})
        except ValueError:
            return render_template("error.html", message="Cannot post review")
        db.commit()
        return render_template("review_success.html", message="Your review has been posted.")


@app.route("/book/<int:book_id>", methods=["GET"])
def view_book(book_id):
    #book_id = request.args.get("bo#"
    book = db.execute("SELECT * FROM books WHERE id = :id",{"id":book_id}).fetchone()
    #get goodreads info via API
    book_isbn=book.isbn
    res = requests.get("https://www.goodreads.com/book/review_counts.json", params={"key": "Z7wjF1x2lc10cLvuN8HpMQ", "isbns": book_isbn})
    if res.status_code != 200:
      raise Exception("ERROR: API request unsuccessful.")
    data=res.json()
    thisbook = data["books"][0]
    book_avg_rating = thisbook["average_rating"]
    work_reviews_count = thisbook["work_reviews_count"]
    work_ratings_count = thisbook["work_ratings_count"]
    goodreadsinfo = {
        "avg_rating": book_avg_rating,
        "review_counts": work_reviews_count,
        "ratings_counts": work_ratings_count
    }
    #fetch reviews, linked with users to get username
    reviews = db.execute("SELECT reviews.id as rid, reviews.user_id, reviews.content, reviews.rating, users.username, users.id FROM reviews JOIN users ON reviews.user_id=users.id AND reviews.book_id=:id",{"id":book_id}).fetchall()
    return render_template("detail.html", book_id=book_id, book=book,goodreadsinfo=goodreadsinfo,reviews=reviews)

@app.route("/api/<int:book_isbn>", methods=["GET"])
def getapi(book_isbn):
    #fetch book
    n_isbn = f"%{book_isbn}%".lower()
    book = db.execute("SELECT * FROM books WHERE isbn LIKE :isbn",{"isbn":n_isbn}).fetchone()
    title = book.title
    author = book.author
    year  = book.year
    gurl = "https://www.goodreads.com/book/review_counts.json?key=%s&isbns=%s" % ("Z7wjF1x2lc10cLvuN8HpMQ",book.isbn)
    #return gurl
    res = requests.get(gurl)
    if res.status_code != 200:
      #raise Exception("ERROR: API request unsuccessful.")
      return (f"Error getting JSON: {res.status_code}")
    data=res.json()
    thisbook = data["books"][0]

    book_avg_rating = thisbook["average_rating"]
    work_reviews_count = thisbook["work_reviews_count"]

    if book is None:
          return jsonify({"error": "Invalid ISBN"}), 422

    return jsonify({
               "title": title,
               "author": author,
               "year": year,
               "isbn": book_isbn,
               "review_count": thisbook["work_reviews_count"],
               "average_score": thisbook["average_rating"]
          })

@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("search_qr")
    keyword = f"%{keyword}%".lower()
    if not session["islogin"]:
        return render_template("error.html", message="You must log in to search",link=request.referrer)
    results = db.execute("SELECT * FROM books WHERE lower(title) LIKE :keyword or lower(author) LIKE :keyword OR isbn LIKE :keyword",{"keyword":keyword,"keyword":keyword,"keyword":keyword}).fetchall()
    if not results:
        return render_template("error.html", message="Cannot find any book that matches your search",link=request.referrer)
    return render_template("search.html", keyword=keyword, results=results)
