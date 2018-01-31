const express = require('express')
const DB = require('../db/db')
const query = new DB()
const router = express.Router()
const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
}
const filterBy = {
  tags: {
    $nin: [ 'akcie', 'spravy-z-terenu', 'spravy_z_terenu' ]
  }
}

router.get('/', function (req, res) {
  query.countCollection('articles', filterBy, function (results) {
    res.json(results)
  })
})

router.get('/:page', function (req, res) {
  query.nextSorted('articles', ORDER.newestFirst, req.params.page, function (results) {
    res.json(results)
  }, filterBy)
})

router.get('/article/:articleId', function (req, res) {
  let articleId = parseInt(req.params.articleId)
  query.findBy('articles', { sql_article_id: articleId }, function (results) {
    res.json(results)
  })
})

router.get('/category/:category', function (req, res) {
  let filters = { tags: { $in: req.params.category.split('+') } }
  query.countCollection('articles', filters, function (results) {
    res.json(results)
  })
})

router.get('/category/:category/:page', function (req, res) {
  let filters = { tags: { $in: req.params.category.split('+') } }
  query.nextSorted('articles', ORDER.newestFirst, req.params.page, function (results) {
    res.json(results)
  }, filters)
})
module.exports = router
