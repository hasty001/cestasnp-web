const express = require('express');
const DB = require('../db/db');
const bodyParser = require('body-parser');

const query = new DB();
const router = express.Router();
const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
};
const filterBy = {
  tags: {
    $nin: ['akcie', 'spravy-z-terenu', 'spravy_z_terenu']
  }
};

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// count the entire article collection
router.get('/', function(req, res) {
  query.countCollection('TEST_articles', filterBy, function(results) {
    res.json(results);
  });
});

// operates pagination for all articles
router.get('/:page', function(req, res) {
  query.nextSorted(
    'TEST_articles',
    ORDER.newestFirst,
    req.params.page,
    function(results) {
      res.json(results);
    },
    filterBy
  );
});

// returns single article by ID
router.get('/article/:articleId', function(req, res) {
  let articleId = parseInt(req.params.articleId);
  query.findBy('TEST_articles', { sql_article_id: articleId }, function(results) {
    res.json(results);
  });
});

// returns all articles matching category
router.get('/category/:category', function(req, res) {
  let filters = req.params.category.split('+').map(filter => {
    let newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
  let finalFilter = {};
  finalFilter.$and = filters;
  query.countCollection('TEST_articles', finalFilter, function(results) {
    res.json(results);
  });
});

// returns articles matching category on certain page
router.get('/category/:category/:page', function(req, res) {
  let filters = req.params.category.split('+').map(filter => {
    let newFilter = {};
    newFilter.tags = filter;
    return newFilter;
  });
  let finalFilter = {};
  finalFilter.$and = filters;
  query.nextSorted(
    'TEST_articles',
    ORDER.newestFirst,
    req.params.page,
    function(results) {
      res.json(results);
    },
    finalFilter
  );
});

router.put('/increase_article_count', function(req, res) {
  query.increaseArticleCount(req.body.id, function(results) {
    res.json(results);
  });
});

router.post('/add_article', function(req, res) {
  query.addArticle(req.body, 'TEST_articles');
});

module.exports = router;
