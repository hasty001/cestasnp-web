const DB = require('./db/db');
const sanitize = require('mongo-sanitize');
const { ObjectId } = require('mongodb');
const { escape, escapeImg, escapeDate } = require('./util/escapeUtils');
const _const = require('../const');
const { sanitizeUserId } = require('./util/checkUtils');

const db = new DB();

const WebSuffix = " - CestaSNP";
const defImg = "https://cestasnp.sk/logo.png";

const getPublisher = () => 
  `"publisher": {
                  "@type": "Organization",
                    "@id": "cestasnp.sk",
                  "name": "Občianske združenie CestaSNP.sk",
                  "email": "info(at)cestasnp.sk",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Banská Bystrica, Slovakia",
                    "postalCode": "974 01",
                    "streetAddress": "Gaštanová 4"
                  },
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://cestasnp.sk/logo.png",
                    "width": 4544,
                    "height": 1000
                  }
                }`;

const getArticleMeta = (dbRef, articleId) => 
  db
    .findBy(dbRef, _const.ArticlesTable, { sql_article_id: articleId })
    .then(results => {
      if (results && results.length > 0) {
        const getDesc = () => {
          const t = (results[0].introtext || '').replaceAll('<p>', "\n").replaceAll(/<[^>]+>/g, '').replaceAll('  ', ' ').trim();
          const i = t.indexOf(".", 55);
          return i > 0 ? t.slice(0, i + 1) : t;
        };
        const desc = escape(results[0].ogdesc || results[0].metadesc || getDesc());
        
        return db
          .findBy(dbRef, _const.UsersTable, { sql_user_id: results[0].created_by_user_sql_id })
          .then(user => {  
            const author = user && user.length > 0 ? escape(user[0].name) : '';
            const title = escape((results[0].title || 'Článok') + WebSuffix);
            const url = `https://cestasnp.sk/pred/articles/article/${escape(articleId)}`;

            const imgRegEx = 
              () => {
                const res = results[0].introtext && results[0].introtext.match(/["'](https:\/\/res.cloudinary.com\/.*?)["']/);
                return res && res.length > 1 ? res[1] : null;
              };

            const lat =
              () => {
                const res = results[0].fulltext && results[0].fulltext.match(/(&|&amp;|>|\?)+lat=([0-9\.]+)/);
                return res && res.length > 2 ? res[2] : '';
              }; 

            const lon =
              () => {
                const res = results[0].fulltext && results[0].fulltext.match(/(&|&amp;|>|\?)+lon=([0-9\.]+)/);
                return res && res.length > 2 ? res[2] : '';
              }; 

            var meta = `
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta name="keywords" content="${escape(results[0].metakey)}" />
              <meta property="og:url" content="${url}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:type" content="article" />
              <meta property="og:description" content="${desc}"/>
              <meta property="og:image" content="${escapeImg(results[0].ogimg || imgRegEx(), defImg)}" />
              <meta property="og:article:published_time" content="${escapeDate(results[0].publish_up || (results[0].state > 0 ? results[0].created : null))}" />
              <meta property="og:article:modified_time" content="${escapeDate(results[0].modified)}" />
              <meta property="og:article:expiration_time" content="${escapeDate(results[0].publish_down || (results[0].state <= 0 ? results[0].modified : null))}" />
              <meta property="place:location:latitude" content="${escape(results[0].lat || lat())}">
              <meta property="place:location:longitude" content="${escape(results[0].lon || lon())}">`;

            if (results[0].metakey)
              meta += results[0].metakey.split(",").reduce((res, tag) => res + `
              <meta property="og:article:tag" content="${escape(tag.trim())}" />`, "");

            meta += `
              <script type="application/ld+json">
              {
                "@context": "http://schema.org",
                "@type": "Article",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "Article",
                  "@id": "${url}"
                },
                "headline": "${title}",
                "dateCreated": "${escapeDate(results[0].created)}",
                "datePublished": "${escapeDate(results[0].publish_up)}",
                "dateModified": "${escapeDate(results[0].modified)}",
                "expires": "${escapeDate(results[0].publish_down)}",
                "description": "${desc}", 
                "author": {"@type": "Person",
                  "name": "${author}"},
                "image": {
                  "@type": "ImageObject",
                  "url": "${escapeImg(results[0].ogimg, defImg)}"
                },   
                ${getPublisher()}
              }
              </script>`;

            return Promise.resolve(meta);
          });
      }

      return Promise.resolve('');
  });

const getPoiMeta = (dbRef, poiId) => 
  db
    .findBy(dbRef, _const.PoisTable, { _id: new ObjectId(poiId) })
    .then(results => {
      if (results && results.length > 0) {
        return db
          .findBy(dbRef, _const.UsersTable, { uid: results[0].uid })
          .then(user => {  
            const author = user && user.length > 0 ? escape(user[0].name) : '';
            const title = escape((results[0].name || 'Dôležité miesto') + WebSuffix);
            const url = `https://cestasnp.sk/pred/pois/${escape(poiId)}`;

            const desc = escape(results[0].text);
            const tags = [results[0].category, results[0].water ? "voda" : null, results[0].food ? "jedlo" : null].filter(s => s);

            var meta = `
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta name="keywords" content="${escape(tags.join(","))}" />
              <meta property="og:url" content="${url}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:type" content="article" />
              <meta property="og:description" content="${desc}"/>
              <meta property="og:image" content="${escapeImg(results[0].img_url, defImg)}" />
              <meta property="og:article:published_time" content="${escapeDate(results[0].created)}" />
              <meta property="og:article:modified_time" content="${escapeDate(results[0].modified)}" />
              <meta property="og:article:expiration_time" content="${escapeDate(results[0].deleted)}" />
              <meta property="place:location:latitude" content="${escape(results[0].coordinates[1])}">
              <meta property="place:location:longitude" content="${escape(results[0].coordinates[0])}">`;

            if (results[0].metakey)
              meta += tags.reduce((res, tag) => res + `
              <meta property="og:article:tag" content="${escape(tag.trim())}" />`, "");

            meta += `
              <script type="application/ld+json">
              {
                "@context": "http://schema.org",
                "@type": "Article",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "Article",
                  "@id": "${url}"
                },
                "headline": "${title}",
                "dateCreated": "${escapeDate(results[0].created)}",
                "datePublished": "${escapeDate(results[0].created)}",
                "dateModified": "${escapeDate(results[0].modified)}",
                "expires": "${escapeDate(results[0].deleted)}",
                "description": "${desc}", 
                "author": {"@type": "Person",
                  "name": "${author}"},
                "image": {
                  "@type": "ImageObject",
                  "url": "${escapeImg(results[0].img_url, defImg)}"
                },   
                ${getPublisher()}
              }
              </script>`;

            return Promise.resolve(meta);
          });
      }

      return Promise.resolve('');
  });

const getTravelerMeta = (dbRef, userId) => 
  db
    .findBy(dbRef, _const.DetailsTable, { user_id: userId })
    .then(results => {
      if (results && results.length > 0) {
        const desc = escape(results[0].text);
        
        return db
          .findBy(dbRef, _const.UsersTable, { $or: [{ sql_user_id: userId }, { uid: userId }] })
          .then(user =>   
          db
          .newestSorted(dbRef, _const.MessagesTable, { pub_date: -1 }, { $and: [{ user_id: userId }, _const.FilterNotDeleted] })
          .then(msg => {  
            const author = user && user.length > 0 ? escape(user[0].name) : '';
            const title = escape(results[0].meno + WebSuffix);
            const url = `https://cestasnp.sk/na/${escape(userId)}`;
            const created = escapeDate(results[0].created);
            const published = escapeDate(results[0].start_date);
            const modified = msg && msg.length > 0 ? escapeDate(msg[0].pub_date) : '';
            const lat = msg && msg.length > 0 ? escape(msg[0].lat) : '';
            const lon = msg && msg.length > 0 ? escape(msg[0].lon) : '';

            const img = escapeImg(msg && msg.length > 0 && msg[0].img ? msg[0].img.url || msg[0].img : '', defImg);

            var meta = `
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta name="keywords" content="${escape(results[0].metakey)}" />
              <meta property="og:url" content="${url}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:type" content="article" />
              <meta property="og:description" content="${desc}"/>              
              <meta property="og:image" content="${img}" />
              <meta property="og:article:published_time" content="${published}" />
              <meta property="og:article:modified_time" content="${modified}" />
              <meta property="place:location:latitude" content="${lat}">
              <meta property="place:location:longitude" content="${lon}">`;

            meta += `
              <script type="application/ld+json">
              {
                "@context": "http://schema.org",
                "@type": "Article",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "Article",
                  "@id": "${url}"
                },
                "headline": "${title}",
                "description": "${desc}",
                "dateCreated": "${created}",
                "datePublished": "${published}",
                "dateModified": "${modified}", 
                "author": {"@type": "Person",
                  "name": "${author}"}, 
                "image": {
                  "@type": "ImageObject",
                  "url": "${img}"
                },  
                ${getPublisher()}
              }
              </script>`;

            return Promise.resolve(meta);
          }));
      }

      return Promise.resolve('');
  });

const getMeta = (db, url) => new Promise((resolve, reject) => {
  const path = url.toLowerCase();

  if (path.startsWith('/pred/articles/article/')) {
    const articleId = sanitize(parseInt(url.substr(23)));

    if (articleId) {
      return resolve(getArticleMeta(db, articleId));
    }
  }

  if (path.startsWith('/pred/pois/') && !path.startsWith('/pred/pois/tabulka')) {
    const poiId = sanitize(url.substr(11, 24));

    if (poiId) {
      return resolve(getPoiMeta(db, poiId));
    }
  }

  if (path.startsWith('/na/') && !(path.startsWith('/na/ceste') || path.startsWith('/na/ceste/light') || path.startsWith('/na/ceste/fotky') || path.startsWith('/na/archive'))) {
    const userId = sanitizeUserId(url.substr(4));

    if (userId) {
      return resolve(getTravelerMeta(db, userId));
    }
  }

  return resolve('');
});

module.exports = { getMeta };