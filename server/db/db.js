// TODO - lot of reapeating code refactor when possible
const { MongoClient, ObjectID } = require('mongodb');
const sanitize = require('mongo-sanitize');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const Validation = require('./validation');
const { getNearGuideposts, findNearestGuideposts, findNearestPoint } = require('../util/gpsUtils');

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
      .find({ $or: [ { uid : { $in: uids } }, { sql_user_id : { $in: uids } } ] }, { uid: 1, sql_user_id: 1, name: 1 })
      .toArray();

    const getDetails =  db.db('cestasnp')
      .collection('traveler_details')
      .find({ user_id : { $in: uids } }, { user_id: 1, meno: 1 })
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
            
            db.close();
            callback(docs);
          });
        }).catch(e => { db.close(); console.error(e); callback({ error: e.toString() }); });
      })
    .catch(e => { console.error(e); callback({ error: e.toString() }); });
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
                { $set: { 'itinerary.near': item.near ? item.near.id : null,
                'itinerary.after': item.after ? item.after.id : null } },
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
            .findOne({ _id: new ObjectID(id) }).then(current => {
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
                    .findOneAndUpdate({ _id: new ObjectID(id) }, { $set: securityCheck.sanitizePoi(poi) },
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

  getPois() {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => 
        db.db('cestasnp').collection('pois').find().toArray()
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
        })
        .finally(() => db.close));
  },

  deletePoi(uid, id, note) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        return db.db('cestasnp').collection('pois').findOneAndUpdate({ _id: new ObjectID(id) },
          { $set: { deleted: moment().format('YYYY-MM-DD HH:mm:ss'), deleted_by: uid, deleted_note: note } }, 
          { returnOriginal: false })
        .then(res => {
          if (res.value) {
            return this.fillPoiInfo(db, res.value._id, res.value);
          } else {
            return Promise.reject('Dôležité miesto nebolo nájdené.');
          }
        })
        .finally(() => db.close);
      });
  },

  togglePoiMy(uid, id) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        return db.db('cestasnp').collection('pois').findOne({ _id: new ObjectID(id) }).then(poi => {
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
        }).finally(() => db.close);
      });
  },

  fillPoiInfo(db, poiId, poiValue) {
    return  Promise.all([
      poiValue,
      db.db('cestasnp').collection('pois_history').find({ poiId: poiId.toString() }).sort({ modified: -1 }).toArray(),
    ]).then(([poi, history]) => {
      const uids = this.getUids([poi].concat(history), [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

      return this.getUserNames(db, uids).then(users => {
        [poi].concat(history).forEach(poi => {
          poi.created_by_name = this.findUserName(poi.user_id, users);
          poi.modified_by_name = this.findUserName(poi.modified_by, users);
          poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
        });

        poi.history = history;

        history.forEach(h => {
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

  getPoi(poiId) {
    return MongoClient.connect(
      process.env.MONGODB_ATLAS_URI,
      { useNewUrlParser: true })
      .then(db => {
        const sPoiId = sanitize(poiId);

        return this.fillPoiInfo(db, sPoiId, db.db('cestasnp').collection('pois').findOne({ _id: new ObjectID(sPoiId) }))
          .finally(() => db.close);
      });
  },
};

module.exports = DB;
