const express = require('express');
const itinerary = require('../data/guideposts.json');
const WGS84Util = require('wgs84-util');
const DB = require('../db/db');

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  db.all('pois', (results, error) => {
    if (results) {
      const resultItinerary = itinerary.map(item => Object.assign({}, item));

      results.filter(poi => poi.itinerary).forEach(poi => {
        const itemNear = poi.itinerary.near ? resultItinerary.find(i => i.id == poi.itinerary.near) : null;
        const itemAfter = poi.itinerary.after ? resultItinerary.find(i => i.id == poi.itinerary.after) : null;

        if (itemNear) {
          if (!itemNear.info) {
            itemNear.info = [];
          }
          itemNear.info.push(poi);
        }
        if (itemAfter) {
          if (!itemAfter.infoAfter) {
            itemAfter.infoAfter = [];
          }
          itemAfter.infoAfter.push(poi);
        }        
      });

      res.json(resultItinerary);
    } else {
      console.error(error);
      res.status(500).json({ error });
    }
  });
});

router.get('/matchPois', (req, res) => {
  db.all('pois', (results, error) => {
    if (results) {
      const warning = [];
      const info = [];

      results.filter(poi => poi.itinerary).forEach(poi => {
        if (poi.itinerary.near && !itinerary.find(g => g.id == poi.itinerary.near)) {
          warning.push(`Guidepost ${poi.itinerary.near} not found for: ${poi._id} ${poi.name}`);
        }
        if (poi.itinerary.after && !itinerary.find(g => g.id == poi.itinerary.after)) {
          warning.push(`Guidepost ${poi.itinerary.after} not found for: ${poi._id} ${poi.name}`);
        }
      });

      results.filter(poi => !poi.itinerary).forEach(poi => {

        var minD = 20000;
        var minG = null;
        itinerary.forEach(g => {
          const d = WGS84Util.distanceBetween({ coordinates: [g.lon, g.lat] }, { coordinates: poi.coordinates });

          if (d < minD) {
            minD = d;
            minG = g;
          }
        });

        if (!minG) {
          warning.push({ log: `Nearest guidepost not found for: ${poi._id} ${poi.name}`, poi: poi });
        } else {
          if (minD > 100) {
            warning.push({ log: `Nearest guidepost ${minG.id} ${minG.name} too far: ${poi._id} ${poi.name} ${minD} m`, poi: poi, near: minG });
          } else {
            info.push({ log: `Guidepost ${minG.id} ${minG.name} found for: ${poi._id} ${poi.name} ${minD} m`, poi: poi, near: minG });
          }
        }
      });

      if (req.query.apply) {
        db.setPoisItinerary(info, r => res.json({ apply: r, warning, info }));
      } else {    
        res.json({ warning, info });
      }
    } else {
      console.error(error);
      res.status(500).json({ error });
    }
  });
});

module.exports = router;
