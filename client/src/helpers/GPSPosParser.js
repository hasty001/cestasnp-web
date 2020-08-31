const GPSRegeEx = 
  /^(([NS])\s*)?((\-?\d+([\.,]\d+)?)°?)(\s*(\d+([\.,]\d+)?)')?(\s*(\d+([\.,]\d+)?)")?(\s*([NS]))?\s*[,]?\s(([EW])\s*)?((\-?\d+([\.,]\d+)?)°?)(\s*(\d+([\.,]\d+)?)')?(\s*(\d+([\.,]\d+)?)")?(\s*([EW]))?$/;
const GPSRegeExGroups = { latSym1: 2, lat: 4, latMin: 7, latSec: 10, latSym2: 13, 
                          lonSym1: 15, lon: 17, lonMin: 20, lonSec: 23, lonSym2: 26};    

const parseGPSPos = (text) => {
  if (!text) 
    return null;

  var value = text.trim();
   
  if (value.length === 0)
    return null;

  var result = GPSRegeEx.exec(value);

  if (!result || result.length === 0)
    return null;

  var lat = parseFloat(result[GPSRegeExGroups.lat].replace(',', '.'));
  var latMinSec = 
    (result[GPSRegeExGroups.latMin] ? parseFloat(result[GPSRegeExGroups.latMin].replace(',', '.')) / 60 : 0) +
    (result[GPSRegeExGroups.latSec] ? parseFloat(result[GPSRegeExGroups.latSec].replace(',', '.')) / 3600 : 0);

  lat = lat > 0 ? (lat + latMinSec) : (lat - latMinSec);

  if (result[GPSRegeExGroups.latSym1] === "S" || result[GPSRegeExGroups.latSym2] === "S")
    lat = -lat;

  var lon = parseFloat(result[GPSRegeExGroups.lon].replace(',', '.'));
  var lonMinSec = 
    (parseFloat(result[GPSRegeExGroups.lonMin]) ? parseFloat(result[GPSRegeExGroups.lonMin].replace(',', '.')) / 60 : 0) +
    (parseFloat(result[GPSRegeExGroups.lonSec]) ? parseFloat(result[GPSRegeExGroups.lonSec].replace(',', '.')) / 3600 : 0);

  lon = lon > 0 ? (lon + lonMinSec) : (lon - lonMinSec);

  if (result[GPSRegeExGroups.lonSym1] === "W" || result[GPSRegeExGroups.lonSym2] === "W")
    lon = -lon;

  if (Number.isNaN(lat) || Number.isNaN(lon))
    return null;

  return new Array(lat, lon);
};
  
export { parseGPSPos };