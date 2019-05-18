const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { admin } = require('./server/util/firebase')

const app = express();
const http = require('http').Server(app);
const root = path.join(__dirname, '/client/build');

if (process.env.PORT) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

app.use(express.static(root));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api controllers
app.get('/api', function(req, res) {
  res.json({ status: '200' });
});

app.use('/api/pois', require('./server/controllers/pois'));

app.use('/api/articles', require('./server/controllers/articles'));

app.use('/api/traveller', require('./server/controllers/traveller'));

// console.log('hello');


app.get('/*', function(req, res) {
  res.sendFile('index.html', { root });
});

http.listen(process.env.PORT || 3000, function() {
  console.log(`Listening on ${process.env.PORT ? process.env.PORT : 'localhost:3000'}`);
});
