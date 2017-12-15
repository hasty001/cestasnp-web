const mongodb = require('mongodb')
require('dotenv').config()

const DB = function () {
  this.url = process.env.MONGO_URI
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
  newestSorted: function (collection, sortBy = {}, callback, filterBy = {}) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection
          .find(filterBy)
          .limit(10)
          .sort(sortBy)
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
  nextSorted: function (collection, sortBy = {}, next = 0, callback, filterBy = {}) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection
          .find(filterBy)
          .limit(10)
          .skip(10 * next)
          .sort(sortBy)
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
