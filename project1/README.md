# Project 1

In this Project 1 assignment, I built a website that stores 5,000 books with accessible information such as title, author, ISBN, year, reviews and rating counts from Goodreads through API.

Visitors can view books but if they want to search for a book via title, author and ISBN, or write reviews, they have to sign up for an account.

I familiarized myself with coding in python flask and sql in this project. For the sign up, sign in, search and submit review, I always do validation before processing data. Actions like submitting a blank review, a review without a rating; signing in with wrong username or password; attempting to create an account that already exists all result in error page.

I used bootstrap for the look and feel, and also embedded an iframe to show review from Goodreads based on a book's ISBN.

My database is simple, with tables that store users, reviews and books.
