const mongodb = require('mongodb')
const MONGO_URI = require('../mongo_uri')

const DB = function () {
  this.url = MONGO_URI.url
}

DB.prototype = {
  all: function (collection, callback) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection.find().toArray(function (err, docs) {
          if (docs) {
            callback(docs)
          } else {
            throw err
          }
        })
      } else {
        throw err
      }
    })
  },
  newestSorted: function (collection, sortedBy = {}, callback) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection
          .find()
          .limit(10)
          .sort(sortedBy)
          .toArray(function (err, docs) {
            if (docs) {
              callback(docs)
            } else {
              throw err
            }
          })
      } else {
        throw err
      }
    })
  },
  nextSorted: function (collection, sortedBy = {}, next = 0, callback) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection
          .find()
          .limit(10)
          .skip(10 * next)
          .sort(sortedBy)
          .toArray(function (err, docs) {
            if (docs) {
              callback(docs)
            } else {
              throw err
            }
          })
      } else {
        throw err
      }
    })
  },
  findBy: function (collection, findBy = {}, callback) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection
        .find(findBy)
        .toArray(function (err, docs) {
          if (docs) {
            callback(docs)
          } else {
            throw err
          }
        })
      } else {
        throw err
      }
    })
  }
}

module.exports = DB
