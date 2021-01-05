const express = require('express');
const DB = require('../db/db');
const { escape, escapeImg, escapeDate } = require('../util/escapeUtils');

const db = new DB();

const router = express.Router();

const getJourneys = () =>
  db.findBy('traveler_details')
    .then(travellers => {
      var travellersIds = travellers.map(({user_id}) => user_id);

      return db.findBy('traveler_messages').then(messages => {
        messages.map(msg => {
          const i = travellersIds.indexOf(msg.user_id);
          if (i >= 0 && (!travellers[i].modified || new Date(msg.pub_date) > travellers[i].modified))
            travellers[i].modified = new Date(msg.pub_date);
          
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
  Promise.all([db.findBy('pois', { deleted: null }), db.findBy('articles'), getJourneys()])
  .then(([pois, articles, journeys]) => {

      const urls = 
        [pois.map(p => {
        const image = escapeImg(p.img_url);
        return `  <url>
    <loc>https://cestasnp.sk/pred/pois/${p._id}</loc>
    <lastmod>${escapeDate(p.modified || p.created)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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
    <loc>https://cestasnp.sk/na/${p.user_id}</loc>
    <lastmod>${escapeDate(p.modified || p.start_date)}</lastmod>
    <changefreq>${!p.finishedTracking ? 'daily' : 'yearly'}</changefreq>
    <priority>${!p.finishedTracking ? '1' : '0.8'}</priority>
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
      res.sendStatus(500);
    });
});

module.exports = router;
