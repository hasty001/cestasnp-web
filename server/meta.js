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
          .findBy(dbRef, _const.UsersTable, { $or: [{ sql_user_id: results[0].author || results[0].created_by_user_sql_id || -1 }, 
            { uid: results[0].author || results[0].created_by || -1 }] })
          .then(user => {  
            const author = escape(results[0].author_text || (user && user.length > 0 ? user[0].name : ''));
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
              <meta name="keywords" content="${escape(results[0].metakey || (results[0].tags || []).join(','))}" />
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

            if (results[0].state <= 0 || (results[0].tags && 
              _const.ArticlesFilterTagsAllowed.reduce((p, t) => p + (results[0].tags.indexOf(t) >= 0 ? 1 : 0), 0) == 0
                && _const.ArticlesFilterTagsNotAllowed.reduce((p, t) => p + (results[0].tags.indexOf(t) >= 0 ? 1 : 0), 0) > 0)) {
              meta += `
              <meta name="robots" content="noindex">`;
            }

            if (results[0].metakey || results[0].tags)
              meta += (results[0].metakey ? results[0].metakey.split(",") : results[0].tags).reduce((res, tag) => res + `
              <meta property="og:article:tag" content="${escape(tag.trim())}" />`, "");

            meta += `
              <script type="application/ld+json">
              [{
                "@context": "http://schema.org",
                "@type": "NewsArticle",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "NewsArticle",
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
                  "url": "${escapeImg(results[0].ogimg || imgRegEx(), defImg)}"
                },   
                ${getPublisher()}
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [{
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Články",
                  "item": "https://cestasnp.sk/pred/articles/1"
                }]
              }]
              </script>`;

            return Promise.resolve(meta);
          });
      }

      return Promise.reject(404);
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

            if (results[0].deleted) {
              meta += `
              <meta name="robots" content="noindex">`;
            }

            if (results[0].metakey)
              meta += tags.reduce((res, tag) => res + `
              <meta property="og:article:tag" content="${escape(tag.trim())}" />`, "");

            meta += `
              <script type="application/ld+json">
              [{
                "@context": "http://schema.org",
                "@type": "NewsArticle",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "NewsArticle",
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
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [{
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Dôležité miesta",
                  "item": "https://cestasnp.sk/pred/pois"
                }]
              }]
              </script>`;

            return Promise.resolve(meta);
          });
      }

      return Promise.reject(404);
  });

const getTravelerMeta = (dbRef, userId) => 
  db
    .findBy(dbRef, _const.DetailsTable, { user_id: userId })
    .then(results => {
      if (results && results.length > 0) {
        const desc = escape(results[0].text);
        
        return db
          .findBy(dbRef, _const.UsersTable, { $or: [{ sql_user_id: userId || -1 }, { uid: userId || -1 }] })
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

            const img = escapeImg(msg && msg.length > 0 && msg[0].img ? msg[0].img : '', defImg);

            const finished = results[0].finishedTracking && results[0].end_date;

            var meta = `
              <link rel="canonical" href="${url}" />
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta name="keywords" content="cesta,putovanie,správy,live,sledovanie" />
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
              [{
                "@context": "http://schema.org",
                "@type": "NewsArticle",
                "@id": "${url}",
                "mainEntityOfPage": {
                  "@type": "NewsArticle",
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
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [{
                  "@type": "ListItem",
                  "position": 1,
                  "name": "${finished ? 'Archív' : 'Na ceste'}",
                  "item": "${finished ? 'https://cestasnp.sk/na/archive' : 'https://cestasnp.sk/na/ceste'}"
                }]
              }]
              </script>`;

            return Promise.resolve(meta);
          }));
      }

      return Promise.reject(404);
  });

const getMeta = (db, url) => new Promise((resolve, reject) => {
  const path = url.toLowerCase();

  if (path.startsWith('/pred/articles/article/')) {
    const articleId = sanitize(parseInt(url.substr(23)));

    if (articleId) {
      return resolve(getArticleMeta(db, articleId));
    } else
      return reject(404);
  }

  if (path.startsWith('/pred/pois/') && !path.startsWith('/pred/pois/tabulka')) {
    const poiId = sanitize(url.substr(11, 24));

    if (poiId && poiId.length == 24) {
      return resolve(getPoiMeta(db, poiId));
    } else {
      return reject(404);
    }
  }

  if (path == '/pred/pois' || path == '/pred/pois/') {
    return resolve(`
      <meta name="description" content="Mapa Cesty hrdinov SNP" />
      <meta name="keywords" content="mapa,trasa,dôležité miesta,poi" />
      <meta property="og:url" content="https://cestasnp.sk/pred/itinerar" />
      <meta property="og:title" content="Dôležité miesta${WebSuffix}" />
      <meta property="og:type" content="article" />
      <meta property="og:description" content="Mapa Cesty hrdinov SNP"/>              
      <meta property="og:image" content="${defImg}" />`);
  }

  if (path.startsWith('/pred/itinerar')) {
    return resolve(`
      <meta name="description" content="Itinerár Cesty hrdinov SNP" />
      <meta name="keywords" content="cesta,trasa,kilometráž,prevýšenie,klesanie,asfalt,stúpanie,čas,vzdialenosť,rázcestí" />
      <meta property="og:url" content="https://cestasnp.sk/pred/itinerar" />
      <meta property="og:title" content="Itinerár${WebSuffix}" />
      <meta property="og:type" content="article" />
      <meta property="og:description" content="Itinerár Cesty hrdinov SNP"/>              
      <meta property="og:image" content="${defImg}" />`);
  }

  if (path.startsWith('/na/') && !(path.startsWith('/na/ceste') || path.startsWith('/na/ceste/light') || path.startsWith('/na/ceste/fotky') || path.startsWith('/na/archive'))) {
    const userId = path.startsWith('/na/dennik/') ? sanitizeUserId(url.substr(11)) : sanitizeUserId(url.substr(4));

    if (userId) {
      return resolve(getTravelerMeta(db, userId));
    } else {
      return reject(404);
    }
  }

  return resolve('');
});

module.exports = { getMeta };