const mongodb = require('mongodb')
const MONGO_URI = require('../mongo_uri')

const DB = function () {
  this.url = MONGO_URI.url
}

DB.prototype = {
  all: function (collection) {
    mongodb.MongoClient.connect(this.url, function (err, db) {
      if (db) {
        const resCollection = db.collection(collection)
        resCollection.find().toArray(function (err, docs) {
          if (docs) {
            console.log(docs)
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
