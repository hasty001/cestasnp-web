const express = require('express')
const DB = require('../db/db')
const query = new DB()

const router = express.Router()

// router.route(‘/comments’)
//  //retrieve all comments from the database
//  .get(function(req, res) {
//  //looks at our Comment Schema
//  Comment.find(function(err, comments) {
//  if (err)
//  res.send(err);
//  //responds with a json object of our database comments.
//  res.json(comments)
//  });
//  })
//  //post new comment to the database
//  .post(function(req, res) {
//  var comment = new Comment();
//  //body parser lets us use the req.body
//  comment.author = req.body.author;
//  comment.text = req.body.text;
// comment.save(function(err) {
//  if (err)
//  res.send(err);
//  res.json({ message: ‘Comment successfully added!’ });
//  });
//  });