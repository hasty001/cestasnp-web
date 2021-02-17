// TODO -remove this when problematic function is rewritten
/* eslint-disable array-callback-return */
const express = require('express');
const sanitize = require('mongo-sanitize');
const request = require('request');
const DB = require('../db/db');
const { checkToken, sanitizeUserId } = require('../util/checkUtils');
const { promiseAsJson } = require('../util/promiseUtils');
const _const = require('../../const');
const { momentDate, momentDateTime } = require('../util/momentUtils');

const db = new DB();
const router = express.Router();

// retrieve travellers details
router.get('/details/:travellerId', (req, res) => {
  promiseAsJson(() => db.getTravellerDetails(req.app.locals.db, req.params.travellerId), res);
});

router.get('/article/:travellerId', (req, res) => {
  promiseAsJson(() => db.getTravellerArticle(req.app.locals.db, req.params.travellerId), res);
});

router.get('/messages/:travellerId', (req, res) => {
  promiseAsJson(() => db.getTravellerMessages(req.app.locals.db, req.params.travellerId), res);
});

router.post('/lastMessages', (req, res) => {
  promiseAsJson(() => db.getTravellersMessages(req.app.locals.db, req.body.travellerIds), res);
});

router.post('/comments', (req, res) => {
  promiseAsJson(() => db.getTravellerComments(req.app.locals.db, req.body.articleId, req.body.travellerId), res);
});

router.get('/finishedTravellers', (req, res) => {
  promiseAsJson(() => db.findBy(req.app.locals.db, _const.DetailsTable, {
    finishedTracking: true,
    end_date: { $ne: '' }
  }, {}, { end_date: -1 }), res);
});

router.get('/activeTravellersWithLastMessage', (req, res) => {
  promiseAsJson(() => 
    db.getActiveTravellersWithLastMessage(req.app.locals.db, req.query.date, req.query.maxCount), res);
});

router.get('/activeTravellers', (req, res) => {
  promiseAsJson(() => db.findBy(req.app.locals.db, _const.DetailsTable, { finishedTracking: false })
    .then(activeTravellers => {
      const trvlrsObject = {};

      const trvlrPromises = activeTravellers.map(({ user_id, start_date }) => {
        trvlrsObject[user_id] = {
          start: start_date
        };
        
        return db.getTravellerLastMessage(req.app.locals.db, user_id);
      });

      return Promise.all(trvlrPromises)
        .then(msgs => {
          const now = new Date();
          // TODO - why filter ?
          // This whole function ooks kind of fishy :)
          // eslint-disable-next-line consistent-return
          const expired = msgs.filter(msg => {
            const startDate = new Date(trvlrsObject[msg.user_id].start);
            let published = 'empty';
            if (msg.pub_date && msg.pub_date !== 0) {
              published = new Date(msg.pub_date);
            }
            if (
              published === 'empty' &&
              startDate.valueOf() < now.valueOf() &&
              now.valueOf() - startDate.valueOf() >= 259200000
            ) {
              // TODO - spread and add new key
              // eslint-disable-next-line no-param-reassign
              msg.completed = 0;
              // eslint-disable-next-line no-param-reassign
              msg.pub_date = momentDate(startDate);
              return msg;
            }
            if (
              published !== 'empty' &&
              startDate.valueOf() < now.valueOf() &&
              now.valueOf() > published.valueOf() &&
              now.valueOf() - published.valueOf() >= 259200000
            ) {
              if (published.valueOf() - startDate.valueOf() >= 864000000) {
                // eslint-disable-next-line no-param-reassign
                msg.completed = 1;
                // eslint-disable-next-line no-param-reassign
                msg.pub_date = momentDate(msg.pub_date);
              } else {
                // eslint-disable-next-line no-param-reassign
                msg.completed = 0;
                // eslint-disable-next-line no-param-reassign
                msg.pub_date = momentDate(msg.pub_date);
              }
              return msg;
            }
          });

          if (expired.length > 0) {
            const finishPromises = expired.map(
              ({ user_id, completed, pub_date }) => {
                return db.finishTracking(user_id, completed, pub_date);
              }
            );

            return Promise.all(finishPromises)
              .then(() => {
                return Promise.resolve(activeTravellers);
              })
          } else {
            return Promise.resolve(activeTravellers);
          }
        });
    }), res);
});

router.post('/addComment', (req, res) => {
  if (
    !req.body.uid &&  
    (req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response'] === '' ||
    req.body['g-recaptcha-response'] === null)
  ) {
    res.json({ responseError: 'Please select captcha first' });
    return;
  }

  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr){
    var list = ipAddr.split(",");
    ipAddr = list[list.length - 1];
  } else {
    ipAddr = req.connection.remoteAddress;
  }

  const secretKey = process.env.RECAPTCHA;
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`;
  // + '&remoteip=' +
  // req.connection.remoteAddress;

  const processAddComment = (callback) =>
    {
      if (req.body.uid) {
        checkToken(req, res, req.body.uid, callback, () => req.body.comment);
      } else {
       request(verificationURL, (error, response, body) => {
          const parsed = JSON.parse(body);
          if (parsed.success) {   
            promiseAsJson(() => callback(), res);
          } else {
            res.json({ responseError: 'Failed captcha verification' });
          }
        });
      }
    };

    processAddComment(() => {
      const comment = {};
      if (req.body.articleId !== 0 && req.body.articleId !== '') {
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
        const sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        const sName = sanitize(req.body.name);
        comment.name = sName;
        comment.username = sName;
        const sVisitorIp = sanitize(ipAddr);
        comment.ip = sVisitorIp;
        const sArticleId = sanitize(req.body.articleId);
        comment.article_sql_id = sArticleId;
        const sDate = sanitize(momentDateTime());
        comment.date = sDate;
        const sUid = sanitizeUserId(req.body.uid);
        comment.uid = sUid;

        return db.addCommentOldTraveller(comment);
      } else {
        // new system using traveler_comments collection in mongo
        comment.lang = 'sk-SK';
        const sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        const sName = sanitize(req.body.name);
        comment.name = sName;
        const sVisitorIp = sanitize(ipAddr);
        comment.ip = sVisitorIp;
        comment.travellerDetails = {};
        const sTravellerId = sanitize(req.body.travellerId);
        comment.travellerDetails.id = sTravellerId;
        const sTravellerName = sanitize(req.body.travellerName);
        comment.travellerDetails.name = sTravellerName;
        const sDate = sanitize(momentDateTime());
        comment.date = sDate;
        const sUid = sanitizeUserId(req.body.uid);
        comment.uid = sUid;

        return db.addCommentNewTraveller(comment);
      }
    });
});

router.post('/deleteComment', (req, res) => {
  const { id, uid, articleId } = req.body;

  checkToken(req, res, uid, () => db.deleteComment(id, uid, articleId));
});

router.post('/userCheck', (req, res) => {
  const { email, name, uid } = req.body;

  checkToken(req, res, uid, () =>
    Promise.all([
      db.findBy(req.app.locals.db, _const.UsersTable, { uid }),
      db.getTravellerDetails(req.app.locals.db, uid)
    ]).then(([userDetails, travellerDetails]) => {
      if (userDetails && userDetails.length > 0) {
        return {
          userDetails: userDetails[0],
          travellerDetails: travellerDetails[0] || {}
        };
      }

      return db.createUser({ email, name, uid });
    }));
});

router.post('/setupTraveller', (req, res) => {
  const { meno, text, start_date, uid, start_miesto, number, email } = req.body;

  checkToken(req, res, uid, () => db.createTraveller({ meno, text, start_date, uid, start_miesto, number, email }),
    () => meno && text && start_date);
});

router.post('/updateTraveller', (req, res) => {
  const {
    meno,
    text,
    start_date,
    uid,
    start_miesto,
    number,
    end_date,
    completed,
    email,
    finishedTracking
  } = req.body;

  checkToken(req, res, uid, () =>
    db.updateTraveller({
      meno,
      text,
      start_date,
      uid,
      start_miesto,
      number,
      end_date,
      completed,
      email,
      finishedTracking
    }), () => meno && text && start_date);
});

router.post('/sendMessage', (req, res) => {
  const {
    lon,
    lat,
    accuracy,
    text,
    user_id,
    img,
    details_id
  } = req.body;

  checkToken(req, res, user_id, () =>
    db.sendMessage({
      lon,
      lat,
      accuracy,
      text,
      user_id,
      img,
      details_id
    }), () => lat && lon && text);
  });

router.post('/deleteMessage', (req, res) => {
  const { id, uid } = req.body;

  checkToken(req, res, uid, () => db.deleteMessage(id, uid));
});

module.exports = router;
