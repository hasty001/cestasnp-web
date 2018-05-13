const express = require('express');
const sanitize = require('mongo-sanitize');
const DB = require('../db/db');
const bodyParser = require('body-parser');
const request = require('request');

const query = new DB();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// retrieve travellers details
router.get('/details/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  query.getTravellerDetails(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/article/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  query.getTravellerArticle(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/messages/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  query.getTravellerMessages(travellerId, function(results) {
    res.json(results);
  });
});

router.post('/lastMessages', function(req, res) {
  query.getTravellerLastMessage(req.body.travellerIds, function(results) {
    res.json(results);
  });
});

router.post('/comments', function(req, res) {
  query.getTravellerComments(req.body.articleId, req.body.travellerId, function(results) {
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
      if (req.body.articleId !== 0) {
        // old system of comments relating to sql article id from Joomla
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
        let sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        let sName = sanitize(req.body.name);
        comment.name = sName;
        comment.username = sName;
        let sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        let sArticleId = sanitize(req.body.articleId);
        comment.article_sql_id = sArticleId;
        let sDate = sanitize(req.body.date);
        comment.date = sDate;

        query.addCommentOldTraveller(comment, function(com) {
          res.json(com);
          return;
        });
      } else {
        // new system using traveler_comments collection in mongo
        comment.lang = 'sk-SK';
        let sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        let sName = sanitize(req.body.name);
        comment.name = sName;
        let sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        comment.travellerDetails = {};
        let sTravellerId = sanitize(req.body.travellerId);
        comment.travellerDetails.id = sTravellerId;
        let sTravellerName = sanitize(req.body.travellerName);
        comment.travellerDetails.name = sTravellerName;
        let sDate = sanitize(req.body.date);
        comment.date = sDate;

        query.addCommentNewTraveller(comment, function(com) {
          res.json(com);
          return;
        });
      }
    } else {
      res.json({ responseError: 'Failed captcha verification' });
      return;
    }
  });
});

module.exports = router;
