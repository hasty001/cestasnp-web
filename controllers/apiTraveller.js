const express = require('express');
const DB = require('../db/db');
const bodyParser = require('body-parser');

const query = new DB();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// operates pagination for all articles
router.get('/:travellerId', function (req, res) {
  let travellerId = parseInt(req.params.travellerId);
  query.getTravellerDetails(
    travellerId,
    function (results) {
      res.json(results);
    }
  );
});

module.exports = router;
