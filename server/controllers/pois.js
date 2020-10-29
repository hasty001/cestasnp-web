const express = require('express');
const DB = require('../db/db');
const checkToken = require('../util/checkToken');
const { findNearPois, findNearestPoint, findNearestGuideposts } = require('../util/gpsUtils');

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  db.all('pois', (results, error) => {
    if (results) {
      res.json(results);
    } else {
      console.error(error);
      res.status(500).json({ error });
    }
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
    confirmed
  } = req.body;

  const addPoi = () => checkToken(req, res, user_id, () =>
    db.addPoi({
      coordinates,
      accuracy,
      category,
      name,
      text,
      user_id,
      img_url
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
            img_url
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
        res.status(500).json({ error });
      }
    })
  }
});

module.exports = router;
