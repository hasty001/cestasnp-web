const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const root = path.join(__dirname, '/client/build')

app.use(express.static(root))

// api controllers
app.get('/api', function (req, res) {
  res.json({ status: '200' })
})

app.use('/api/pois', require('./controllers/apiPois'))

app.use('/api/articles', require('./controllers/apiArticles'))

app.get('/*', function (req, res) {
  res.sendFile('index.html', { root })
})

http.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})
