const express = require('express');
const itinerary = require('../data/guideposts.json');
const WGS84Util = require('wgs84-util');
const DB = require('../db/db');
const { findNearestPoint, findNearestGuideposts, saveGpx } = require('../util/gpsUtils');
const { promiseAsJson } = require('../util/promiseUtils');
const _const = require('../../const');
const snp = require('../data/snp_ele.json');
const { cleanup } = require('../util/arrayUtils');

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
  promiseAsJson(() => db.all(req.app.locals.db, _const.PoisTable).then(pois => {
    var resultItinerary = itinerary.map(item => Object.assign({}, item));

    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);

    if (start == 0 && end == -1) {
      start = resultItinerary[0].id;
      end = resultItinerary[resultItinerary.length - 1].id;
    }

    startIndex = resultItinerary.findIndex(i => i.id == start);
    endIndex = resultItinerary.findIndex(i => i.id == end);

    const from = parseInt(req.query.from);
    const limit = parseInt(req.query.count);

    console.log(start, startIndex, end, endIndex, from, limit)

    const clean = ['accuracy', 'coordinates', 'historyId', 'modified_note',
      'created', 'created_by_name', 'user_id', 'img_url', 'modified',
      'modified_by', 'modified_by_name',
      'deleted_by', 'deleted_by_name'];

    if (startIndex >= 0 && endIndex >= 0) {
      cleanup(pois, clean);

      const mainGuideposts = resultItinerary.filter(i => i.main).map(i => {return { id: i.id, name: i.name, ele: i.ele}; })

      const reverse = startIndex > endIndex;
      if (reverse) {
        const t = startIndex;
        startIndex = endIndex;
        endIndex = t;
      }

      var filtered = resultItinerary.slice(startIndex, endIndex + 1);
      resultItinerary = filtered.map((f, i, items) => { return {
          id: f.id,
          km: f.km - filtered[0].km,
          kmTo: f.kmTo - filtered[filtered.length - 1].kmTo,
          name: f.name,
          ele:  f.ele,
          lat: f.lat,
          lon: f.lon,
          dist: i < items.length - 1 ? f.dist : 0,
          asphalt: i < items.length - 1 ? f.asphalt : 0,
          altUp: i < items.length - 1 ? f.altUp : 0,
          altDown: i < items.length - 1 ? f.altDown : 0,
          time: i < items.length - 1 ? f.time : 0,
          info: f.info,
          infoAfter: f.infoAfter,
        };});

      if (reverse) {
        resultItinerary.reverse();
        // switch alt up <> down, km <> kmTo
        for (var i = 0; i < resultItinerary.length; i++) {
          var notLast = i < resultItinerary.length - 1;

          const t = resultItinerary[i].km;
          resultItinerary[i].km = resultItinerary[i].kmTo;
          resultItinerary[i].kmTo = t;
          resultItinerary[i].dist = notLast ? resultItinerary[i + 1].dist : 0;
          resultItinerary[i].asphalt = notLast ? resultItinerary[i + 1].asphalt : 0;
          resultItinerary[i].altUp = notLast ? resultItinerary[i + 1].altDown : 0;
          resultItinerary[i].altDown = notLast ?  resultItinerary[i + 1].altUp : 0;
          resultItinerary[i].time = notLast ?  resultItinerary[i + 1].time : 0;
          resultItinerary[i].infoAfter = notLast ?  resultItinerary[i + 1].infoAfter : null;
        }
      }

      const count = resultItinerary.length;
      const sum = {
        dist: resultItinerary.reduce((r, t) => r + t.dist, 0),
        asphalt: resultItinerary.reduce((r, t) => r + t.asphalt, 0),
        altUp: resultItinerary.reduce((r, t) => r + t.altUp, 0),
        altDown: resultItinerary.reduce((r, t) => r + t.altDown, 0),
        time: resultItinerary.reduce((r, t) => r + t.time, 0),
      };

      if (from >= 0 && limit > 0) {
        resultItinerary = resultItinerary.slice(from, from + limit);
      }

      addPois(resultItinerary, pois);

      return Promise.resolve({ start: start, end: end, reverse: reverse, count: count, 
        items: resultItinerary, mainGuideposts: mainGuideposts, sum: sum});
    }

    addPois(resultItinerary, pois);

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
