const express = require('express');
const sanitize = require('mongo-sanitize');
const DB = require('../db/db');
const bodyParser = require('body-parser');

const query = new DB();
const router = express.Router();

const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 },
};

const filterBy = {
  tags: {
    $nin: ['akcie', 'spravy-z-terenu', 'spravy_z_terenu', 'oznamy', 'akcie-ostatne', 'nezaradene'],
  },
};

const filtersSplit = category => {
  return category.split('+').map(filter => {
    let newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
};

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// count the entire article collection
router.get('/', function(req, res) {
  query.countCollection('articles', filterBy, function(results) {
    res.json(results);
  });
});

// operates pagination for all articles
router.get('/:page', function(req, res) {
  query.nextSorted(
    'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    function(results) {
      res.json(results);
    },
    filterBy,
  );
});

// returns single article by ID
router.get('/article/:articleId', function(req, res) {
  let articleId = sanitize(parseInt(req.params.articleId));
  query.findBy('articles', { sql_article_id: articleId }, function(results) {
    res.json(results);
  });
});

// returns all articles matching category
router.get('/category/:category', function(req, res) {
  let filters = filtersSplit(sanitize(req.params.category));
  let finalFilter = {};
  finalFilter.$and = filters;
  query.countCollection('articles', finalFilter, function(results) {
    res.json(results);
  });
});

// returns articles matching category on certain page
router.get('/category/:category/:page', function(req, res) {
  let filters = filtersSplit(sanitize(req.params.category));
  let finalFilter = {};
  finalFilter.$and = filters;
  query.nextSorted(
    'articles',
    ORDER.newestFirst,
    sanitize(req.params.page),
    function(results) {
      res.json(results);
    },
    finalFilter,
  );
});

// increases article count
router.put('/increase_article_count', function(req, res) {
  query.increaseArticleCount(req.body.id, function(results) {
    res.json(results);
  });
});

// returns 3 newest articles for homepage
router.get('/for/home', function(req, res) {
  query.newestSorted(
    'articles',
    ORDER.newestFirst,
    function(results) {
      res.json(results);
    },
    filterBy,
  );
});

module.exports = router;
