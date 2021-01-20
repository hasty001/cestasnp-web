const WGS84Util = require('wgs84-util');
const dukla_devin = require('../../client/src/geojson/dukla_devin.json');
const itinerary = require('../data/guideposts.json');

/**
 * Returns nearest POIs to passed point.
 */
const findNearPois = (coordinates, pois, maxDistance) => {
  pois.forEach(p => { p.distance = WGS84Util.distanceBetween({ coordinates }, p ); });

  return pois.filter(p => p.distance < maxDistance);
}

const getNearestPointOnLine = (a, b, c) => {
  if (!a || !b || !c || !a.length || !b.length || !c.length || a.length < 2 || b.length < 2 || c.length < 2) {
    return null;
  }

  const ac = [c[0] - a[0], c[1] - a[1]];   
  const ab = [b[0] - a[0], b[1] - a[1]];     

  if (ab[0] == 0 && ab[1] == 0) {
    return a;
  }

  const atb2 = Math.pow(ab[0], 2) + Math.pow(ab[1], 2); 

  const atp_dot_atb = ac[0]*ab[0] + ac[1]*ab[1];
                                      
  const t = atp_dot_atb / atb2;           

  return (t >= 0 && t <= 1) ? [a[0] + ab[0]*t, a[1] + ab[1]*t] : null;
}

/**
 * Returns nearest point on SNP to passed point and its distance.
 */
const findNearestPoint = (coordinates) => {
  var minDistance = 100 * 1000 * 1000;
  var min = null;
  var minIndex = null;

  const path = dukla_devin.features[0].geometry.coordinates;

  path.forEach((c, i) => {
    const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: c });

    if (distance < minDistance) {
      minDistance = distance;
      min = c;
      minIndex = i;
    }
  });

  if (minIndex) {
    // check lines to prev and next point on path

    for (var i = Math.max(0, minIndex - 2); i < Math.min(path.length - 1, minIndex + 2); i++) {

      const c = getNearestPointOnLine(path[i], path[i + 1], coordinates);
      if (c) {
        const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: c });

        if (distance < minDistance) {
          minDistance = distance;
          min = c;
        }
      }
    }
  }

  // also check guideposts
  itinerary.forEach(g => {
    const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [g.lon, g.lat] });

    if (distance < minDistance) {
      minDistance = distance;
      min = [g.lon, g.lat];
    }
  });

  return { coordinates: min, distance: minDistance };
}

/**
 * Returns nearest, prev and next guideposts on SNP to passed guidepost id.
 */
const getNearGuideposts = (gId, coordinates, minDistance = null) => {
  var min = null;
  var prev = null;
  var prevDistance = null;
  var next = null;
  var nextDistance = null;
  var afterDistance = null;
  var nearId = null;
  var afterId = null;
  var near = null;
  var after = null;

  if (gId) {
    const i = itinerary.findIndex(g => g.id == gId);

    if (i >= 0) {
      min = itinerary[i];
      prev = itinerary[Math.max(0, i - 1)];
      prevDistance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [prev.lon, prev.lat] });
      prevMDistance = WGS84Util.distanceBetween({ coordinates: [min.lon, min.lat] }, { coordinates: [prev.lon, prev.lat] });

      next = itinerary[Math.min(itinerary.length - 1, i + 1)];
      nextDistance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [next.lon, next.lat] });
      nextMDistance = WGS84Util.distanceBetween({ coordinates: [min.lon, min.lat] }, { coordinates: [next.lon, next.lat] });

      if (minDistance < 100) {
        nearId = min.id;
        near = min;
      } else {
        if (prevDistance <= prevMDistance) {
          afterId = prev.id;
          after = prev;
          afterDistance = prevDistance;
        } else {
          if (nextDistance <= nextMDistance) {
            afterId = min.id;
            after = min;
            afterDistance = minDistance;
          }
        }
      }
    }
  }

  const guideposts = [prev, min, next].filter((p, i, a) => p && (a.indexOf(p) == i));

  return { nearest: min, prev, next, nearestDistance: minDistance, prevDistance, nextDistance, nearId, afterId, near, after, afterDistance, guideposts };
}

/**
 * Returns nearest, prev and next guideposts on SNP to passed point.
 */
const findNearestGuideposts = (coordinates) => {
  var minDistance = 100 * 1000 * 1000;
  var minId = null;

  itinerary.forEach(g => {
    const distance = WGS84Util.distanceBetween({ coordinates }, { coordinates: [g.lon, g.lat] });

    if (distance < minDistance) {
      minDistance = distance;
      minId = g.id;
    }
  });

  return getNearGuideposts(minId, coordinates, minDistance);
}

module.exports = { findNearPois, findNearestPoint, findNearestGuideposts, getNearGuideposts };