const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

app.get('/pred', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

app.get('/na', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

app.get('/kontakt', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

app.get('/api', function (req, res) {
  res.json({ status: '200' })
})

app.use('/api/pois', require('./controllers/pois'))

app.use('/api/articles', require('./controllers/articles'))

app.use(express.static('client/build'))

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})
