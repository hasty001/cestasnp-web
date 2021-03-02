import L from 'leaflet';

class LonLayers {
  layers = [];

  constructor(minZoom, maxZoom, startLon = 17, endLon = 23, step = 1) {
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;

    for (var i = startLon; i < endLon; i += step) {
      this.layers.push({ 
        startLon: i > startLon ? i : -180, 
        endLon: i + step >= endLon ?  180 : i + step, layer: new L.LayerGroup() });
    }
  }

  filter(minLon, maxLon, not = false) {
    return this.layers.filter(l => {
      const isIn = (l.startLon >= minLon && l.startLon <= maxLon) || 
        (l.endLon >= minLon && l.endLon <= maxLon) || 
        (minLon >= l.startLon && minLon <= l.endLon) || 
        (maxLon >= l.startLon && maxLon <= l.endLon);

        return not ? !isIn : isIn;
      });
  }

  match(lon) {
    const index = this.layers.findIndex(l => lon >= l.startLon && lon < l.endLon);
    return this.layers[index].layer;
  }

  clear() {
    this.layers.forEach(l => l.layer.clearLayers());
  }

  refresh(map) {
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    if (zoom >= this.minZoom && zoom < this.maxZoom) {
      this.filter(bounds.getWest(), bounds.getEast()).forEach(l => map.addLayer(l.layer));
      this.filter(bounds.getWest(), bounds.getEast(), true).forEach(l => map.removeLayer(l.layer));
    } else {
      this.removeFrom(map);
    }
  }

  addTo(map) {
    this.layers.forEach(l => map.addLayer(l.layer));
  }

  removeFrom(map) {
    this.layers.forEach(l => map.removeLayer(l.layer));
  }
}

export default LonLayers;