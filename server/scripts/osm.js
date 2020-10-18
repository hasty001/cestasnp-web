// download OSM relation data https://www.openstreetmap.org/relation/7700604
const https = require('https');
const fs = require('fs');

var fileData = fs.createWriteStream('./server/data/snp.json');

console.log("Downloading OSM data:");

const req = https.request("https://overpass-api.de/api/interpreter", { method: 'POST' }, response => {
  response.pipe(fileData);
  fileData.on('finish', function() {
  fileData.close();
    console.log("* OSM data done");
  });
});
req.on('error', function(err) {
  console.error(err);
});

req.write(`[out:json][timeout:25];
  rel(7700604);
  (._;>>;);
  out;`);

req.end();
