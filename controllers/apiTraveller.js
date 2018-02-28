const express = require('express');
const DB = require('../db/db');
const bodyParser = require('body-parser');

const query = new DB();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// retrieve travellers details
router.get('/details/:travellerId', function(req, res) {
  let travellerId = parseInt(req.params.travellerId);
  query.getTravellerDetails(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/article/:travellerId', function(req, res) {
  let travellerId = parseInt(req.params.travellerId);
  query.getTravellerArticle(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/messages/:travellerId', function(req, res) {
  let travellerId = parseInt(req.params.travellerId);
  query.getTravellerMessages(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/comments/:articleId', function(req, res) {
  let articleId = parseInt(req.params.articleId);
  query.getTravellerComments(articleId, function(results) {
    res.json(results);
  });
});

router.get('/finishedTravellers', function(req, res) {
  let findBy = { completed: 1 };
  query.findBy('TEST_traveler_details', findBy, function(results) {
    res.json(results);
  });
});

module.exports = router;
