const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

app.use('/pois', require('./controllers/pois'))

app.use('/articles', require('./controllers/articles'))

app.use(express.static('client/build'))

http.listen(3000, function () {
  console.log('listening on *:3000')
})
