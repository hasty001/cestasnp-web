const express = require('express');
const DB = require('../db/db');
const bodyParser = require('body-parser');
const request = require('request');

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

router.post('/lastMessages', function(req, res) {
  query.getTravellerLastMessage(req.body.travellerIds, function(results) {
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
  let findBy = { end_date: { $ne: '0000-00-00 00:00:00' } };
  query.findBy('traveler_details', findBy, function(results) {
    res.json(results);
  });
});

router.get('/activeTravellers', function(req, res) {
  let findBy = { end_date: '0000-00-00 00:00:00' };
  query.findBy('traveler_details', findBy, function(results) {
    res.json(results);
  });
});

router.post('/addComment', function(req, res) {
  if (
    req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response'] === '' ||
    req.body['g-recaptcha-response'] === null
  ) {
    res.json({ responseError: 'Please select captcha first' });
    return;
  }

  const secretKey = process.env.RECAPTCHA;
  const verificationURL =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    req.body['g-recaptcha-response'];
  // + '&remoteip=' +
  // req.connection.remoteAddress;

  request(verificationURL, function(error, response, body) {
    body = JSON.parse(body);
    if (body.success) {
      res.json({ responseSuccess: 'Success' });
      return;
    } else {
      res.json({ responseError: 'Failed captcha verification' });
      return;
    }
  });
});

module.exports = router;
