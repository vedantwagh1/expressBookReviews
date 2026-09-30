const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];


// Check whether username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};


// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};


// Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Error logging in"
        });
    }

    if (authenticatedUser(username, password)) {

        const accessToken = jwt.sign(
            { username: username },
            "access",
            { expiresIn: "1h" }
        );

        req.session.authorization = {
            accessToken: accessToken,
            username: username
        };

        return res.status(200).send("User successfully logged in");

    } else {
        return res.status(401).json({
            message: "Invalid Login. Check username and password"
        });
    }
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const ISBN = req.params.isbn;

    if (!req.session.authorization) {
        return res.status(401).json({
            message: "User not logged in"
        });
    }

    const username = req.session.authorization.username;

    const review = req.body.review || req.query.review;

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    const book = books[ISBN];

    if (!book) {
        return res.status(404).json({
            message: "ISBN is not found"
        });
    }

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    const ISBN = req.params.isbn;

    if (!req.session.authorization) {
        return res.status(401).json({
            message: "User not logged in"
        });
    }

    const username = req.session.authorization.username;

    const book = books[ISBN];

    if (!book) {
        return res.status(404).json({
            message: "ISBN is not found"
        });
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({
            message: "Review by this user not found"
        });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: `Review from ${username} deleted successfully`,
        reviews: book.reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
