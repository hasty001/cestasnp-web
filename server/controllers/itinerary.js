const express = require('express');
const itinerary = require('../data/guideposts.json');
const WGS84Util = require('wgs84-util');
const DB = require('../db/db');
const { findNearestPoint, findNearestGuideposts, saveGpx } = require('../util/gpsUtils');
const { promiseAsJson } = require('../util/promiseUtils');
const _const = require('../../const');
const snp = require('../data/snp_ele.json');

const db = new DB();

const router = express.Router();

const addPois = (itinerary, pois) => {
  pois.filter(poi => !poi.deleted && poi.itinerary).forEach(poi => {
    const itemNear = poi.itinerary.near ? itinerary.find(i => i.id == poi.itinerary.near) : null;
    const itemAfter = poi.itinerary.after ? itinerary.find(i => i.id == poi.itinerary.after) : null;

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
};

router.get('/', (req, res) => {
  promiseAsJson(() => db.all(req.app.locals.db, _const.PoisTable).then(results => {
    const resultItinerary = itinerary.map(item => Object.assign({}, item));

    addPois(resultItinerary, results);

    return Promise.resolve(resultItinerary);
  }), res);
});

router.get('/gpx', (req, res) => {
  db.all(req.app.locals.db, _const.PoisTable).then(results => {
    const resultItinerary = itinerary.map(item => Object.assign({}, item));

    addPois(resultItinerary, results);

    console.log(req.query, req.query['start'], req.query['end'])

    var startIndex = resultItinerary.findIndex(n => n.id == req.query['start']);
    var endIndex = resultItinerary.findIndex(n => n.id == req.query['end']);

    if (startIndex < 0) startIndex = 0;
    if (endIndex < 0) endIndex = resultItinerary.length - 1;

    const reverse = startIndex > endIndex;
    if (reverse) {
      const t = startIndex;
      startIndex = endIndex;
      endIndex = t;
    }

    filtered = resultItinerary.slice(startIndex, endIndex + 1);

    pois = [];
    path = [];
    lastP = -1;
    filtered.forEach((g, i) => {
      if (g.main) {
        g.category = "razcestnik"
        pois.push(g);
      }

      if (g.info) {
        g.info.forEach(p => pois.push(p));
      }
      if (g.infoAfter && i < filtered.length - 1) {
        g.infoAfter.forEach(p => pois.push(p));
      }

      if (i < filtered.length - 1) {
        for (var p = g.pathIndex; p <= g.pathIndexEnd; p++) {
          if (p != lastP) {
            path.push(snp.features[0].geometry.coordinates[p]);
          }
          lastP = p;
        }
      }
    });

    if (reverse) {
      path.reverse()
      pois.reverse()
    }

    res.contentType('application/gpx+xml').send(saveGpx("", path, pois))
  });
});

router.get('/matchPois', (req, res) => {
  promiseAsJson(() => db.all(req.app.locals.db, _const.PoisTable).then(results => {
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
      return db.setPoisItinerary(info).then(r => Promise.resolve({ apply: r, warning, info }));
    } else {    
      return Promise.resolve({ warning, info });
    }
  }), res);
});

module.exports = router;
