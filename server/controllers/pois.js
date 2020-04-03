const express = require('express');
const DB = require('../db/db');

const query = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  query.all('pois', (results, error) => {
    if (results) {
      res.json(results);
    } else {
      throw error;
    }
  });
});

module.exports = router;
