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
const { differenceInDays } = require('date-fns');

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

router.get('/getUrlNames', (req, res) => {
  promiseAsJson(() => db.getUrlNames(), res);
});

router.get('/finishedTravellers', (req, res) => {
  promiseAsJson(() => db.findBy(req.app.locals.db, _const.DetailsTable, {
    finishedTracking: true,
    end_date: { $ne: '' }
  }, {}, { end_date: -1 }), res);
});

router.get('/activeTravellersWithLastMessage', (req, res) => {
  promiseAsJson(() => 
    db.getActiveTravellersWithLastMessage(req.app.locals.db, req.query.date, req.query.maxCount).then(travellers => {
      const now = momentDate();

      const expired = travellers.filter(t => !t.finishedTracking).map(t => {
        const startDate = momentDate(t.start_date);

        var published = t.lastMessage && t.lastMessage.pub_date ? momentDate(t.lastMessage.pub_date) : null;

        if (!published && differenceInDays(now, startDate) >= 3) {
          // no message and started 3 or more days before now
          return { user_id: t.user_id, completed: 0, pub_date: startDate };
        }

        if (published && startDate.valueOf() < now.valueOf() && differenceInDays(now, published) >= 3) {       
          // started, last message older than 3 days
          return { user_id: t.user_id, completed: differenceInDays(now, startDate) >= 14, pub_date: published };
        }

        return null;
      }).filter(f => f);

      if (expired.length > 0) {
        const finishPromises = expired.map(({ user_id, completed, pub_date }) => {
            return db.finishTracking(user_id, completed, pub_date);
          }
        );

        return Promise.all(finishPromises)
          .then(() => Promise.resolve(travellers))
      } else {
        return Promise.resolve(travellers);
      }
    }), res);
});

router.get('/activeTravellers', (req, res) => {
  promiseAsJson(() => db.findBy(req.app.locals.db, _const.DetailsTable, { finishedTracking: false }), res);
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

router.post('/newComments', (req, res) => {
  const { uid, detailsId, articleId, date } = req.body;

  checkToken(req, res, uid, () => db.getTravellerComments(req.app.locals.db, articleId, detailsId, date));
});

router.post('/view', (req, res) => {
  const {
    uid,
    date
  } = req.body;

  checkToken(req, res, uid, () =>
    db.viewTraveller({ uid, date }));
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

router.get('/users', (req, res) => {
  promiseAsJson(() => db.getUserNames(req.app.locals.db, null), res);
});


module.exports = router;
