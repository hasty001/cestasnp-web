const mongodb = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const DB = function() {
  this.url = process.env.MONGO_URI;
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
          .limit(8)
          .sort(sortBy)
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
          .limit(8)
          .skip(8 * page)
          .sort(sortBy)
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
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        let resCollection = db.collection('TEST_articles');
        let oid = new ObjectId(articleId);
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
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('TEST_traveler_details');
        resCollection.find({ user_id: travellerId }).toArray(function(err, docs) {
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
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('TEST_articles');
        resCollection.find({ created_by_user_sql_id: travellerId }).toArray(function(err, docs) {
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
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('TEST_traveler_messages');
        resCollection.find({ user_id: travellerId }).toArray(function(err, docs) {
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

  getTravellerComments: function(articleId, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('TEST_article_comments');
        resCollection.find({ article_sql_id: articleId }).toArray(function(err, docs) {
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

  getTravellerLastMessage: function(travellerIds, callback) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      if (db) {
        const resCollection = db.collection('TEST_traveler_messages');
        resCollection.find({ user_id: { $in: travellerIds } }).toArray(function(err, docs) {
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
  }
};

module.exports = DB;
