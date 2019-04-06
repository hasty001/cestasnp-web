const express = require('express');
const sanitize = require('mongo-sanitize');
const DB = require('../db/db');
const request = require('request');

const db = new DB();
const router = express.Router();

// retrieve travellers details
router.get('/details/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  db.getTravellerDetails(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/article/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  db.getTravellerArticle(travellerId, function(results) {
    res.json(results);
  });
});

router.get('/messages/:travellerId', function(req, res) {
  let travellerId = sanitize(parseInt(req.params.travellerId));
  db.getTravellerMessages(travellerId, function(results) {
    res.json(results);
  });
});

router.post('/lastMessages', function(req, res) {
  db.getTravellersMessages(req.body.travellerIds, function(results) {
    res.json(results);
  });
});

router.post('/comments', function(req, res) {
  db.getTravellerComments(req.body.articleId, req.body.travellerId, function(results) {
    res.json(results);
  });
});

router.get('/finishedTravellers', function(req, res) {
  let findBy = { finishedTracking: true };
  db.findBy('traveler_details', findBy, function(results) {
    res.json(results);
  });
});

router.get('/activeTravellers', function(req, res) {
  let findBy = { finishedTracking: false };

  db.findBy('traveler_details', findBy, function(results) {
    let activeTravellers = results;

    let trvlrIds = activeTravellers.map(trvlr => {
      return trvlr.user_id;
    });

    let trvlrsObject = {};

    activeTravellers.forEach(trvlr => {
      trvlrsObject[trvlr.user_id] = {
        start: trvlr.start_date,
      };
    });

    let trvlrPromises = trvlrIds.map(id => {
      return db.getTravellerLastMessage(id);
    });

    Promise.all(trvlrPromises)
      .then(function(msgs) {
        let now = new Date();
        let expired = msgs
          .filter(msg => {
            let startDate = new Date(trvlrsObject[msg.user_id].start);
            let published = new Date(msg.pub_date);
            trvlrsObject[msg.user_id].lastMsgDate = msg.pub_date;
            return (
              // check if journey start later than last message
              startDate.valueOf() < published.valueOf() &&
              // check if message is older than 5 days
              now.valueOf() > published.valueOf() &&
              now.valueOf() - published.valueOf() >= 432000000
            );
          })
          .map(msg => {
            return msg.user_id;
          });

        if (expired.length > 0) {
          let finishPromises = expired.map(id => {
            return db.finishTracking(id);
          });
          Promise.all(finishPromises)
            .then(function() {
              res.json(activeTravellers);
            })
            .catch(function(e) {
              throw e;
            });
        } else {
          res.json(activeTravellers);
        }
      })
      .catch(function(e) {
        throw e;
      });
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

        db.addCommentOldTraveller(comment, function(com) {
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

        db.addCommentNewTraveller(comment, function(com) {
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
