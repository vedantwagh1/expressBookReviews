const express = require('express');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});


// Get the book list available in the shop
async function getBookList() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(books);
        }, 100);
    });
}

public_users.get("/", async (req, res) => {
    try {
        const data = await getBookList();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve books"
        });
    }
});


// Get book details based on ISBN
async function getBookDetails(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];

        if (book) {
            setTimeout(() => {
                resolve(book);
            }, 100);
        } else {
            reject(new Error("Book not found"));
        }
    });
}

public_users.get("/isbn/:isbn", async (req, res) => {
    try {
        const book = await getBookDetails(req.params.isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
});


// Get book details based on author
async function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
            book => book.author.toLowerCase() === author.toLowerCase()
        );

        if (result.length > 0) {
            setTimeout(() => {
                resolve(result);
            }, 100);
        } else {
            reject(new Error("Book not found"));
        }
    });
}

public_users.get("/author/:author", async (req, res) => {
    try {
        const result = await getBooksByAuthor(req.params.author);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
});


// Get all books based on title
async function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
            book => book.title.toLowerCase().includes(title.toLowerCase())
        );

        if (result.length > 0) {
            setTimeout(() => {
                resolve(result);
            }, 100);
        } else {
            reject(new Error("Book not found"));
        }
    });
}

public_users.get("/title/:title", async (req, res) => {
    try {
        const result = await getBooksByTitle(req.params.title);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
});


// Get book review
public_users.get("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "ISBN is not found"
        });
    }

    return res.status(200).json(books[isbn].reviews);
});


module.exports.general = public_users;
