const express = require('express');
const DB = require('../db/db');

const db = new DB();

const router = express.Router();

const getJourneys = () =>
  db.findBy('traveler_details')
    .then(travellers => {
      var travellersIds = travellers.map(({user_id}) => user_id);

      return db.findBy('traveler_messages').then(messages => {
        messages.map(msg => {
          var i = travellersIds.indexOf(msg.user_id);
          if (i >= 0 && (!travellers[i].modified || new Date(msg.pub_date) > travellers[i].modified))
            travellers[i].modified = new Date(msg.pub_date);
        });

        return travellers;
      });
    }).catch(e => {
      console.error('error ', e);
    });

const toDate = (date) => {
  try {
    if (!date) {
      return "";
    }

   const d = new Date(date);
   if (isNaN(d)) {
     return "";
   }

   return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  } catch {
    return "";
  }
}

router.get('*', (req, res) => {
  Promise.all([db.findBy('pois', { deleted: null }), db.findBy('articles'), getJourneys()])
  .then(([pois, articles, journeys]) => {

      const urls = 
        [pois.map(p => 
        `  <url>
    <loc>https://cestasnp.sk/pred/pois/${p._id}</loc>
    <lastmod>${toDate(p.modified || p.created)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join(''),
        articles.map(p => 
        `  <url>
    <loc>https://cestasnp.sk/pred/articles/article/${p.sql_article_id}</loc>
    <lastmod>${toDate(p.modified || p.created)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>`).join(''),
        journeys.map(p => 
        `  <url>
    <loc>https://cestasnp.sk/na/${p.user_id}</loc>
    <lastmod>${toDate(p.modified || p.start_date)}</lastmod>
    <changefreq>${!p.finishedTracking ? 'daily' : 'yearly'}</changefreq>
    <priority>${!p.finishedTracking ? '1' : '0.8'}</priority>
  </url>`).join(''),
      ].join('');

      res.contentType("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
    }).catch(error => {
      console.error(error);
      res.sendStatus(500);
    });
});

module.exports = router;
