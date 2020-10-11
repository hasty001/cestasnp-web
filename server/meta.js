const DB = require('./db/db');
const sanitize = require('mongo-sanitize');

const db = new DB();

const escape = (html) => {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

const escapeDate = (date) => {
    if (!date)
      return "";
    const d = new Date(date);
    return isNaN(d) ? "" : escape(d.toISOString());
}

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

const getArticleMeta = (articleId) => 
  db
    .findBy('articles', { sql_article_id: articleId })
    .then(results => {
      if (results && results.length > 0) {
        const desc = escape(results[0].ogdesc || results[0].metadesc || 'Toto je starší článok z portálu CestaSNP.sk');
        
        return db
          .findBy('users', { sql_user_id: results[0].created_by_user_sql_id })
          .then(user => {  
            const author = user && user.length > 0 ? escape(user[0].name || '') : '';
            const title = escape(results[0].title || 'CestaSNP');
            const url = `https://cestasnp.sk/pred/articles/article/${escape(articleId)}`;

            var meta = `
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta property="og:url" content="${url}" />
              <meta property="og:title" content="${title}" />
              <meta property="og:type" content="article" />
              <meta property="og:description" content="${desc}"/>
              <meta property="og:image" content="${escape(results[0].ogimg || '')}" />
              <meta property="og:article:published_time" content="${escapeDate(results[0].publish_up)}" />
              <meta property="og:article:modified_time" content="${escapeDate(results[0].modified)}" />
              <meta property="og:article:expiration_time" content="${escapeDate(results[0].publish_down)}" />`;

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
                  "url": "${escape(results[0].ogimg || '')}"
                },   
                ${getPublisher()}
              }
              </script>`;

            return Promise.resolve({ meta, title });
          });
      }

      return Promise.resolve({});
  });

const getTravelerMeta = (userId) => 
  db
    .findBy('traveler_details', { user_id: userId })
    .then(results => {
      if (results && results.length > 0) {
        const desc = escape(results[0].text || '');
        
        return db
          .findBy('users', { $or: [{ sql_user_id: userId }, { uid: userId }] })
          .then(user =>   
          db
          .latest('traveler_messages', { $and: [{ user_id: userId }, { deleted: { $ne: true }}] }, { pub_date: -1 })
          .then(msg => {  
            const author = user && user.length > 0 ? escape(user[0].name || '') : '';
            const title = escape(results[0].meno || '');
            const url = `https://cestasnp.sk/na/${escape(userId)}`;
            const created = escapeDate(results[0].created);
            const published = escapeDate(results[0].start_date);
            const modified = msg ? escapeDate(msg[0].pub_date) : '';
            const lat = msg ? escape(msg[0].lat) : '';
            const lon = msg ? escape(msg[0].lon) : '';

            var img = msg && msg.length > 0 && msg[0].img ? msg[0].img.url || msg[0].img || '' : '';
            if (img && img.indexOf('res.cloudinary.com') === -1) {
              img = `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${img}`;
            }
            img = escape(img);

            var meta = `
              <meta name="description" content="${desc}" />
              <meta name="author" content="${author}">
              <meta name="keywords" content="${escape(results[0].metakey || '')}" />
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

            return Promise.resolve({ meta, title });
          }));
      }

      return Promise.resolve({});
  });

const getMeta = (url) =>
{
  const path = url.toLowerCase();

  if (path.startsWith('/pred/articles/article/')) {
    const articleId = sanitize(parseInt(url.substr(23)));

    if (articleId) {
      return getArticleMeta(articleId);
    }
  }

  if (path.startsWith('/na/ceste') || path.startsWith('/na/ceste/light') || path.startsWith('/na/archive')) {
  } else if (path.startsWith('/na/')) {
    var userId = url.substr(4);

    if (userId && userId.length <= 3) {
      userId = sanitize(parseInt(userId));
    }
    userId = sanitize(userId);

    if (userId) {
      return getTravelerMeta(userId);
    }
  }

  return Promise.resolve({});
}

module.exports = { getMeta };