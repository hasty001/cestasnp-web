const express = require('express');
const DB = require('../db/db');
const { checkToken } = require('../util/checkUtils');
const { findNearPois, findNearestPoint, findNearestGuideposts } = require('../util/gpsUtils');
const itinerary = require('../data/guideposts.json');
const { promiseAsJson } = require('../util/promiseUtils');
const _const = require('../../const');

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  promiseAsJson(() => db.getPois(req.app.locals.db), res);
});


router.get('/map', (req, res) => {
  promiseAsJson(() => Promise.all([
    db.findBy(req.app.locals.db, _const.PoisTable, _const.FilterPoiNotDeleted, 
      { projection: { category: 1, food: 1, water: 1, coordinates: 1, name: 1, text: 1 } }),
    db.findBy(req.app.locals.db, _const.ArticlesTable, { $and: [_const.ArticlesFilterBy, { lat: { $ne: null } }, { lon: { $ne: null } }] },
      { projection: { fulltext: 0 } })])
    .then(([results, articles]) => {
      // add guideposts and articles with gps
      return Promise.resolve(results.concat(
        articles.map(a => db.articleToPoi(a)), 
        itinerary.map(g => db.guidepostToPoi(g))));
    }), res);
});

router.post('/my', (req, res) => {
  const { uid } = req.body;

  checkToken(req, res, uid, () => db.getPoisMy(req.app.locals.db, uid));
});

router.get('/:poiId', (req, res) => {
  promiseAsJson(() => db.getPoi(req.app.locals.db, req.params.poiId), res);
});

router.post('/delete', (req, res) => {
  const { uid, id, note } = req.body;

  checkToken(req, res, uid, () => db.deletePoi(uid, id, note), () => note);
});

router.post('/toggleMy', (req, res) => {
  const { uid, id } = req.body;

  checkToken(req, res, uid, () => db.togglePoiMy(uid, id));
});

router.post('/update', (req, res) => {
  const {
    uid,
    id,
    coordinates,
    accuracy,
    category,
    name,
    text,
    img_url,
    food,
    water,
    itineraryNear,
    itineraryAfter,
    itineraryInfo,
    note
  } = req.body;

  checkToken(req, res, uid, () =>
    db.updatePoi({
      uid,
      id,
      coordinates,
      accuracy,
      category,
      name,
      text,
      img_url,
      food,
      water,
      itineraryNear,
      itineraryAfter,
      itineraryInfo,
      note
    }), () => coordinates && coordinates.length >= 2 && category && (name || text) && note);
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
    }), () => coordinates && coordinates.length >= 2 && category && (name || text));

  if (confirmed) {
    addPoi();
  } else {
    db.all(req.app.locals.db, _const.PoisTable).then(pois => {
      const nearPois = findNearPois(coordinates, pois, _const.NearPoisWarningDistance);
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
        if (itinerary.guideposts) {
          itinerary.guidepostsPois = itinerary.guideposts.map(g => db.guidepostToPoi(g));
        }
        confirm.itinerary = itinerary;
      }

      if (confirm.pois || confirm.distance || confirm.itinerary) {
        res.json({ confirm });
        return;
      }

      addPoi();
    }).catch(error => {
      console.error(error);
      res.status(500).json({ error: error.toString() });
    });
  }
});

module.exports = router;
