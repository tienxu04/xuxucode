import csv
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
#http://127.0.0.1:5000/
#postgres://rick:foo@localhost:5432/pg_db
#app.config['DATABASE_URL'] = "postgres://sonluong:123@localhost:5432/xudb"

# INSERT INTO reviews (book_id, user_id, content) VALUES (1,1,"this is a good book");

# INSERT INTO users (username, password) VALUES ('xuxukun','123');
engine = create_engine(os.getenv("DATABASE_URL"))

db = scoped_session(sessionmaker(bind=engine))

def main():
    f = open("books.csv")
    reader = csv.reader(f)
    for isbn, title, author, year in reader: # loop gives each column a name
      db.execute("INSERT INTO books (isbn, title, author, year) VALUES (:isbn, :title, :author, :year)",
                  {"isbn": isbn, "title": title, "author": author, "year": year})
      print(f"Added book titled {title} by {author} published in {year} .")


    db.commit()

if __name__ == "__main__":
    main()
