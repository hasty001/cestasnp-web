const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build/index.html'))
})

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})

app.use(express.static('client/build'))
