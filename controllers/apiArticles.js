const express = require('express')
const DB = require('../db/db')
const query = new DB()
const router = express.Router()
const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
}
const filterBy = { tags: { $ne: 'spravy-z-terenu' } }

router.get('/', function (req, res) {
  query.countCollection('articles', filterBy, function (count, error) {
    if (count) {
      res.json(count)
    } else {
      console.log(error)
    }
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
  query.findBy('articles', { tags: req.params.category }, function (results) {
    res.json(results)
  })
})

module.exports = router
