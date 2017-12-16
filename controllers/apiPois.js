const express = require('express')
const DB = require('../db/db')
const query = new DB()

const router = express.Router()

router.get('/', function (req, res) {
  query.all('pois', function (results) {
    res.json(results)
  })
})

module.exports = router
