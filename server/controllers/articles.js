const express = require('express');
const sanitize = require('mongo-sanitize');
const DB = require('../db/db');
const _const = require('../../const');
const { checkToken, checkNotEmpty } = require('../util/checkUtils');

const query = new DB();
const router = express.Router();

const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
};

const filtersSplit = category => {
  return category.split('+').map(filter => {
    const newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
};

// count the entire article collection
router.get('/', (req, res) => {
  query.countCollection('articles', _const.ArticlesFilterBy, results => {
    res.json(results);
  });
});

router.post('/my', (req, res) => {
  const {
    uid,
  } = req.body;

  checkToken(req, res, uid, () => 
    query.getArticlesMy(req.app.locals.db, uid).then(results => {
      results.forEach(a => {
        a.introtext = '';
        a.fulltext = '';
      });
      res.json(results);
    }).catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    }));
});

router.post('/toggleMy', (req, res) => {
  const {
    uid,
    id
  } = req.body;

  checkToken(req, res, uid, () => {
    query.toggleArticleMy(uid, id)
    .then(article => {
      res.json(article);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    });
  });
});

router.post('/add', (req, res) => {
  const {
    lat,
    lon,
    accuracy,
    state,
    tags,
    title,
    introtext,
    fulltext,
    sql_article_id,
    created_by
  } = req.body;
  if (!checkNotEmpty(tags && tags.length && title && introtext && sql_article_id, res))
    return;

  checkToken(req, res, created_by, () =>
    query.addArticle({
      lat,
      lon,
      accuracy,
      state,
      tags,
      title,
      introtext,
      fulltext,
      sql_article_id,
      created_by
    }).then(article => {
      res.json(article);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    }));
});

router.post('/update', (req, res) => {
  const {
    lat,
    lon,
    accuracy,
    state,
    tags,
    title,
    introtext,
    fulltext,
    sql_article_id,
    note,
    uid
  } = req.body;
  if (!checkNotEmpty(tags && tags.length && title && introtext && sql_article_id && note, res))
    return;

  checkToken(req, res, uid, () =>
    query.updateArticle({
      lat,
      lon,
      accuracy,
      state,
      tags,
      title,
      introtext,
      fulltext,
      sql_article_id,
      note,
      uid
    }).then(article => {
      res.json(article);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    }));
});

router.get('/lastId', (req, res) => {
  query.latestWithDB(req.app.locals.db, 'articles', {}, { sql_article_id: -1 }).then(article => {
    res.json(article[0].sql_article_id);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  });
});

// operates pagination for all articles
router.get('/:page', (req, res) => {
  query.nextSorted(
    'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    results => {
      res.json(results);
    },
    _const.ArticlesFilterBy
  );
});

// returns single article by ID
router.get('/article/:articleId', (req, res) => {
  const articleId = sanitize(parseInt(req.params.articleId, 10));
  query
    .findByWithDB(req.app.locals.db, 'articles', { sql_article_id: articleId })
    .then(results => query.fillArticleInfo(req.app.locals.db, articleId, results[0]))
    .then(article => res.json([article]))
    .catch(error => {
      console.error('error ', error);
      res.status(500).json({ error: error.toString() });
    });
});

// returns all articles matching category
router.get('/category/:category', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
  filters.push(_const.ArticlesFilterBy);
  const finalFilter = {};
  finalFilter.$and = filters;

  query.countCollection('articles', finalFilter, results => {
    res.json(results);
  });
});

// returns articles matching category on certain page
router.get('/category/:category/:page', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
  filters.push(_const.ArticlesFilterBy);
  const finalFilter = {};
  finalFilter.$and = filters;

  query.nextSorted(
    'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    results => {
      res.json(results);
    },
    finalFilter
  );
});

// increases article count
router.put('/increase_article_count', (req, res) => {
  query.increaseArticleCount(req.body.id, results => {
    res.json(results);
  });
});

// returns 2 newest articles for homepage
router.get('/for/home', (req, res) => {
  query.newestSorted(
    'articles',
    ORDER.newestFirst,
    results => {
      res.json(results);
    },
    _const.ArticlesFilterBy
  );
});

module.exports = router;
