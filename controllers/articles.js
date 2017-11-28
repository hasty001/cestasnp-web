const express = require('express')
const DB = require('../db/db')
const query = new DB()

const router = express.Router()

router.get('/', function (req, res) {
  query.sorted('articles', {created: -1}, function (results) {
    let newestArticles = []
    for (let i = 0; i < 10; i++) {
      newestArticles.push(results[i])
    }
    res.json(newestArticles)
  })
})

module.exports = router
