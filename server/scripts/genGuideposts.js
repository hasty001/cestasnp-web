const WGS84Util = require('wgs84-util');
const fs = require('fs');

const snp = require('../data/snp_ele.json');
const osm = require('../data/snp.json');
const { saveGpx } = require('../util/gpsUtils');

const altCoefficient = 1.0;
const distCoefficient = 1.05;

const relation = osm.elements.find(e => e.type === 'relation' && e.id === 7700604);

const ignoreWays = [315949251, 1084429114]
var surfaces = [];
var lastNodeId = 0;
var ways = 0;
var osmPath = [];
console.time("way");
relation.members.filter(m => m.type === 'way').forEach(w => {
    const way = osm.elements.find(e => e.type === 'way' && e.id === w.ref);
    const nodes = way.nodes.map(n => osm.elements.find(e => e.type === 'node' && e.id === n));
    
    if (nodes && nodes.length > 1 && !ignoreWays.includes(w.ref)) {

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
          console.log("Nodes: ", nodes.map(n => n.id).join(' - '));
          console.log("Way end: ", osmPath.map(n => n.id).slice(-3).join(' - '));          
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

saveGpx("./server/data/snp_raw.gpx", osmPath.reverse());

//console.log(surfaces.sort().join("\n"));

console.log("ways: " + ways + " nodes: " + osmPath.length);

console.time("guideposts");

const geoPath = snp.features[0].geometry.coordinates;
const osmGuideposts = relation.members.filter(m => m.role === 'guidepost');

const guideposts = osmGuideposts.map(g => {
  const data = osm.elements.find(e => e.type === 'node' && e.id === g.ref);

  if (data && data.tags && data.tags.name) {
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

      if (typeof g.name != 'string') {
        console.warn("Guidepost without name: " + g.name);
      }
      g.osmIndex = min;
      g.geoIndex = minG;

      return g;
    }
    else {
      console.warn("Nearest node not found for: " + data.tags ? data.tags.name : data.id);
    }
  }

  return null;
}).filter(g => g);

guideposts.sort((a, b) => a.osmIndex - b.osmIndex);

var lastG = null;
guideposts.forEach((g, index) => {
  if (lastG) {
    lastG.osmIndexEnd = g.osmIndex;
    lastG.geoIndexEnd = g.geoIndex;
  }

  if (index == osmGuideposts.length - 1) {
    g.osmIndexEnd = osmPath.length - 1;
    g.geoIndexEnd = geoPath.length - 1;
  }

  lastG = g;
});

guideposts[0].main = true;
guideposts[0].name = "Dukliansky priesmyk, štátna hranica";
guideposts[guideposts.length - 1].main = true;

guideposts.filter(g => g.ref === 4353143070 || g.ref === 8845838790
  || g.ref === 32461688 || g.ref === 4467331941 || g.ref === 308445592).forEach(g => { g.main = true; });

console.timeEnd("guideposts");

console.log("guideposts " + guideposts.length);

var total = 0;
var totalUp = 0;
var totalDown = 0;
var totalTime = 0;
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

  g.time = Math.max(0, g.dist / 4 + time);

  totalUp += g.altUp;
  totalDown += g.altDown;
  totalTime += g.time;
});

guideposts.forEach(g => {
  g.kmTo = total - g.km;
});

console.log("Total", total, "Up", totalUp, "Down", totalDown, "Time", totalTime);

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
    pathIndex: g.geoIndex,
    pathIndexEnd: g.geoIndexEnd
  }})), (err) => { 
    if (err) 
      console.log(err); 
    else { 
      console.log("Guideposts data generated."); 
    } 
  });