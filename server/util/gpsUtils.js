const WGS84Util = require('wgs84-util');
const dukla_devin = require('../../client/src/geojson/dukla_devin.json');
const itinerary = require('../data/guideposts.json');

const findNearPois = (coordinates, pois, maxDistance) => {
  pois.forEach(p => { p.distance = WGS84Util.distanceBetween({ coordinates }, p ); });

  return pois.filter(p => p.distance < maxDistance);
}

const findNearestPoint = (coordinates) => {
  var minDistance = 100 * 1000 * 1000;
  var min = null;

  dukla_devin.features[0].geometry.coordinates.forEach(c => {
    const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: c });

    if (distance < minDistance) {
      minDistance = distance;
      min = c;
    }
  });

  return { coordinates: min, distance: minDistance };
}

const findNearestGuideposts = (coordinates) => {
  var minDistance = 100 * 1000 * 1000;
  var min = null;

  itinerary.forEach(g => {
    const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [g.lon, g.lat] });

    if (distance < minDistance) {
      minDistance = distance;
      min = g;
    }
  });

  var prev = null;
  var prevDistance = null;
  var next = null;
  var nextDistance = null;
  var near = null;
  var after = null;
  if (min) {
    const i = itinerary.findIndex(g => g.id == min.id);

    if (i >= 0) {
      prev = itinerary[Math.max(0, i - 1)];
      prevDistance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [prev.lon, prev.lat] });
    }

    if (i >= 0) {
      next = itinerary[Math.min(itinerary.length - 1, i + 1)];
      nextDistance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [next.lon, next.lat] });
    }

    if (minDistance < 100) {
      near = min.id;
    } else {
      if (prevDistance < nextDistance) {
        after = prev.id;
      } else {
        after = next ? next.id : null;
      }
    }
  }

  return { nearest: min, prev, next, nearestDistance: minDistance, prevDistance, nextDistance, near, after };
}

module.exports = { findNearPois, findNearestPoint, findNearestGuideposts };