const DB = require('./db/db');
const sanitize = require('mongo-sanitize');
const { call } = require('file-loader');

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
  

const getMeta = (url, callback) =>
{
  const path = url.toLowerCase();

  try {
    if (path.startsWith('/pred/articles/article/')) {
      const articleId = sanitize(parseInt(path.substr(23)));

      if (articleId) {
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
                  var meta = `
                    <meta name="description" content="${desc}" />
                    <meta name="author" content="${author}">
                    <meta name="keywords" content="${escape(results[0].metakey || '')}" />
                    <meta property="og:url" content="https://cestasnp.sk/pred/articles/article/${escape(articleId)}" />
                    <meta property="og:title" content="${title}" />
                    <meta property="og:type" content="article" />
                    <meta property="og:description" content="${desc}"/>
                    <meta property="og:image" content="${escape(results[0].ogimg || '')}" />
                    <meta property="og:article:published_time" content="${escapeDate(results[0].publish_up)}" />
                    <meta property="og:article:modified_time" content="${escapeDate(results[0].modified)}" />
                    <meta property="og:article:expiration_time" content="${escapeDate(results[0].publish_down)}" />
                    <script type="application/ld+json">
                        "@context": "http://schema.org",
                        "@type": "NewsArticle",
                        "@id": "https://cestasnp.sk/pred/articles/article/${escape(articleId)}",
                        "mainEntityOfPage": {
                            "@type": "NewsArticle",
                            "@id": "https://cestasnp.sk/pred/articles/article/${escape(articleId)}"
                        },
                        "headline": "${title}",
                        "dateCreated": "${escapeDate(results[0].created)}",
                        "datePublished": "${escapeDate(results[0].publish_up)}",
                        "dateModified": "${escapeDate(results[0].modified)}",
                        "expires": "${escapeDate(results[0].publish_down)}",
                        "description": "${desc}", 
                        "author": {"@type": "Person",
                            "name": "${author}"},       
                        "publisher": {
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
                            "url": "https://cestasnp.sk/img/logo.png",
                            "width": 4544,
                            "height": 1000
                        }
                        },
                            "image": {
                            "@type": "ImageObject",
                            "url": "${escape(results[0].ogimg || '')}"
                        }
                    }
                    </script>`;

                  if (results[0].metakey)
                    meta += results[0].metakey.split(",").reduce((res, tag) => res + "\n" + `<meta property="og:article:tag" content="${escape(tag.trim())}" />`, "");

                  callback(meta, title !== "CestaSNP" ? title + " - CestaSNP" : title);
                });
            }
        })
        .catch(e => {
          console.error('error ', e);
          callback('<meta property="og:type" content="website" />', 'CestaSNP');
        });

        return;
      }
    }
  } catch (error) {
    console.error(error);
  }

  callback('<meta property="og:type" content="website" />', 'CestaSNP');
}

module.exports = { getMeta };