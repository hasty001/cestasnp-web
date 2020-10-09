const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { getMeta } = require('./server/meta');

const app = express();
const http = require('http').Server(app);

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

app.get('/*', (req, res) => {
  fs.readFile(path.join(root, 'index.html'), 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).send('An error occurred')
    }

    getMeta(req.path, (meta, title) => res.send(
      data.replace(
        '<!-- SSR META -->',
        `<!-- SSR META INSERTED -->
${meta}`).replace('<title>CestaSNP</title>', `<title>${title}</title>`)));
  })
});

http.listen(process.env.PORT || 3000, () => {
  console.log(
    `Listening on ${process.env.PORT ? process.env.PORT : 'localhost:3000'}`
  );
});
