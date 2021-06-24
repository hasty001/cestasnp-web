const express = require('express');
const DB = require('../db/db');
const { escape, escapeImg, escapeDate } = require('../util/escapeUtils');
const _const = require('../../const');
const { momentDate, momentDateTime } = require('../util/momentUtils');

const db = new DB();

const router = express.Router();

const getJourneys = (dbRef) =>
  db.findBy(dbRef, _const.DetailsTable, {}, 
    { projection: { user_id: 1, finishedTracking: 1, start_date: 1, lastUpdated: 1, url_name: 1 } }, { start_date: -1 })
    .then(travellers => {
      var travellersIds = travellers.map(({user_id}) => user_id);

      travellers.forEach(t => {
        t.modified = momentDateTime(t.start_date || t.lastUpdated);
      });

      return Promise.all([
        db.findBy(dbRef, _const.MessagesTable, {}, { projection: { user_id: 1, pub_date: 1 } }, { pub_date: -1 }),
        db.findBy(dbRef, _const.MessagesTable, { $and: [ { img : { $ne: null } }, { img : { $ne: "None" } }, { 'img.secure_url': null } ]}, { projection: { user_id: 1, img: 1 } }),
        db.findBy(dbRef, _const.MessagesTable, { 'img.secure_url': { $ne: null } }, { projection: { user_id: 1, 'img.secure_url': 1 } })
      ]).then(([messages, imagesOld, imagesNew]) => {
        messages.map(msg => {
          const i = travellersIds.indexOf(msg.user_id);
          if (i >= 0 && msg.pub_date && momentDateTime(msg.pub_date) > travellers[i].modified)
            travellers[i].modified = momentDateTime(msg.pub_date);
        });
          
        imagesOld.concat(imagesNew).map(msg => {
          const i = travellersIds.indexOf(msg.user_id);
          const image = escapeImg(msg.img);

          if (image && i >= 0) {
            if (!travellers[i].images) {
              travellers[i].images = [];
            }

            travellers[i].images.push(image);
          }
        });

        return travellers;
      });
    }).catch(e => {
      console.error('error ', e);
    });

router.get('*', (req, res) => {
  Promise.all([
    db.findBy(req.app.locals.db, _const.PoisTable, _const.FilterPoiNotDeleted, { projection: { modified: 1, created: 1, img_url: 1,  } }, { created: -1 }), 
    db.findBy(req.app.locals.db, _const.ArticlesTable, _const.ArticlesFilterBy, { projection: { modified: 1, created: 1, sql_article_id: 1} }, { created: -1 }), 
    getJourneys(req.app.locals.db)])
  .then(([pois, articles, journeys]) => {
      const urls = 
        [pois.map(p => {
        const image = escapeImg(p.img_url);
        return `  <url>
    <loc>https://cestasnp.sk/pred/pois/${p._id}</loc>
    <lastmod>${escapeDate(p.modified || p.created)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
    ${image ? `<image:image>
      <image:loc>${image}</image:loc>
    </image:image>` : ""}
  </url>`; } ).join('\n'),
        articles.map(p => 
        `  <url>
    <loc>https://cestasnp.sk/pred/articles/article/${p.sql_article_id}</loc>
    <lastmod>${escapeDate(p.modified || p.created)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>`).join('\n'),
        journeys.map(p => 
        `  <url>
    <loc>https://cestasnp.sk/na/${p.url_name || p.user_id}</loc>
    <lastmod>${escapeDate(p.modified)}</lastmod>
    <changefreq>${!p.finishedTracking ? 'daily' : 'yearly'}</changefreq>
    <priority>${!p.finishedTracking ? '1' : '0.4'}</priority>
    ${p.images ? p.images.map(img => `<image:image>
      <image:loc>${img}</image:loc>
    </image:image>`).join("\n") : ""}
  </url>`).join('\n'),
      ].join('\n');

      res.contentType("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`);
    }).catch(error => {
      console.error(error);
      res.status(500).send(error.toString());
    });
});

module.exports = router;
