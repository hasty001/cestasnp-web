const express = require('express');
const itinerary = require('../data/guideposts.json');
const WGS84Util = require('wgs84-util');
const DB = require('../db/db');
const { findNearestPoint, findNearestGuideposts } = require('../util/gpsUtils');
const promiseAsJson = require('../util/promiseUtils');

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  promiseAsJson(() => db.all(req.app.locals.db, 'pois').then(results => {
    const resultItinerary = itinerary.map(item => Object.assign({}, item));

    results.filter(poi => !poi.deleted && poi.itinerary).forEach(poi => {
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

    return Promise.resolve(resultItinerary);
  }), res);
});

router.get('/matchPois', (req, res) => {
  promiseAsJson(() => db.all(req.app.locals.db, 'pois').then(results => {
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
      if (!poi.coordinates || !poi.coordinates.length || poi.coordinates.length < 2) {
        warning.push(`Poi ${poi._id} ${poi.name} invalid coordinates!`);
        return;
      }

      const {coordinates, distance} = findNearestPoint(poi.coordinates);
      
      if (!coordinates || !coordinates.length || coordinates.length < 2) {
        warning.push(`Poi ${poi._id} ${poi.name} invalid nearest path coordinates!`);
        return;
      }

      const guideposts = findNearestGuideposts(coordinates);

      if (distance > 100) {
        warning.push({ log: `Nearest guidepost not found for: ${poi._id} ${poi.name} ${distance} m from path`, poi, pathPoint: coordinates, guideposts });
      } else {
        if ((!guideposts.near && !guideposts.after)) {
          warning.push({ log: `Nearest guidepost ${guideposts.nearest} ${guideposts.nearest.name} too far: ${poi._id} ${poi.name} ${guideposts.nearestDistance} m`, poi, pathPoint: coordinates, guideposts });
        } else {
          if (guideposts.near) {
            info.push({ log: `Guidepost ${guideposts.near.id} ${guideposts.near.name} found for: ${poi._id} ${poi.name} ${guideposts.nearestDistance} m`, poi, near: guideposts.near });
          } else {
            info.push({ log: `After guidepost ${guideposts.after.id} ${guideposts.after.name} found for: ${poi._id} ${poi.name} ${distance} m from path ${guideposts.afterDistance} m`, poi, after: guideposts.after });
          }
        }
      }
    });

    if (req.query.apply) {
      return db.setPoisItinerary(info).then(r =>Promise.resolve({ apply: r, warning, info }));
    } else {    
      return Promise.resolve({ warning, info });
    }
  }), res);
});

module.exports = router;
