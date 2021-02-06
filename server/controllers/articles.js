const express = require('express');
const sanitize = require('mongo-sanitize');
const DB = require('../db/db');
const _const = require('../../const');
const { checkToken } = require('../util/checkUtils');
const promiseAsJson = require('../util/promiseUtils');

const db = new DB();
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
  promiseAsJson(() => db.countCollection(req.app.locals.db, _const.ArticlesTable, _const.ArticlesFilterBy), res);
});

router.post('/my', (req, res) => {
  const { uid } = req.body;

  checkToken(req, res, uid, () => 
    db.getArticlesMy(req.app.locals.db, uid).then(results => {
      results.forEach(a => {
        a.introtext = '';
        a.fulltext = '';
      });
      
      return results;
    }));
});

router.post('/toggleMy', (req, res) => {
  const { uid, id } = req.body;

  checkToken(req, res, uid, () => db.toggleArticleMy(uid, id));
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

  checkToken(req, res, created_by, () =>
    db.addArticle({
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
    }), () => tags && tags.length && title && introtext && sql_article_id);
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

  checkToken(req, res, uid, () =>
    db.updateArticle({
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
    }), () => tags && tags.length && title && introtext && sql_article_id && note);
});

router.get('/lastId', (req, res) => {
  promiseAsJson(() => db.newestSorted(req.app.locals.db, _const.ArticlesTable, { sql_article_id: -1 }, {})
    .then(article => article[0].sql_article_id), res);
});

// operates pagination for all articles
router.get('/:page', (req, res) => {
  promiseAsJson(() => db.nextSorted(
    req.app.locals.db, 
    _const.ArticlesTable,
    ORDER.newestFirst,
    sanitize(req.params.page),
    _const.ArticlesFilterBy,
    { projection: { fulltext: 0 } }
  ), res);
});

// returns single article by ID
router.get('/article/:articleId', (req, res) => {
  const articleId = sanitize(parseInt(req.params.articleId, 10));

  promiseAsJson(() => db.fillArticleInfo(req.app.locals.db, articleId, 
      db.findBy(req.app.locals.db, _const.ArticlesTable, { sql_article_id: articleId }).then(result => result[0]))
    .then(article => [article]), res);
});

// returns all articles matching category
router.get('/category/:category', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category || ''));
  filters.push(_const.ArticlesFilterBy);
  const finalFilter = {};
  finalFilter.$and = filters;

  promiseAsJson(() => db.countCollection(req.app.locals.db, _const.ArticlesTable, finalFilter), res);
});

// returns articles matching category on certain page
router.get('/category/:category/:page', (req, res) => {
  const filters = filtersSplit(sanitize(req.params.category || ''));
  filters.push(_const.ArticlesFilterBy);
  const finalFilter = {};
  finalFilter.$and = filters;

  promiseAsJson(() => db.nextSorted(
    req.app.locals.db, _const.ArticlesTable,
    ORDER.newestFirst,
    sanitize(req.params.page),
    finalFilter,
    { projection: { fulltext: 0 } }
  ), res);
});

// increases article count
router.put('/increase_article_count', (req, res) => {
  promiseAsJson(() => db.increaseArticleCount(req.body.id), res);
});

// returns 2 newest articles for homepage and one as first
router.get('/for/home', (req, res) => {
  const first = parseInt(sanitize(req.query.first || 0));

  promiseAsJson(() => Promise.all([
    db.findBy(req.app.locals.db, _const.ArticlesTable, { sql_article_id: first }, { projection: { fulltext: 0 }}),
    db.newestSorted(req.app.locals.db,
      _const.ArticlesTable, ORDER.newestFirst, { $and: [_const.ArticlesFilterBy, { sql_article_id: { $ne: first } }]},
      _const.HomeArticlesCount + 1, { projection: { fulltext: 0 }})])
    .then(([first, articles]) => first.concat(articles).slice(0, _const.HomeArticlesCount + 1)), res);
});

module.exports = router;
