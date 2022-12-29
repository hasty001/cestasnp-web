const express = require('express');
const DB = require('../db/db');
const { checkToken } = require('../util/checkUtils');
const { findNearPois, findNearestPoint, findNearestGuideposts } = require('../util/gpsUtils');
const itinerary = require('../data/guideposts.json');
const { promiseAsJson } = require('../util/promiseUtils');
const _const = require('../../const');
const { from } = require('form-data');
const { CleanPlugin } = require('webpack');
const { cleanup } = require('../util/arrayUtils');
const compare_sk = require("locale-compare")("sk");

const db = new DB();

const router = express.Router();

router.get('/', (req, res) => {
  promiseAsJson(() => db.getPois(req.app.locals.db).then((pois) => {
    const detail = (req.query.detail == undefined) || parseInt(req.query.detail);
    const from = parseInt(req.query.from);
    const limit = parseInt(req.query.count);

    const deleted = (req.query.deleted == undefined) || parseInt(req.query.deleted);
    const ignore = (req.query.ignore || "").split(",")

    const by = req.query.by;
    const asc = (req.query.asc == undefined) || parseInt(req.query.asc);

    pois = pois.filter(poi => poi._id && (!poi.deleted || deleted) 
      && ((ignore.length == 0) || !ignore.includes(poi.category) || (poi.food && !ignore.includes('krcma_jedlo')) || (poi.water && !ignore.includes('pramen'))))

    const strCompare = (f, a, b) => f * compare_sk(a || '', b || '');

    pois.sort((a, b) => {
      const f = (asc ? 1 : -1);
      switch (by) {
        case "created":
          return f * (parseDate(a.created) - parseDate(b.created));
        case "lastModified":
          return f * (parseDate(a.deleted || a.modified || 0) - parseDate(b.deleted || b.modified || 0));
        case "lastModified_action":
          return f * ((a.deleted ? 2 : (a.modified ? 1 : 0)) - (b.deleted ? 2 : (b.modified ? 1 : 0)));
        case "lastModified_by_name":
          return strCompare(f, a.deleted_by_name || a.modified_by_name, b.deleted_by_name || b.modified_by_name);
        case "name":
        case "text":
        case "created_by_name":
          return strCompare(f, a[by], b[by]);
        case "img":
          return f * (((a.img_url && a.img_url != "None") ? 1 : 0) - 
            ((b.img_url && b.img_url != "None") ? 1 : 0));     
        case "itinerary":
          return f * ((a.itinerary ? (a.itinerary.near || a.itinerary.after ? 1 : 0) : 0) - 
            (b.itinerary ? (b.itinerary.near || b.itinerary.after ? 1 : 0) : 0));
      
        default:
          return strCompare(-1, a._id.toString(), b._id.toString());
      }
    });

    const count = pois.length;
    if (from >= 0 && limit > 0) {
      pois = pois.slice(from, from + limit);
    }

    var clean = ['accuracy', 'coordinates', 'historyId', 'modified_note'];
    if (!detail) {
      clean = clean.concat(['created', 'created_by_name', 'user_id', 'img_url', 'itinerary', 'modified',
        'modified_by', 'modified_by_name',
        'deleted_by', 'deleted_by_name']);
    }

    if (from >= 0 && limit > 0) {
      cleanup(pois, clean);

      return { count: count, items: pois};
    } else {
      return pois;
    }
  }), res);
});


router.get('/map', (req, res) => {
  promiseAsJson(() => Promise.all([
    db.findBy(req.app.locals.db, _const.PoisTable, _const.FilterPoiNotDeleted, 
      { projection: { category: 1, food: 1, water: 1, uncertain: 1, coordinates: 1, name: 1, text: 1 } }),
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
    uncertain,
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
      uncertain,
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
    uncertain,
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
      uncertain,
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
          water,
          uncertain
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
