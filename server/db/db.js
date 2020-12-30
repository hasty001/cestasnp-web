// TODO - lot of reapeating code refactor when possible
const { MongoClient } = require('mongodb');
const sanitize = require('mongo-sanitize');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const Validation = require('./validation');
const { getNearGuideposts, findNearestGuideposts, findNearestPoint } = require('../util/gpsUtils');
const { format } = require('date-fns');
const _const = require('../../const');

const securityCheck = new Validation();

// eslint-disable-next-line func-names
const DB = function() {
  this.url = process.env.MONGODB_ATLAS_URI;
};

DB.prototype = {
  all(db, collection) {
    return db.db('cestasnp')
      .collection(collection)
      .find()
      .toArray();
  },

  newestSorted(db, collection, sortBy = {}, filterBy = {}, limit = 2) {
    return db.db('cestasnp')
      .collection(collection)
      .find(filterBy)
      .sort(sortBy)
      .limit(limit)
      .toArray();
  },

  nextSorted(db, collection, sortBy = {}, next = 0, filterBy = {}, pageSize = 8) {
    let page = next - 1;
    page = page < 0 ? 0 : page;

    return db.db('cestasnp')
        .collection(collection)
        .find(filterBy)
        .sort(sortBy)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
  },

  findBy(collection, findBy = {}, sortBy = {}) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        process.env.MONGODB_ATLAS_URI,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection(collection)
              .find(findBy)
              .sort(sortBy)
              .toArray((toArrayError, docs) => {
                if (docs) {
                  db.close();
                  resolve(docs);
                } else {
                  db.close();
                  reject(toArrayError);
                }
              });
          } else {
            reject(err);
          }
        }
      );
    });
  },

  findByWithDB(db, collection, findBy = {}) {
    return db.db('cestasnp')
        .collection(collection)
        .find(findBy)
        .toArray();
  },

  latestWithDB(db, collection, findBy = {}, sortBy = {}) {
    return db.db('cestasnp')
        .collection(collection)
        .find(findBy)
        .sort(sortBy)
        .limit(1)
        .toArray();
  },
  
  findByWithDB(db, collection, findBy = {}, options = {}, sortBy = {}) {
    return db.db('cestasnp')
              .collection(collection)
              .find(findBy, options)
              .sort(sortBy)
              .toArray();
  },

  countCollection(db, collection, findBy = {}) {
    return db.db('cestasnp')
            .collection(collection)
            .countDocuments(findBy);
  },

  addArticle(article, collection) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .insertOne(article)
            .then(() => {
              db.close();
            })
            .catch(dbError => {
              db.close();
              throw dbError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  increaseArticleCount(articleId, callback) {
    const sArticleId = sanitize(articleId);
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          const oid = new ObjectId(sArticleId);
          db.db('cestasnp')
            .collection('articles')
            .findOneAndUpdate({ _id: oid }, { $inc: { article_views: 1 } })
            .then(res => {
              db.close();
              callback(res);
            })
            .catch(dbError => {
              db.close();
              throw dbError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  // traveller related

  getTravellerDetails(db, travellerId) {
    return new Promise((resolve, reject) => {
      let sTravellerId = sanitize(travellerId);
      // for before FIREBASE users
      if (sTravellerId.length <= 3) {
        sTravellerId = parseInt(sTravellerId, 10);
      }

      return db.db('cestasnp')
        .collection('traveler_details')
        .find({ user_id: sTravellerId })
        .toArray((toArrayError, docs) => {
          if (docs) {
            resolve(docs);
          } else {
            reject(toArrayError);
          }
        });
    });
  },

  getTravellerArticle(db, travellerId) {
    let sTravellerId = sanitize(travellerId);
    // for before FIREBASE users
    if (sTravellerId.length <= 3) {
      sTravellerId = parseInt(sTravellerId, 10);
    }
    
    return db.db('cestasnp')
      .collection('articles')
      .find({ created_by_user_sql_id: sTravellerId })
      .toArray();
  },

  getTravellerMessages(db, userId) {
    return new Promise((resolve, reject) => {
      let sUserId = sanitize(userId);
      // for before FIREBASE users
      if (sUserId.length <= 3) {
        sUserId = parseInt(sUserId, 10);
      }

      return db.db('cestasnp')
        .collection('traveler_messages')
        .find({ $and: [ { user_id: sUserId }, { deleted: {$ne: true} } ] })
        .toArray((toArrayErr, docs) => {
          if (docs) {
            resolve(docs);
          } else {
            reject(toArrayErr);
          }
        })
    });
  },

  findUserName(uid, users) {
    const index = users.findIndex(u => u.uid === uid);
    return index >= 0 ? users[index].name : null;
  },

  getUids(list, selectProps) {
    return list.reduce((res, item) => res.concat(selectProps.filter(prop => prop(item)).map(prop => prop(item))), []);
  },

  /**
   * Returns list of users with name or journey name for specified uids.
   */
  getUserNames(db, uids) {
    const getUsers = db.db('cestasnp')
      .collection('users')
      .find(uids ? { $or: [ { uid : { $in: uids } }, { sql_user_id : { $in: uids } } ] } : {}, { uid: 1, sql_user_id: 1, name: 1 })
      .toArray();

    const getDetails = db.db('cestasnp')
      .collection('traveler_details')
      .find(uids ? { user_id : { $in: uids } } : {}, { user_id: 1, meno: 1 })
      .toArray();

    return Promise.all([getUsers, getDetails]).then(([users, details]) => {                
      users.forEach(u => {
        if (!u.uid) {
          u.uid = u.sql_user_id;
        }

        const cesta = details.find(t => t.user_id === u.uid);
        if (cesta) {
          u.name = cesta.meno;
        }
      });

      return Promise.resolve(users);
    });
  },

  getTravellerComments(db, articleId, travellerId, callback) {
    const sArticleId = sanitize(articleId);
    const sTravellerId = sanitize(travellerId);
   
    const getDocs = (sArticleId === 0 || sArticleId === '') ?
      db.db('cestasnp')
        .collection('traveler_comments')
        .find({ $and: [ { 'travellerDetails.id': sTravellerId }, { deleted: {$ne: true} } ] })
        .toArray()
      : db.db('cestasnp')
        .collection('article_comments')
        .find({ $and: [ { article_sql_id: sArticleId }, { deleted: {$ne: true} } ] })
        .toArray();

    return getDocs.then((docs) => {
      const uids = this.getUids(docs, [d => d.uid]);

      return this.getUserNames(db, uids)
        .then(users => {
          docs.forEach(d => {
            if (d.uid) {
              const user = users.find(u => u.uid === d.uid);
              if (user) {
                if (d.username)
                  d.username = user.name;
                d.name = user.name;
              }
            }

          });
          
          return Promise.resolve(docs);
        });
    });
  },

  getTravellersMessages(db, travellerIds) {
    if (!Array.isArray(travellerIds)) {
      return Promise.reject('Traveller IDs not an array');
    }

    let typeCheck = 0;
    const sTravellerIds = travellerIds.map(id => {
      if (typeof id !== 'number' && typeof id !== 'string') typeCheck += 1;
      return sanitize(id);
    });

    if (typeCheck !== 0) {
      return Promise.reject('Traveller IDs not numbers');
    }

    return db.db('cestasnp')
      .collection('traveler_messages')
      .find({ $and: [ { user_id: { $in: sTravellerIds } }, { deleted: {$ne: true} } ] })
      .toArray().then(docs => {
          docs.sort((a, b) => {
            return new Date(b.pub_date) - new Date(a.pub_date);
          });

          return Promise.resolve(docs);
      });
  },

  getTravellerLastMessage(db, travellerId) {
    return db.db('cestasnp')
      .collection('traveler_messages')
      .find({ $and: [ { user_id: travellerId }, { deleted: {$ne: true} } ] })
      .sort({ pub_date: -1 })
      .toArray().then(docs => {
          if (docs && docs.length > 0) {
            return Promise.resolve(docs[0]);
          } else if (docs && docs.length === 0) {
            return Promise.resolve({
              message: `No messages found for ${travellerId}`,
              pub_date: 0,
              user_id: travellerId
            });
          }});
  },

  getInterestingFinishedTravellers(db, date, maxCount = _const.InterestingShowCount) {
    const now = format(new Date(date || new Date()), 'YYYY-MM-DD');
    const start = format(new Date(date || new Date()) - _const.InterestingPrevMonths * 31 * 24 * 60 * 60 * 1000, 'YYYY-MM-DD');
              
    return this.findByWithDB(db, 'traveler_details', { 
      $and: [{ finishedTracking: true}, 
        { $or: [{start_date: { $lte: now }}, {end_date: { $lte: now }}]},
        { $or: [{start_date: { $gte: start }}, {end_date: { $gte: start }}]}] })
      .then(finished => {

        const finishedIds = finished.map(t => t.articleID ? t.articleID : t._id.toString() );
        const finishedUserIds = finished.map(t => t.user_id );

        const listCommentsOld = this.findByWithDB(db, 'article_comments', 
          { $and: [{ article_sql_id: { $in: finishedIds } }, { deleted: { $ne: true }}] });
        const listCommentsNew = this.findByWithDB(db, 'traveler_comments', 
          { $and: [{ 'travellerDetails.id': { $in: finishedIds } }, { deleted: { $ne: true }}] });
        const listMessages = this.findByWithDB(db, 'traveler_messages', 
          { $and: [{ user_id: { $in: finishedUserIds } }, { deleted: { $ne: true }}] }, {}, { pub_date: 1 });

        return Promise.all([listCommentsOld, listCommentsNew, listMessages])
        .then(([oldComments, newComments, msgs]) => {

          finished.forEach(f => {
            f.rating = 0;
          });

          oldComments.forEach(c => { 
            const found = finished.find(f => f.articleID === c.article_sql_id);
            if (found) {
              found.rating += _const.CommentRating;
            }
          });

          newComments.forEach(c => { 
            const found = finished.find(f => f._id.toString() === c.travellerDetails.id);
            if (found) {
              found.rating += _const.CommentRating;
            }
          });

          msgs.forEach(m => { 
            const found = finished.find(f => f.user_id === m.user_id);
            const hasImg = (m.img && m.img != 'None');
            if (found) {
              found.rating += (hasImg ? _const.ImageRating : 0)
                + m.text.length * _const.TextRatingPerChar;
              if (hasImg && !found.lastImg && m.pub_date >= start) {
                found.lastImg = m.img;
                found.lastImgMsgId = m._id;
              }
            }
          });

          // sort by rating desc and throw out with small rating
          finished.sort((a, b) => b.rating - a.rating);
          var best = finished.filter(f => f.rating > _const.MinRating);
          best = best.slice(0, Math.max(2, best.length / 2));
          
          // sort by start date asc
          best.sort((a, b) => a.start_date > b.start_date ? 1 : (a.start_date == b.start_date ? 0 : -1));
        
          // take first three
          return Promise.resolve(best.slice(0, maxCount));
        });
      });
  },

  getActiveTravellersWithLastMessage(db, date, maxCount) {
    return this.findByWithDB(db, 'traveler_details', { finishedTracking: false })
      .then(activeTravellers => {
        var activeTravellersIds = activeTravellers.map(({user_id}) => user_id);
          
        if (activeTravellersIds.length === 0) {
          return this.getInterestingFinishedTravellers(db, date, maxCount || _const.InterestingShowCount);          
        } else {
          return this.findByWithDB(db, 'traveler_messages', { $and: [{ user_id: { $in: activeTravellersIds } }, { deleted: { $ne: true }}] },
            {}, { pub_date: -1 })
            .then(lastMessages => {
              if (lastMessages) { 
                lastMessages.map(msg => {
                    var i = activeTravellersIds.indexOf(msg.user_id);

                    if (i >= 0 && !activeTravellers[i].lastMessage) {
                      activeTravellers[i].lastMessage = msg;
                    }
                    if (msg.img && msg.img != 'None' && i >= 0 && !activeTravellers[i].lastImg) {
                      activeTravellers[i].lastImg = msg.img;
                      activeTravellers[i].lastImgMsgId = msg._id;
                    }
                  });
              }
                
              const now = format(new Date(date || new Date()), 'YYYY-MM-DD');
              if (!activeTravellers.find(t => t.start_date <= now) && activeTravellers.length < maxCount || _const.InterestingShowCount) {
                // no active only few planning, add some interesting

                return this.getInterestingFinishedTravellers(db, date, (maxCount || _const.InterestingShowCount) - activeTravellers.length)
                  .then(travellers => Promise.resolve(activeTravellers.concat(travellers)));
              }

              return Promise.resolve(activeTravellers);
            });
        }
  })},


  addCommentOldTraveller(comment, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection('article_comments')
            .find()
            .sort({ sql_comment_id: -1 })
            .limit(1)
            .toArray()
            .then(array => {
              // TODO - spread and add key
              // eslint-disable-next-line no-param-reassign
              comment.sql_comment_id = array[0].sql_comment_id + 1;
            })
            .then(() => {
              if (securityCheck.checkCommentOldTraveller(comment)) {
                // save comment with new comment id
                db.db('cestasnp')
                  .collection('article_comments')
                  .insertOne(comment)
                  .then((commentRes) => {
                    comment._id = commentRes.insertedId;
                    
                    db.close();
                    callback(comment);
                  })
                  .catch(insertOne => {
                    db.close();
                    throw insertOne;
                  });
              } else {
                callback({ error: 'Malicious comment' });
              }
            })
            .catch(dbError => {
              throw dbError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  addCommentNewTraveller(comment, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          const resCollection = db
            .db('cestasnp')
            .collection('traveler_comments');
          // / see highest comment number
          if (securityCheck.checkCommentNewTraveller(comment)) {
            // save comment with new comment id
            resCollection
              .insertOne(comment)
              .then((commentRes) => {
                comment._id = commentRes.insertedId;

                db.close();
                callback(comment);
              })
              .catch(inserErr => {
                db.close();
                throw inserErr;
              });
          } else {
            callback({ error: 'Malicious comment' });
          }
        } else {
          throw err;
        }
      }
    );
  },

  deleteComment(id, uid, articleId, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true }).then((db) => {
          return db.db('cestasnp')
          .collection('traveler_details')
          .findOne({ user_id : uid })
          .then((details) =>
          {          
            const sDetails = { _id: (details && details._id && details._id.toString()) ? details._id.toString() : "-1", 
              articleID: (details && details.articleID) ? details.articleID : -1 };

            const update = {
              $set: {
                deleted: true,
                del_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                del_by: uid,
              }
            };
            const options = { returnOriginal: false };
            const deleteComment = (articleId === 0 || articleId === '') ?
              db.db('cestasnp')
                .collection('traveler_comments')
                .findOneAndUpdate({ $and: [ { _id : new ObjectId(id) }, { $or: [ { 'travellerDetails.id': sDetails._id }, { uid: uid } ] } ] },
                  update, options)
              : db.db('cestasnp')
                .collection('article_comments')
                .findOneAndUpdate({ $and: [ { _id : new ObjectId(id) }, { $or: [ { article_sql_id: sDetails.articleID }, { uid: uid } ] } ] },
                  update, options);

            return deleteComment.then((res) => {
              db.close();

              if (res.value) {
                callback(res.value);
              } else {
                callback({ error: 'Komentár nebol nájdený.' });
              }
            });
          })
          .catch(error => {
            db.close();
            callback({ error });
          });
      }).catch(error => callback({ error }));
  },

  finishTracking(userId, completed, endDate) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        process.env.MONGODB_ATLAS_URI,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_details')
              .findOneAndUpdate(
                {
                  user_id: userId
                },
                {
                  $set: {
                    finishedTracking: true,
                    end_date: endDate,
                    completed
                  }
                }
              )
              .then(res => {
                db.close();
                resolve(res);
              })
              .catch(error => {
                db.close();
                reject(error);
              });
          } else {
            reject(err);
          }
        }
      );
    });
  },

  createUser({ email, name, uid }, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          const userRecord = {
            uid,
            sql_user_id: '',
            name,
            email,
            usertype: 'Fan',
            registerDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            lastvisitDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            sendEmail: 'NOT IN USE',
            gid: 'NOT IN USE',
            block: 'NOT IN USE',
            password: 'NOT IN USE',
            username: 'NOT IN USE',
            activation: 'NOT IN USE',
            params: 'NOT IN USE'
          };
          db.db('cestasnp')
            .collection('users')
            .insertOne(userRecord)
            .then(() => {
              db.close();
              callback({
                userDetails: userRecord,
                travellerDetails: {},
                travellerMessages: []
              });
            })
            .catch(dbError => {
              db.close();
              throw dbError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  createTraveller(
    { meno, text, start_date, uid, start_miesto, number, email },
    callback
  ) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          const travellerRecord = {
            sql_id: '',
            meno, // nazov skupiny
            text, // popis skupiny
            start_date,
            end_date: '',
            completed: '',
            user_id: uid,
            start_miesto,
            number, // pocet ucastnikov
            email, // 0 / 1 moznost kontaktovat po skonceni s dotaznikom
            articleID: 0,
            finishedTracking: false,
            created: moment().format('YYYY-MM-DD HH:mm:ss'),
            lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
          };
          db.db('cestasnp')
            .collection('traveler_details')
            .insertOne(travellerRecord)
            .then(() => {
              db.close();
              callback(travellerRecord);
            })
            .catch(insertError => {
              db.close();
              throw insertError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  updateTraveller(
    {
      meno,
      text,
      start_date,
      uid,
      start_miesto,
      end_date,
      number,
      completed,
      email,
      finishedTracking
    },
    callback
  ) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_details')
            .findOneAndUpdate(
              { user_id: uid },
              {
                $set: {
                  meno: sanitize(meno), // nazov skupiny
                  text: sanitize(text), // popis skupiny
                  start_date: sanitize(start_date),
                  end_date: sanitize(end_date),
                  completed: sanitize(completed),
                  user_id: sanitize(uid),
                  start_miesto: sanitize(start_miesto),
                  number: sanitize(number), // pocet ucastnikov
                  email: sanitize(email), // 0 / 1 moznost kontaktovat po skonceni s dotaznikom
                  finishedTracking: sanitize(finishedTracking),
                  lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
                }
              }
            )
            .then(() => {
              db.close();
              callback({ response: `${uid} successfully updated` });
            })
            .catch(dbError => {
              db.close();
              throw dbError;
            });
        } else {
          throw err;
        }
      }
    );
  },

  sendMessage(message, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (error, db) => {
        if (db) {
          message.pub_date = moment().format('YYYY-MM-DD HH:mm:ss');
          message.pub_date_milseconds = moment().valueOf();

          db.db('cestasnp')
            .collection('traveler_messages')
            .insertOne(securityCheck.sanitizeTravellerMessage(message))
            .then((msgRes) => {
              message._id = msgRes.insertedId;

              db.db('cestasnp')
                .collection('traveler_details')
                .findOneAndUpdate(
                  { user_id: message.user_id },
                  {
                    $set: {
                      finishedTracking: false,
                      end_date: ''
                    }
                  }
                )
                .then(() => {
                  db.close();
                  console.log(`${message.user_id} reactivated`);
                  callback(message);
                })
                .catch(err => {
                  db.close();
                  throw err;
                });
            })
            .catch(err => {
              db.close();
              callback({ error: err });
            });
        } else {
          callback({ error });
        }
      }
    );
  },

  deleteMessage(id, uid, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (error, db) => {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_messages')
            .findOneAndUpdate({ $and: [{_id: new ObjectId(id) }, { user_id: uid }] }, { $set: {
              deleted: true,
              del_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }}, 
            { returnOriginal: false })
            .then((res) => {
              db.close();

              if (res.value) {
                callback(res.value);
              } else {
                callback({ error: 'Správa nebola nájdená.' });
              };
            })
            .catch(err => {
              db.close();
              callback({ error: err });
            });
        } else {
          callback({ error });
        }
      }
    );
  },
  
  setPoisItinerary(pois) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
          return Promise.all(pois.map(item => 
            db.db('cestasnp')
              .collection('pois')
              .findOneAndUpdate({ _id: new ObjectId(item.poi._id) }, 
                { $set: { 'itinerary.near': item.near ? item.near.id : null,
                'itinerary.after': item.after ? item.after.id : null } },
                { returnOriginal: false })
          )).then(r => {
            db.close();
            return Promise.resolve(r.map(i => i.value));
          })
          .catch(dbError => {
            db.close();
            return Promise.reject(dbError);
          });
        });
  },

  addPoi(poi) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then( db  => {
          poi.created = moment().format('YYYY-MM-DD HH:mm:ss');

          return db.db('cestasnp')
            .collection('pois')
            .insertOne(securityCheck.sanitizePoi(poi))
            .then((poiRes) => {
              poi._id = poiRes.insertedId;

              return this.fillPoiInfo(db, poi._id, poi).then(poi => {
                return Promise.resolve(poi);
              });
            }).finally(() => db.close());
      }
    )
  },

  updatePoi({uid, id, note, ...poi}) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then( db  => {
          poi.modified_by = uid;
          poi.modified = moment().format('YYYY-MM-DD HH:mm:ss');
          poi.modified_note = note;

          return db.db('cestasnp')
            .collection('pois')
            .findOne({ _id: new ObjectId(id) }).then(current => {
              if (!current) {
                return Promise.reject('Dôležité miesto nebolo nájdené.');
              }
              delete current._id;
              current.poiId = id;

              poi.user_id = current.user_id;
              poi.created = current.created;

              return db.db('cestasnp')
                .collection('pois_history').insertOne(current).then(resInsert => {
                  poi.historyId = resInsert.insertedId.toString();

                  return db.db('cestasnp')
                    .collection('pois')
                    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: securityCheck.sanitizePoi(poi) },
                      { returnOriginal: false })
                    .then(res => {
                      if (res.value) {
                        return this.fillPoiInfo(db, res.value._id, res.value);
                      } else {
                        return Promise.reject('Dôležité miesto nebolo nájdené.');
                      }
                    });
                }                  
                );
            }).finally(() => db.close());
      }
    )
  },

  getPois(db) {
    return db.db('cestasnp').collection('pois').find().toArray()
      .then(pois => {
        const uids = this.getUids(pois, [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

        return this.getUserNames(db, uids).then(users => {
          pois.forEach(poi => {
            poi.created_by_name = this.findUserName(poi.user_id, users);
            poi.modified_by_name = this.findUserName(poi.modified_by, users);
            poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
          });

          return Promise.resolve(pois);
        });
      });
  },

  getPoisMy(db, uid) {
    const s_uid = sanitize(uid);

    return this.findByWithDB(db, 'users', { uid: s_uid })
    .then(user => { 
      const poisNotMy = (user[0].poisNotMy || []).map(v => new ObjectId(v));
      const poisMy = (user[0].poisMy || []).map(v => new ObjectId(v));

      return db.db('cestasnp').collection('pois').find(
        { $and: [ 
          { _id: { $nin: poisNotMy} },
          { $or: [{ _id: { $in: poisMy } }, { user_id: s_uid }] }
        ] }).toArray()
        .then(pois => {
          const uids = this.getUids(pois, [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

          return this.getUserNames(db, uids).then(users => {
            pois.forEach(poi => {
              poi.created_by_name = this.findUserName(poi.user_id, users);
              poi.modified_by_name = this.findUserName(poi.modified_by, users);
              poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
            });

            return Promise.resolve(pois);
          });
        });
      });
  },

  deletePoi(uid, id, note) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        return db.db('cestasnp').collection('pois').findOneAndUpdate({ $and: [{ _id: new ObjectId(id) }, { user_id: uid }] },
          { $set: { deleted: moment().format('YYYY-MM-DD HH:mm:ss'), deleted_by: uid, deleted_note: note } }, 
          { returnOriginal: false })
        .then(res => {
          if (res.value) {
            return this.fillPoiInfo(db, res.value._id, res.value);
          } else {
            return Promise.reject('Dôležité miesto nebolo nájdené.');
          }
        })
        .finally(() => db.close());
      });
  },

  togglePoiMy(uid, id) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        return db.db('cestasnp').collection('pois').findOne({ _id: new ObjectId(id) }).then(poi => {
          if (!poi) {
            return Promise.reject('Dôležité miesto nebolo nájdené.');            
          }

          return db.db('cestasnp').collection('users').findOne({ uid }).then(userDetails => {
            if (!userDetails) {
              return Promise.reject('Neexistujúci užívateľ.');
            }

            const isMy = 
              (userDetails.poisMy && userDetails.poisMy.indexOf(id) >= 0)
              || (poi.user_id == userDetails.uid && !(userDetails.poisNotMy && userDetails.poisNotMy.indexOf(id) >= 0));

            if (isMy) {
              userDetails.poisMy = (userDetails.poisMy || []).filter(t => t != id);
              userDetails.poisNotMy = userDetails.poisNotMy || [];

              if (poi.user_id == userDetails.uid && userDetails.poisNotMy.indexOf(id) < 0) {
                userDetails.poisNotMy.push(id);
              }
            } else {
              userDetails.poisNotMy = (userDetails.poisNotMy || []).filter(t => t != id);
              userDetails.poisMy = userDetails.poisMy || [];

              if (poi.user_id != userDetails.uid && userDetails.poisMy.indexOf(id) < 0) {
                userDetails.poisMy.push(id);
              }
            }

            return db.db('cestasnp').collection('users').findOneAndUpdate({ uid },
              { $set: { 
                poisMy: userDetails.poisMy, 
                poisNotMy: userDetails.poisNotMy } }, 
              { returnOriginal: false })
            .then(res => {
              if (res.value) {
                return res.value;
              } else {
                return Promise.reject('Neexistujúci užívateľ.');
              }
            });
          });
        }).finally(() => db.close());
      });
  },

  fillPoiInfo(db, poiId, poiValue) {
    return Promise.all([
      poiValue,
      db.db('cestasnp').collection('pois_history').find({ poiId: poiId.toString() }).sort({ modified: -1 }).toArray(),
    ]).then(([poi, history]) => {
      if (!poi) {
        return Promise.reject('Dôležité miesto nebolo nájdené.');
      }

      const uids = this.getUids([poi].concat(history || []), [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

      return this.getUserNames(db, uids).then(users => {
        [poi].concat(history || []).forEach(poi => {
          poi.created_by_name = this.findUserName(poi.user_id, users);
          poi.modified_by_name = this.findUserName(poi.modified_by, users);
          poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
        });

        poi.history = history || [];

        poi.history.forEach(h => {
          if (h.itinerary && (h.itinerary.near || h.itinerary.after)) {
            h.guideposts = getNearGuideposts(h.itinerary.near || h.itinerary.after, h.coordinates).guideposts;
          }
        });

        if (poi.itinerary && (poi.itinerary.near || poi.itinerary.after)) {
          poi.guideposts = getNearGuideposts(poi.itinerary.near || poi.itinerary.after, poi.coordinates).guideposts;
        } else {
          poi.guideposts = findNearestGuideposts(findNearestPoint(poi.coordinates).coordinates).guideposts;
        }

        return Promise.resolve(poi);
      });
    });
  },

  getPoi(db, poiId) { 
    const sPoiId = sanitize(poiId);

    return this.fillPoiInfo(db, sPoiId, 
      db.db('cestasnp').collection('pois').findOne({ _id: new ObjectID(sPoiId) }));
  },

  toggleArticleMy(uid, id) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        return db.db('cestasnp').collection('articles').findOne({ sql_article_id: id }).then(article => {
          if (!article) {
            return Promise.reject('Článok nebol nájdený.');            
          }

          return db.db('cestasnp').collection('users').findOne({ uid }).then(userDetails => {
            if (!userDetails) {
              return Promise.reject('Neexistujúci užívateľ.');
            }

            const isMy = 
              (userDetails.articlesMy && userDetails.articlesMy.indexOf(id) >= 0)
              || (article.created_by == userDetails.uid && !(userDetails.articlesNotMy && userDetails.articlesNotMy.indexOf(id) >= 0));

            if (isMy) {
              userDetails.articlesMy = (userDetails.articlesMy || []).filter(t => t != id);
              userDetails.articlesNotMy = userDetails.articlesNotMy || [];

              if (article.created_by == userDetails.uid && userDetails.articlesNotMy.indexOf(id) < 0) {
                userDetails.articlesNotMy.push(id);
              }
            } else {
              userDetails.articlesNotMy = (userDetails.articlesNotMy || []).filter(t => t != id);
              userDetails.articlesMy = userDetails.articlesMy || [];

              if (article.created_by != userDetails.uid && userDetails.articlesMy.indexOf(id) < 0) {
                userDetails.articlesMy.push(id);
              }
            }

            return db.db('cestasnp').collection('users').findOneAndUpdate({ uid },
              { $set: { 
                articlesMy: userDetails.articlesMy, 
                articlesNotMy: userDetails.articlesNotMy } }, 
              { returnOriginal: false })
            .then(res => {
              if (res.value) {
                return res.value;
              } else {
                return Promise.reject('Neexistujúci užívateľ.');
              }
            });
          });
        }).finally(() => db.close());
      });
  },

  fillArticleInfo(db, sql_article_id, articleValue) {
    return Promise.all([
      articleValue,
      db.db('cestasnp').collection('articles_history').find({ sql_article_id: sql_article_id }).sort({ modified: -1 }).toArray(),
    ]).then(([article, history]) => {
      if (!article) {
        return Promise.reject('Článok nebol nájdený.');
      }

      const uids = this.getUids([article].concat(history || []), [p => p.created_by, 
        p => p.created_by_user_sql_id, p => p.modified_by, p => p.modified_by_user_sql_id]);

      return this.getUserNames(db, uids).then(users => {
        [article].concat(history || []).forEach(a => {
          if (!a.created_by) {
             a.created_by = a.created_by_user_sql_id; 
          }

          if (!a.modified_by) {
            a.modified_by = a.modified_by_user_sql_id; 
          }

          a.created_by_name = this.findUserName(a.created_by || a.created_by_user_sql_id, users); 
          a.modified_by_name = this.findUserName(a.modified_by || a.modified_by_user_sql_id, users);
        });

        article.history = history || [];

        return Promise.resolve(article);
      });
    });
  },

  getArticlesMy(db, uid) {
    const s_uid = sanitize(uid);

    return this.findByWithDB(db, 'users', { uid: s_uid })
    .then(user => db.db('cestasnp').collection('articles').find(
        { $and: [ 
          { sql_article_id: { $nin: (user[0].articlesNotMy || []) } },
          { $or: [{ sql_article_id: { $in: (user[0].articlesMy || []) } }, { created_by: s_uid }] },
        ]}).toArray()
      .then(articles => {
        const uids = this.getUids(articles, [p => p.created_by, 
          p => p.created_by_user_sql_id, p => p.modified_by, p => p.modified_by_user_sql_id]);

        return this.getUserNames(db, uids).then(users => {
          articles.forEach(a => {
            if (!a.created_by) {
              a.created_by = a.created_by_user_sql_id; 
            }
  
            if (!a.modified_by) {
              a.modified_by = a.modified_by_user_sql_id; 
            }

            a.created_by_name = this.findUserName(a.created_by || a.created_by_user_sql_id, users) 
            a.modified_by_name = this.findUserName(a.modified_by || a.modified_by_user_sql_id, users);
          });

          return Promise.resolve(articles);
        });
      }));
  },

  addArticle(article) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then( db  => {
        article.created = moment().format('YYYY-MM-DD HH:mm:ss'); 
        article.sql_article_id = sanitize(parseInt(article.sql_article_id));

        return db.db('cestasnp').collection("users")
          .findOne({ uid: article.created_by }).then(user => {

            if (user.articlesRole != "admin") {
              article.state = -1;
            }

            return this.latestWithDB(db, 'articles', { sql_article_id: article.sql_article_id }).then( duplicate => {

              if (duplicate && duplicate.length > 0) {
                return Promise.reject(`Článok s ID ${article.sql_article_id} už existuje.`);
              }

              return db.db('cestasnp')
                .collection('articles')
                .insertOne(securityCheck.sanitizeArticle(article))
                .then((articleRes) => {
                  article._id = articleRes.insertedId;

                  return this.fillArticleInfo(db, article.sql_article_id, article).then(article => {
                    return Promise.resolve(article);
                  });
                });
          });
        }).finally(() => db.close());
      }
    )
  },

  updateArticle({uid, sql_article_id, note, ...article}) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then( db  => {
          const s_id = sanitize(parseInt(sql_article_id));
          const s_uid = sanitize(uid);
          article.modified_by = s_uid;
          article.modified = moment().format('YYYY-MM-DD HH:mm:ss');
          article.note = sanitize(note);
          article.sql_article_id = s_id;

          return db.db('cestasnp').collection("users")
            .findOne({ uid: s_uid }).then(user => {

            if (user.articlesRole != "admin") {
              article.state = -1;
            }

            const forReview = (article.state == -1);

            return db.db('cestasnp')
              .collection('articles')
              .findOne({ sql_article_id: s_id }).then(current => {
                if (!current) {
                  return Promise.reject('Článok nebol nájdený.');
                }
                
                if (!forReview) {
                  delete current._id;
                }

                article.created_by = current.created_by || current.created_by_user_sql_id;
                article.created = current.created;

                return db.db('cestasnp')
                  .collection('articles_history').insertOne(forReview ? securityCheck.sanitizeArticle(article) : current).then(resInsert => {
                    if (forReview) {
                      return this.fillArticleInfo(db, s_id, current);
                    } 
                    
                    article.historyId = resInsert.insertedId.toString();

                    return db.db('cestasnp')
                      .collection('articles')
                      .findOneAndUpdate({ sql_article_id: s_id }, { $set: securityCheck.sanitizeArticle(article) },
                        { returnOriginal: false })
                      .then(res => {
                        if (res.value) {
                          return this.fillArticleInfo(db, res.value.sql_article_id, res.value);
                        } else {
                          return Promise.reject('Článok nebol nájdený.');
                        }
                      });
                  }                  
                );
              });
            }).finally(() => db.close());
      }
    )
  },
};

module.exports = DB;
