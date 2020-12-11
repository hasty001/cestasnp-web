const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const { getMeta } = require('./server/meta');
const { MongoClient } = require('mongodb');
const compression = require('compression');

const app = express();
const http = require('http').Server(app);

const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const moment = require('moment-timezone');
moment.tz.setDefault('Europe/Vienna');

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

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    // Will not compress responses, if this header is present
    return false;
  }
  // Resort to standard compression
  return compression.filter(req, res);
};

// Compress all HTTP responses
app.use(compression({
  filter: shouldCompress,
  threshold: 1024
}));

app.use(express.static(root));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api controllers
app.get('/api', (req, res) => {
  res.json({ status: '200' });
});

app.use('/api/pois', require('./server/controllers/pois'));

app.use('/api/itinerary', require('./server/controllers/itinerary'));

app.use('/api/articles', require('./server/controllers/articles'));

app.use('/api/traveller', require('./server/controllers/traveller'));

app.use('/api/cloudinary', require('./server/controllers/cloudinary'));

app.use('/sitemap.xml', require('./server/controllers/sitemap'));

app.get('/*', (req, res) => {
  fs.readFile(path.join(root, 'index.html'), 'utf8')
  .then(data => getMeta(req.app.locals.db, req.path)
    .then(meta => 
      res.send(meta ? 
        data
          .replace(/<!-- SSR META -->.*<!-- SSR META -->/s,
            `<!-- SSR META INSERTED -->${meta || ''}\n<!-- SSR META INSERTED -->`)
        : data))
    .catch((error) => {
      console.error(error);
      res.send(data);
    }))
  .catch((error) => {
    console.error(error);
    res.status(500).send('An error occurred');
  });
});

MongoClient.connect(
  process.env.MONGODB_ATLAS_URI,
  { useNewUrlParser: true }).then(db => {
    app.locals.db = db;

    http.listen(process.env.PORT || 3000, () => {
      console.log(
        `Listening on ${process.env.PORT ? process.env.PORT : 'localhost:3000'}`
      );
    });
  }).catch((error) => {
    console.error(error);
  });
