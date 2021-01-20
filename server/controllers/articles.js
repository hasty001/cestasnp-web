const express = require('express');
const sanitize = require('mongo-sanitize');
const bodyParser = require('body-parser');
const DB = require('../db/db');

const query = new DB();
const router = express.Router();

const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
};

const filterBy = {
  tags: {
    $nin: [
      'akcie',
      'spravy-z-terenu',
      'spravy_z_terenu',
      'oznamy',
      'akcie-ostatne',
      'nezaradene'
    ]
  }
};

const filtersSplit = category => {
  return category.split('+').map(filter => {
    const newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
};

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// count the entire article collection
router.get('/', (req, res) => {
  query.countCollection('articles', filterBy, results => {
    res.json(results);
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
    filterBy
  );
});

// returns single article by ID
router.get('/article/:articleId', (req, res) => {
  const articleId = sanitize(parseInt(req.params.articleId, 10));
  query
    .findBy('articles', { sql_article_id: articleId })
    .then(results => {
      res.json(results);
    })
    .catch(e => {
      console.error('error ', e);
    });
});

// returns all articles matching category
router.get('/category/:category', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
  const finalFilter = {};
  finalFilter.$and = filters;
  query.countCollection('articles', finalFilter, results => {
    res.json(results);
  });
});

// returns articles matching category on certain page
router.get('/category/:category/:page', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category));
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
    filterBy
  );
});

module.exports = router;
