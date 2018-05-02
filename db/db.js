const mongodb = require('mongodb');
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
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection(collection);
        resCollection.find().toArray(function(err, docs) {
          if (docs) {
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  newestSorted: function(collection, sortBy = {}, callback, filterBy = {}) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection(collection);
        resCollection
          .find(filterBy)
          .sort(sortBy)
          .limit(3)
          .toArray(function(err, docs) {
            if (docs) {
              callback(docs);
              db.close();
            } else {
              throw err;
              db.close();
            }
          });
      } else {
        throw err;
      }
    });
  },

  nextSorted: function(collection, sortBy = {}, next = 0, callback, filterBy = {}) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      let page = next - 1;
      page = page < 0 ? 0 : page;
      if (db) {
        const resCollection = db.collection(collection);
        resCollection
          .find(filterBy)
          .sort(sortBy)
          .limit(8)
          .skip(8 * page)
          .toArray(function(err, docs) {
            if (docs) {
              callback(docs);
              db.close();
            } else {
              throw err;
              db.close();
            }
          });
      } else {
        throw err;
      }
    });
  },

  findBy: function(collection, findBy = {}, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection(collection);
        resCollection.find(findBy).toArray(function(err, docs) {
          if (docs) {
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  countCollection: function(collection, findBy = {}, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection(collection);
        resCollection.count(findBy).then(data => {
          try {
            callback(data);
            db.close();
          } catch (err) {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  addArticle: function(article, collection) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        let resCollection = db.collection(collection);
        resCollection.save(article).then(() => {
          try {
            db.close();
          } catch (err) {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  increaseArticleCount: function(articleId, callback) {
    let sArticleId = sanitize(articleId);
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        let resCollection = db.collection('articles');
        let oid = new ObjectId(sArticleId);
        resCollection.findOneAndUpdate({ _id: oid }, { $inc: { article_views: 1 } }).then(res => {
          try {
            callback(res);
            db.close();
          } catch (err) {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  // traveller related

  getTravellerDetails: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('traveler_details');
        resCollection.find({ user_id: sTravellerId }).toArray(function(err, docs) {
          if (docs) {
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  getTravellerArticle: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('articles');
        resCollection.find({ created_by_user_sql_id: sTravellerId }).toArray(function(err, docs) {
          if (docs) {
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  getTravellerMessages: function(travellerId, callback) {
    let sTravellerId = sanitize(travellerId);
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('traveler_messages');
        resCollection.find({ user_id: sTravellerId }).toArray(function(err, docs) {
          if (docs) {
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  getTravellerComments: function(articleId, travellerId, callback) {
    let sArticleId = sanitize(articleId);
    let sTravellerId = sanitize(travellerId);
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        if (sArticleId === 0) {
          const resCollection = db.collection('traveler_comments');
          resCollection.find({ 'travellerDetails.id': sTravellerId }).toArray(function(err, docs) {
            if (docs) {
              callback(docs);
              db.close();
            } else {
              throw err;
              db.close();
            }
          });
        } else {
          const resCollection = db.collection('article_comments');
          resCollection.find({ article_sql_id: sArticleId }).toArray(function(err, docs) {
            if (docs) {
              callback(docs);
              db.close();
            } else {
              throw err;
              db.close();
            }
          });
        }
      } else {
        throw err;
      }
    });
  },

  getTravellerLastMessage: function(travellerIds, callback) {
    if (!Array.isArray(travellerIds)) {
      throw 'Traveller IDs not an array';
      return;
    }

    let typeCheck = 0;
    let sTravellerIds = travellerIds.map(id => {
      if (typeof id !== 'number') typeCheck += 1;
      return sanitize(id);
    });

    if (typeCheck !== 0) {
      throw 'Traveller IDs not numbers';
      return;
    }

    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('traveler_messages');
        resCollection.find({ user_id: { $in: sTravellerIds } }).toArray(function(err, docs) {
          if (docs) {
            docs.sort(function(a, b) {
              return new Date(b.pub_date) - new Date(a.pub_date);
            });
            callback(docs);
            db.close();
          } else {
            throw err;
            db.close();
          }
        });
      } else {
        throw err;
      }
    });
  },

  addCommentOldTraveller: function(comment, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        let resCollection = db.collection('article_comments');
        /// see highest comment number
        resCollection
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
          })
          .catch(err => {
            throw err;
          });
      } else {
        throw err;
      }
    });
  },

  addCommentNewTraveller: function(comment, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        let resCollection = db.collection('traveler_comments');
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
    });
  }
};

module.exports = DB;
