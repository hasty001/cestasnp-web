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
  let findBy = { finishedTracking: true };
  query.findBy('traveler_details', findBy, function(results) {
    res.json(results);
  });
});

router.get('/activeTravellers', function(req, res) {
  let findBy = { finishedTracking: false };
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
      let comment = {};
      let now = new Date();
      comment.date =
        now.getFullYear() +
        '-' +
        ('0' + (now.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + now.getDate()).slice(-2) +
        ' ' +
        ('0' + now.getHours()).slice(-2) +
        ':' +
        ('0' + now.getMinutes()).slice(-2) +
        ':' +
        ('0' + now.getSeconds()).slice(-2);
      comment.lang = 'sk-SK';
      comment.sql_user_id = 0;
      comment.parent = 0;
      comment.path = 0;
      comment.level = 0;
      comment.object_group = 'com_content';
      comment.object_params = '';
      comment.email = '';
      comment.homepage = '';
      comment.title = '';
      comment.isgood = 0;
      comment.ispoor = 0;
      comment.published = 1;
      comment.subscribe = 0;
      comment.source = '';
      comment.source_id = 0;
      comment.checked_out = 0;
      comment.checked_out_time = '0000-00-00 00:00:00';
      comment.editor = '';
      comment.comment = req.body.comment;
      comment.name = req.body.name;
      comment.username = req.body.name;
      comment.ip = req.body.visitorIp;
      comment.article_sql_id = req.body.articleId;

      query.addComment(comment, function(com) {
        res.json(com);
        return;
      });
    } else {
      res.json({ responseError: 'Failed captcha verification' });
      return;
    }
  });
});

module.exports = router;
