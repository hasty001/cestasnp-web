const express = require('express')
const path = require('path')
const DB = require('./db/db')

const app = express()
const http = require('http').Server(app)
const database = new DB()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})

app.use(express.static('client/build'))

console.log('lalala')

database.all('pois')
