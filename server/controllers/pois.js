const express = require('express');
const DB = require('../db/db');
const checkToken = require('../util/checkToken');
const sanitize = require('mongo-sanitize');
const { findNearPois, findNearestPoint, findNearestGuideposts } = require('../util/gpsUtils');
const { ObjectId } = require('mongodb');
const itinerary = require('../data/guideposts.json');

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  db.getPois().then(results => {
      // add guideposts
      res.json(results.concat(itinerary.map(g => Object.assign({ category: "razcestnik" }, g))));
    }).catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    });
});

router.get('/:poiId', (req, res) => {
  db.getPoi(req.params.poiId)
    .then(result => {
      res.json(result);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    });
});

router.post('/delete', (req, res) => {
  const {
    uid,
    id,
    note
  } = req.body;

  checkToken(req, res, uid, resp => {
    db.deletePoi(uid, id, note)
    .then(poi => {
      res.json(poi);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    });
  });
});

router.post('/add', (req, res) => {
  const {
    coordinates,
    accuracy,
    category,
    name,
    text,
    user_id,
    img_url,
    food,
    water,
    confirmed,
    itineraryNear,
    itineraryAfter,
    itineraryInfo
  } = req.body;

  const addPoi = () => checkToken(req, res, user_id, () =>
    db.addPoi({
      coordinates,
      accuracy,
      category,
      name,
      text,
      user_id,
      img_url,
      food,
      water,
      itineraryNear,
      itineraryAfter,
      itineraryInfo
    },
    resp => {
      res.json(resp);
    }
    ));

  if (confirmed) {
    addPoi();
  } else {
    db.all('pois', (pois, error) => {
      if (pois) {
        const nearPois = findNearPois(coordinates, pois, 500);
        const nearest = findNearestPoint(coordinates);
        const itinerary = nearest.coordinates ? findNearestGuideposts(nearest.coordinates) : null;

        const confirm = { lat: coordinates[1], lon: coordinates[0], zoom: 13, 
          poi: {
            coordinates,
            accuracy,
            category,
            name,
            text,
            user_id,
            img_url,
            food,
            water
          } };

        if (nearPois.length > 0) {
          nearPois.sort((a, b) => a.distance - b.distance);
          confirm.pois = nearPois;
        }

        if (nearest.distance > 1000) {
          confirm.distance = nearest.distance;
        }

        if (itinerary && itinerary.nearest) {
          confirm.itinerary = itinerary;
        }

        if (confirm.pois || confirm.distance || confirm.itinerary) {
          res.json({ confirm });
          return;
        }

        addPoi();
      } else {
        console.error(error);
        res.status(500).json({ error: error.toString() });
      }
    })
  }
});

module.exports = router;
