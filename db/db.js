const MongoClient = require('mongodb').MongoClient;
const sanitize = require('mongo-sanitize');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const Validation = require('./validation');
const securityCheck = new Validation();

const DB = function() {
  this.url = process.env.MONGODB_ATLAS_URI;
};

DB.prototype = {
  all: function(collection, callback) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find()
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  newestSorted: function(collection, sortBy = {}, callback, filterBy = {}) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find(filterBy)
            .sort(sortBy)
            .limit(3)
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  nextSorted: function(collection, sortBy = {}, next = 0, callback, filterBy = {}) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        let page = next - 1;
        page = page < 0 ? 0 : page;
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find(filterBy)
            .sort(sortBy)
            .limit(8)
            .skip(8 * page)
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  findBy: function(collection, findBy = {}, callback) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .find(findBy)
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  countCollection: function(collection, findBy = {}, callback) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .count(findBy)
            .then(data => {
              db.close();
              callback(data);
            })
            .catch(err => {
              db.close();
              throw err;
            });
        } else {
          throw err;
        }
      },
    );
  },

  addArticle: function(article, collection) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection(collection)
            .save(article)
            .then(() => {
              db.close();
            })
            .catch(e => {
              db.close();
              throw err;
            });
        } else {
          throw err;
        }
      },
    );
  },

  increaseArticleCount: function(articleId, callback) {
    let sArticleId = sanitize(articleId);
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          let oid = new ObjectId(sArticleId);
          db.db('cestasnp')
            .collection('articles')
            .findOneAndUpdate({ _id: oid }, { $inc: { article_views: 1 } })
            .then(res => {
              db.close();
              callback(res);
            })
            .catch(err => {
              db.close();
              throw err;
            });
        } else {
          throw err;
        }
      },
    );
  },

  // traveller related

  getTravellerDetails: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_details')
            .find({ user_id: sTravellerId })
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  getTravellerArticle: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection('articles')
            .find({ created_by_user_sql_id: sTravellerId })
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  getTravellerMessages: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_messages')
            .find({ user_id: sTravellerId })
            .toArray(function(err, docs) {
              if (docs) {
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  getTravellerComments: function(articleId, travellerId, callback) {
    let sArticleId = sanitize(articleId);
    let sTravellerId = sanitize(travellerId);
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          if (sArticleId === 0) {
            db.db('cestasnp')
              .collection('traveler_comments')
              .find({ 'travellerDetails.id': sTravellerId })
              .toArray(function(err, docs) {
                if (docs) {
                  db.close();
                  callback(docs);
                } else {
                  db.close();
                  throw err;
                }
              });
          } else {
            db.db('cestasnp')
              .collection('article_comments')
              .find({ article_sql_id: sArticleId })
              .toArray(function(err, docs) {
                if (docs) {
                  callback(docs);
                  db.close();
                } else {
                  db.close();
                  throw err;
                }
              });
          }
        } else {
          throw err;
        }
      },
    );
  },

  getTravellersMessages: function(travellerIds, callback) {
    if (!Array.isArray(travellerIds)) {
      throw 'Traveller IDs not an array';
    }

    let typeCheck = 0;
    let sTravellerIds = travellerIds.map(id => {
      if (typeof id !== 'number') typeCheck += 1;
      return sanitize(id);
    });

    if (typeCheck !== 0) {
      throw 'Traveller IDs not numbers';
    }

    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection('traveler_messages')
            .find({ user_id: { $in: sTravellerIds } })
            .toArray(function(err, docs) {
              if (docs) {
                docs.sort(function(a, b) {
                  return new Date(b.pub_date) - new Date(a.pub_date);
                });
                db.close();
                callback(docs);
              } else {
                db.close();
                throw err;
              }
            });
        } else {
          throw err;
        }
      },
    );
  },

  getTravellerLastMessage: function(travellerId) {
    let connectionURL = this.url;
    return new Promise(function(resolve, reject) {
      MongoClient.connect(
        connectionURL,
        function(err, db) {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_messages')
              .find({ user_id: travellerId })
              .sort({ pub_date: -1 })
              .toArray(function(err, docs) {
                if (docs) {
                  if (docs && docs.length > 0) {
                    db.close();
                    resolve(docs[0]);
                  } else if (docs && docs.length === 0) {
                    db.close();
                    resolve({
                      message: `No messages found for ${travellerId}`,
                      pub_date: new Date(),
                      user_id: travellerId,
                    });
                  } else {
                    db.close();
                    reject(err);
                  }
                }
              });
          } else {
            reject(err);
          }
        },
      );
    });
  },

  addCommentOldTraveller: function(comment, callback) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          db.db('cestasnp')
            .collection('article_comments')
            .find()
            .sort({ sql_comment_id: -1 })
            .limit(1)
            .toArray()
            .then(array => {
              comment.sql_comment_id = array[0].sql_comment_id + 1;
            })
            .then(() => {
              if (securityCheck.checkCommentOldTraveller(comment)) {
                // save comment with new comment id
                db.db('cestasnp')
                  .collection('article_comments')
                  .save(comment)
                  .then(() => {
                    db.close();
                    callback(comment);
                  })
                  .catch(err => {
                    db.close();
                    throw err;
                  });
              } else {
                callback({ error: 'Malicious comment' });
              }
            })
            .catch(err => {
              throw err;
            });
        } else {
          throw err;
        }
      },
    );
  },

  addCommentNewTraveller: function(comment, callback) {
    MongoClient.connect(
      this.url,
      function(err, db) {
        if (db) {
          let resCollection = db.db('cestasnp').collection('traveler_comments');
          /// see highest comment number
          if (securityCheck.checkCommentNewTraveller(comment)) {
            // save comment with new comment id
            resCollection
              .save(comment)
              .then(() => {
                db.close();
                callback(comment);
              })
              .catch(err => {
                db.close();
                throw err;
              });
          } else {
            callback({ error: 'Malicious comment' });
          }
        } else {
          throw err;
        }
      },
    );
  },

  finishTracking: function(userId) {
    let connectionURL = this.url;
    return new Promise(function(resolve, reject) {
      MongoClient.connect(
        connectionURL,
        function(err, db) {
          if (db) {
            db.db('cestasnp')
              .collection('traveler_details')
              .findOneAndUpdate({ user_id: userId }, { $set: { finishedTracking: true } })
              .then(res => {
                db.close();
                resolve(res);
              })
              .catch(err => {
                db.close();
                reject(err);
              });
          } else {
            reject(err);
          }
        },
      );
    });
  },
};

module.exports = DB;
