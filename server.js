const mongodb = require('mongodb')
const MONGO_URI = require('./mongo_uri')
const express = require('express')
const path = require('path')

const app = express()
const http = require('http').Server(app)

const DB = () => {
  mongodb.MongoClient.connect(MONGO_URI.url, function (err, db) {
    if (err) throw err
    else {
      console.log('connected')
      db.close()
    }
  })
}

DB()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})

app.use(express.static('client/build'))
