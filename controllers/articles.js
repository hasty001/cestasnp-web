const express = require('express')
const DB = require('../db/db')
const query = new DB()
const router = express.Router()
const ORDER = {
  newestFirst: { created: -1 },
  oldestFirst: { created: 1 }
}

router.get('/', function (req, res) {
  query.newestSorted('articles', ORDER.newestFirst, function (results) {
    res.json(results)
  })
})

router.get('/:page', function (req, res) {
  query.nextSorted('articles', ORDER.newestFirst, req.params.page, function (results) {
    res.json(results)
  })
})

router.get('/category/:category', function (req, res) {
  query.findBy('articles', { tags: req.params.category }, function (results) {
    res.json(results)
  })
})

module.exports = router
