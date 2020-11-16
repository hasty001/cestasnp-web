const WGS84Util = require('wgs84-util');
const fs = require('fs');

const dukla_devin = require('../../client/src/geojson/dukla_devin.json');
const osm = require('../data/snp.json');

const altCoefficient = 1.125;
const distCoefficient = 1.05;

const relation = osm.elements.find(e => e.type === 'relation' && e.id === 7700604);

var surfaces = [];
var lastNodeId = 0;
var ways = 0;
var osmPath = [];
console.time("way");
relation.members.filter(m => m.type === 'way').forEach(w => {
    const way = osm.elements.find(e => e.type === 'way' && e.id === w.ref);
    const nodes = way.nodes.map(n => osm.elements.find(e => e.type === 'node' && e.id === n));
    
    if (nodes && nodes.length > 1) {

      const asphalt = way.tags && 
        (way.tags.surface === "asphalt" || (way.tags.surface && way.tags.surface.startsWith("concrete")) || way.tags.surface === "paved"
        || way.tags.surface === "sett" || way.tags.surface === "stones" || way.tags.surface === "paving_stones"
        || way.tags.surface === "cobblestone"
        || way.tags.highway === "primary" || way.tags.highway === "secondary" || way.tags.highway === "tertiary"
        || way.tags.highway === "unclassified" || way.tags.highway === "residential" || way.tags.highway === "service" 
        || way.tags.highway === "footway" || way.tags.highway === "cycleway" || way.tags.highway === "pedestrian"
        || way.tags.highway === "living_street" || (way.tags.highway && way.tags.highway.endsWith("_link"))
        || way.tags.tracktype === "grade1") 
        && (way.tags.surface !== "unpaved") && (way.tags.surface !== "gravel") && (way.tags.surface !== "fine_gravel")
        && (way.tags.surface !== "compacted") && (way.tags.surface !== "dirt") && (way.tags.surface !== "grass")
        && (way.tags.surface !== "ground") && (way.tags.surface !== "wood" && (way.tags.surface !== "mud"));

      if (way.tags) {
        const type = way.tags.highway + " " + way.tags.surface;
        if (surfaces.indexOf(type) < 0) surfaces.push(type);
      } 

      if (lastNodeId != 0 && nodes[0].id !== lastNodeId)
      {
        nodes.reverse();
      }

      if (lastNodeId != 0 && nodes[0].id !== lastNodeId) {
        if (ways == 1)
        {
          osmPath.reverse(); 

          if (osmPath[osmPath.length - 1].id !== nodes[0].id) {
            nodes.reverse();                   
          }
        } else {
          console.warn("Invalid way: " + way.id + " last node: " + lastNodeId);
          console.log(nodes.map(n => n.id).join(' - '));
          console.log(osmPath.map(n => n.id).join(' - '));          
        }
      }
      
      nodes.slice(osmPath.length > 0 ? 1 : 0).forEach(e => osmPath.push(e));

      osmPath.slice(osmPath.length - nodes.length).forEach(n => { n.asphalt = n.asphalt || asphalt; });

      lastNodeId = nodes[nodes.length - 1].id;

      //console.log(nodes.map(n => n.id).join(' - '));
      ways++;
    }
});
console.timeEnd("way");

//console.log(surfaces.sort().join("\n"));

console.log("ways: " + ways + " nodes: " + osmPath.length);

console.time("guideposts");

const geoPath = dukla_devin.features[0].geometry.coordinates;
var lastG = null;
const osmGuideposts = relation.members.filter(m => m.role === 'guidepost');

const g1 = osmGuideposts.findIndex(g => g.ref === 750494708);
if (g1 >= 0) {
  osmGuideposts.splice(g1 + 1, 0, { ref: -1 });
  osm.elements.push({ id: -1, tags: { name: "Bardejov", ele: 271 }, type: 'node', lat: 49.295323, lon: 21.279836 });
}

const g2 = osmGuideposts.findIndex(g => g.ref === 718381766);
if (g2 >= 0) {
  osmGuideposts.splice(g2 + 1, 0, { ref: -2 });
  osm.elements.push({ id: -2, tags: { name: "Hervartov", ele: 472 }, type: 'node', lat: 49.246364, lon: 21.200227 });
}

const guideposts = osmGuideposts.map((g, index) => {
  const data = osm.elements.find(e => e.type === 'node' && e.id === g.ref);

  if (data) {
    var minD = 1000000;
    var min = -1;
    osmPath.forEach((c, i) => {
      const d = WGS84Util.distanceBetween({ coordinates: [data.lon, data.lat] }, { coordinates: [c.lon, c.lat] });
      if (d < minD) {
          minD = d;
          min = i;
      }
    });

    var minGD = 1000000;
    var minG = -1;
    geoPath.forEach((c, i) => {
      const d = WGS84Util.distanceBetween({ coordinates: [data.lon, data.lat] }, { coordinates: c });
      if (d < minGD) {
          minGD = d;
          minG = i;
      }
    });

    if (min >= 0 && minG >= 0) {
      g.name = data.tags && data.tags.name ? data.tags.name : 
        data.id;
      g.ele = data.tags && data.tags.ele ? data.tags.ele : null;
      g.lat = data.lat;
      g.lon = data.lon;
      
      if (g.name === 429772590) {
        g.name = "Kubrá";
        g.ele = 220;
      }

      if (g.name === 471312526) {
        g.name = "Drietoma";
        g.ele = 240;
      } 

      if (typeof g.name != 'string') {
        console.warn("Guidepost without name: " + g.name);
      }
      g.osmIndex = min;
      g.geoIndex = minG;

      if (lastG) {
        lastG.osmIndexEnd = min;
        lastG.geoIndexEnd = minG;

        if (index == osmGuideposts.length - 1) {
          g.osmIndexEnd = osmPath.length - 1;
          g.geoIndexEnd = geoPath.length - 1;
        }
      }

      lastG = g;
      return g;
    }
    else {
      console.warn("Nearest node not found for: " + data.tags ? data.tags.name : data.id);
    }
  }
});

guideposts[0].main = true;
guideposts[guideposts.length - 1].main = true;

guideposts.filter(g => g.ref === 4353143070 || g.ref === 31562241
  || g.ref === 32461688 || g.ref === 4467331941 || g.ref === 308445592).forEach(g => { g.main = true; });

console.timeEnd("guideposts");

console.log("guideposts " + guideposts.length);

var total = 0;
guideposts.forEach(g => {

  var dist = 0;
  var asphalt = 0;
  for (var i = g.osmIndex; i < g.osmIndexEnd; i++) {
    const d = WGS84Util.distanceBetween({ coordinates: [osmPath[i].lon, osmPath[i].lat] }, { coordinates: [osmPath[i + 1].lon, osmPath[i + 1].lat] });

    dist += d;
    asphalt += (osmPath[i].asphalt && osmPath[i + 1].asphalt) ? d : 0;
  }

  var time = 0;
  var altUp = 0;
  var altDown = 0;
  for (var i = g.geoIndex; i < g.geoIndexEnd; i++) {
    const h = geoPath[i + 1][2] - geoPath[i][2];
    const d = WGS84Util.distanceBetween({ coordinates: geoPath[i] }, { coordinates: geoPath[i + 1] })
      / 1000;

    if (h > 0) altUp += h;
    if (h < 0) altDown -= h;

    if (d > 0) {       
      const hcd = h / d;    
      const dt = (hcd > 0 ? hcd
        : (-hcd < 50 ? hcd : (-hcd - 100))) / 600;
 
      time += dt * d;
    }
  }

  g.km = total;
  g.dist = dist * distCoefficient / 1000;
  g.asphalt = asphalt * distCoefficient / 1000;
  total += g.dist;

  g.altUp = altUp * altCoefficient;
  g.altDown = altDown * altCoefficient;

  g.time = g.dist / 4 + time; 
});

guideposts.forEach(g => {
  g.kmTo = total - g.km;
});

fs.writeFile("./server/data/guideposts.json", 
  JSON.stringify(guideposts.map(g => { return {
    id: g.ref,
    main: g.main,
    name: g.name,
    ele: g.ele,
    lat: g.lat,
    lon: g.lon,
    km: Math.round(g.km * 1000) / 1000, 
    kmTo: Math.round(g.kmTo * 1000) / 1000, 
    dist: Math.round(g.dist * 1000) / 1000, 
    altUp: Math.round(g.altUp), 
    altDown: Math.round(g.altDown),
    time: Math.round(g.time * 60) / 60,
    asphalt: Math.round(g.asphalt * 1000) / 1000,
  }})), (err) => { 
    if (err) 
      console.log(err); 
    else { 
      console.log("Guideposts data generated."); 
    } 
  });