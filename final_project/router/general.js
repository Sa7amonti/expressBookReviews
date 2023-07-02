const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} registered`});
        }
        else {
            return res.status(400).json({message:`User ${username} already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

let getBooks =  new Promise((resolve, reject) => {
        resolve(books);
    });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    getBooks.then((books) => res.send(JSON.stringify(books)));
});

function getBookFromISBN(isbn) {
    return new Promise((resolve, reject) => {
        let bookISBN = parseInt(isbn);
        if (books[bookISBN]) {
            resolve(books[bookISBN]);
        } else {
            reject({status:404, message:`Book with ISBN ${isbn} not found`});
        }
    })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getBookFromISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks
    .then((bookList) => Object.values(bookList))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks
    .then((bookList) => Object.values(bookList))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getBookFromISBN(req.params.isbn)
  .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({message: error.message})
  );
});

module.exports.general = public_users;