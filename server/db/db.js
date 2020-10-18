// TODO - lot of reapeating code refactor when possible
const { MongoClient } = require('mongodb');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const Validation = require('./validation');

const securityCheck = new Validation();

// eslint-disable-next-line func-names
const DB = function() {
  this.url = process.env.MONGODB_ATLAS_URI;
};

DB.prototype = {
  all(collection, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find()
            .toArray((toArrErr, docs) => {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw toArrErr;
              }
            });
        } else {
          throw err;
        }
      }
    );
  },

  newestSorted(collection, sortBy = {}, callback, filterBy = {}) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find(filterBy)
            .sort(sortBy)
            .limit(3)
            .toArray((toArrErr, docs) => {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw toArrErr;
              }
            });
        } else {
          throw err;
        }
      }
    );
  },

  nextSorted(collection, sortBy = {}, next = 0, callback, filterBy = {}) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        let page = next - 1;
        page = page < 0 ? 0 : page;
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find(filterBy)
            .sort(sortBy)
            .limit(8)
            .skip(8 * page)
            .toArray((toArrErr, docs) => {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw toArrErr;
              }
            });
        } else {
          throw err;
        }
      }
    );
  },

  findBy(collection, findBy = {}) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        process.env.MONGODB_ATLAS_URI,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection(collection)
              .find(findBy)
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

  countCollection(collection, findBy = {}, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .count(findBy)
            .then(data => {
              db.close();
              callback(data);
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

  getTravellerDetails(travellerId) {
    return new Promise((resolve, reject) => {
      let sTravellerId = sanitize(travellerId);
      // for before FIREBASE users
      if (sTravellerId.length <= 3) {
        sTravellerId = parseInt(sTravellerId, 10);
      }
      MongoClient.connect(
        process.env.MONGODB_ATLAS_URI,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_details')
              .find({ user_id: sTravellerId })
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

  getTravellerArticle(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    // for before FIREBASE users
    if (sTravellerId.length <= 3) {
      sTravellerId = parseInt(sTravellerId, 10);
    }
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection('articles')
            .find({ created_by_user_sql_id: sTravellerId })
            .toArray((toArrayError, docs) => {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw toArrayError;
              }
            });
        } else {
          throw err;
        }
      }
    );
  },

  getTravellerMessages(userId) {
    const connectionURL = process.env.MONGODB_ATLAS_URI;
    return new Promise((resolve, reject) => {
      let sUserId = sanitize(userId);
      // for before FIREBASE users
      if (sUserId.length <= 3) {
        sUserId = parseInt(sUserId, 10);
      }
      MongoClient.connect(
        connectionURL,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_messages')
              .find({ $and: [ { user_id: sUserId }, { deleted: {$ne: true} } ] })
              .toArray((toArrayErr, docs) => {
                if (docs) {
                  db.close();
                  resolve(docs);
                } else {
                  db.close();
                  reject(toArrayErr);
                }
              });
          } else {
            reject(err);
          }
        }
      );
    });
  },

  getTravellerComments(articleId, travellerId, callback) {
    const sArticleId = sanitize(articleId);
    const sTravellerId = sanitize(travellerId);
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true }).then((db) => {
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
          const uids = docs.filter(d => d.uid).map(d => d.uid);

          const getUsers = db.db('cestasnp')
            .collection('users')
            .find({ $or: [ { uid : { $in: uids } }, { sql_user_id : { $in: uids } } ] }, { uid: 1, sql_user_id: 1, name: 1 })
            .toArray();

          const getDetails =  db.db('cestasnp')
            .collection('traveler_details')
            .find({ user_id : { $in: uids } }, { user_id: 1, meno: 1 })
            .toArray();

          return Promise.all([getUsers, getDetails]).then(([users, details]) => {                
            users.forEach(u => {
              const cesta = details.find(t => t.user_id === u.uid || t.user_id === u.sql_user_id);
              if (cesta)
              {
                  u.name = cesta.meno;
                  u.cesta = true;
              }
            });

            docs.forEach(d => {
              if (d.uid) {
                const user = users.find(u => u.uid === d.uid || u.sql_user_id === d.uid);
                if (user) {
                  if (d.username)
                    d.username = user.name;
                  d.name = user.name;
                  d.cesta = user.cesta;
                }
              }

            });
            
            db.close();
            callback(docs);
          });
        }).catch(e => { db.close(); callback({ error: e}); });
      })
    .catch(e => { callback({ error: e }); });
  },

  getTravellersMessages(travellerIds, callback) {
    if (!Array.isArray(travellerIds)) {
      throw new Error('Traveller IDs not an array');
    }

    let typeCheck = 0;
    const sTravellerIds = travellerIds.map(id => {
      if (typeof id !== 'number' && typeof id !== 'string') typeCheck += 1;
      return sanitize(id);
    });

    if (typeCheck !== 0) {
      throw new Error('Traveller IDs not numbers');
    }

    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_messages')
            .find({ $and: [ { user_id: { $in: sTravellerIds } }, { deleted: {$ne: true} } ] })
            .toArray((toArrayError, docs) => {
              if (docs) {
                docs.sort((a, b) => {
                  return new Date(b.pub_date) - new Date(a.pub_date);
                });
                db.close();
                callback(docs);
              } else {
                db.close();
                throw toArrayError;
              }
            });
        } else {
          throw err;
        }
      }
    );
  },

  getTravellerLastMessage(travellerId) {
    const connectionURL = process.env.MONGODB_ATLAS_URI;
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        connectionURL,
        { useNewUrlParser: true },
        (err, db) => {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_messages')
              .find({ $and: [ { user_id: travellerId }, { deleted: {$ne: true} } ] })
              .sort({ pub_date: -1 })
              .toArray((toArrayError, docs) => {
                if (docs) {
                  if (docs && docs.length > 0) {
                    db.close();
                    resolve(docs[0]);
                  } else if (docs && docs.length === 0) {
                    db.close();
                    resolve({
                      message: `No messages found for ${travellerId}`,
                      pub_date: 0,
                      user_id: travellerId
                    });
                  } else {
                    db.close();
                    reject(toArrayError);
                  }
                }
              });
          } else {
            reject(err);
          }
        }
      );
    });
  },

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
                del_date: moment().format('YYYY-MM-DD HH:mm:ss')
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
  
  setPoisItinerary(pois, callback) {
    MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true },
      (err, db) => {
        if (db) {
          Promise.all(pois.map(item => 
            db.db('cestasnp')
              .collection('pois')
              .findOneAndUpdate({ _id: new ObjectId(item.poi._id) }, 
                { $set: { 'itinerary.near': item.near.id } },
                { returnOriginal: false })
          )).then(r => {
            db.close();
            callback(r.map(i => i.value));
          })
          .catch(dbError => {
            db.close();
            callback({ error: dbError });
          });
        } else {
          callback({ error: err });
        }
      }
    );
  },
};

module.exports = DB;
