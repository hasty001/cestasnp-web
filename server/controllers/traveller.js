// TODO -remove this when problematic function is rewritten
/* eslint-disable array-callback-return */
const express = require('express');
const sanitize = require('mongo-sanitize');
const moment = require('moment');

const request = require('request');
const DB = require('../db/db');
const checkToken = require('../util/checkToken');

const db = new DB();
const router = express.Router();

// retrieve travellers details
router.get('/details/:travellerId', (req, res) => {
  const travellerId = sanitize(req.params.travellerId);
  db.getTravellerDetails(travellerId)
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('err ', e);
    });
});

router.get('/article/:travellerId', (req, res) => {
  const travellerId = sanitize(req.params.travellerId);
  db.getTravellerArticle(travellerId, results => {
    res.json(results);
  });
});

router.get('/messages/:travellerId', (req, res) => {
  const travellerId = sanitize(req.params.travellerId);
  db.getTravellerMessages(travellerId)
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('err ', e);
    });
});

router.post('/lastMessages', (req, res) => {
  db.getTravellersMessages(req.body.travellerIds, results => {
    res.json(results);
  });
});

router.post('/comments', (req, res) => {
  db.getTravellerComments(req.body.articleId, req.body.travellerId, results => {
    res.json(results);
  });
});

router.get('/finishedTravellers', (req, res) => {
  db.findBy('traveler_details', {
    finishedTracking: true,
    end_date: { $ne: '' }
  })
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('error ', e);
    });
});

router.get('/activeTravellersWithLastMessage', (req, res) => {
  db.getActiveTravellersWithLastMessage(req.query.date, req.query.maxCount)
    .then(data => res.json(data))
    .catch(e => { 
      console.error(e);
      res.status(500).json({ error: e.message })});
  });

router.get('/activeTravellers', (req, res) => {
  db.findBy('traveler_details', { finishedTracking: false })
    .then(activeTravellers => {
      const trvlrsObject = {};

      const trvlrPromises = activeTravellers.map(({ user_id, start_date }) => {
        trvlrsObject[user_id] = {
          start: start_date
        };
        return db.getTravellerLastMessage(user_id);
      });

      Promise.all(trvlrPromises)
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
              msg.pub_date = moment(startDate).format('YYYY-MM-DD');
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
                msg.pub_date = moment(msg.pub_date).format('YYYY-MM-DD');
              } else {
                // eslint-disable-next-line no-param-reassign
                msg.completed = 0;
                // eslint-disable-next-line no-param-reassign
                msg.pub_date = moment(msg.pub_date).format('YYYY-MM-DD');
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
            Promise.all(finishPromises)
              .then(() => {
                res.json(activeTravellers);
              })
              .catch(e => {
                throw e;
              });
          } else {
            res.json(activeTravellers);
          }
        })
        .catch(e => {
          throw e;
        });
    })
    .catch(e => {
      console.error('error ', e);
    });
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

  const secretKey = process.env.RECAPTCHA;
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response']}`;
  // + '&remoteip=' +
  // req.connection.remoteAddress;

  const processAddComment = (callback) =>
    {
      if (req.body.uid) {
        checkToken(req, res, req.body.uid, callback);
      } else {
       request(verificationURL, (error, response, body) => {
          // TODO - new cost
          // eslint-disable-next-line no-param-reassign
          body = JSON.parse(body);
          if (body.success) {   
            callback();
          } else {
            res.json({ responseError: 'Failed captcha verification' });
          }
        });
      }
    };

    processAddComment(() =>
    {
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
        const sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        const sArticleId = sanitize(req.body.articleId);
        comment.article_sql_id = sArticleId;
        const sDate = sanitize(moment().format('YYYY-MM-DD HH:mm:ss'));
        comment.date = sDate;
        const sUid = sanitize(req.body.uid);
        if (sUid.length <= 3) {
          sUid = parseInt(sUid, 10);
        }
        comment.uid = sUid;

        db.addCommentOldTraveller(comment, com => {
          res.json(com);
        });
      } else {
        // new system using traveler_comments collection in mongo
        comment.lang = 'sk-SK';
        const sComment = sanitize(req.body.comment);
        comment.comment = sComment;
        const sName = sanitize(req.body.name);
        comment.name = sName;
        const sVisitorIp = sanitize(req.body.visitorIp);
        comment.ip = sVisitorIp;
        comment.travellerDetails = {};
        const sTravellerId = sanitize(req.body.travellerId);
        comment.travellerDetails.id = sTravellerId;
        const sTravellerName = sanitize(req.body.travellerName);
        comment.travellerDetails.name = sTravellerName;
        const sDate = sanitize(moment().format('YYYY-MM-DD HH:mm:ss'));
        comment.date = sDate;
        const sUid = sanitize(req.body.uid);
        if (sUid.length <= 3) {
          sUid = parseInt(sUid, 10);
        }
        comment.uid = sUid;

        db.addCommentNewTraveller(comment, com => {
          res.json(com);
        });
      }
    });
});

router.post('/deleteComment', (req, res) => {
  const { id, uid, articleId } = req.body;

  checkToken(req, res, uid, () =>
  db.deleteComment(
    id, uid, articleId,
    resp => {
      res.json(resp);
    }
  ));
});

router.post('/userCheck', (req, res) => {
  const { email, name, uid } = req.body;

  checkToken(req, res, uid, () =>
    Promise.all([
      db.findBy('users', { uid }),
      db.getTravellerDetails(uid),
      db.getTravellerMessages(uid)
    ]).then(([userDetails, travellerDetails, travellerMessages]) => {
      if (userDetails && userDetails.length > 0) {
        res.json({
          userDetails: userDetails[0],
          travellerDetails: travellerDetails[0] || {},
          travellerMessages: travellerMessages || []
        });
        return;
      }
      db.createUser({ email, name, uid }, creation => {
        res.json(creation);
      });
    }));
});

router.post('/setupTraveller', (req, res) => {
  const { meno, text, start_date, uid, start_miesto, number, email } = req.body;

  checkToken(req, res, uid, () =>
  db.createTraveller(
    { meno, text, start_date, uid, start_miesto, number, email },
    resp => {
      res.json(resp);
    }
  ));
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
        db.updateTraveller(
          {
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
          },
          resp => {
            res.json(resp);
          }
        ));
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
    db.sendMessage(
      {
        lon,
        lat,
        accuracy,
        text,
        user_id,
        img,
        details_id
      },
      resp => {
        res.json(resp);
      }
    ));
  });

router.post('/deleteMessage', (req, res) => {
  const { id, uid } = req.body;

  checkToken(req, res, uid, () =>
    db.deleteMessage(
      id, uid,
      resp => {
        res.json(resp);
      }
    ));
  });

module.exports = router;
