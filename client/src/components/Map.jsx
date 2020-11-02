import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import devinDukla from '../geojson/devin_dukla.json';
import ostatne from '../../public/img/ostatne.png';
import razcestnik from '../../public/img/razcestnik.png';
import defaultPin from '../../public/img/pins/Cervena.png';
import { dateTimeToStr } from '../helpers/helpers';
import { findPoiCategory, PoiCategories } from './PoiCategories';
import { useStateProp } from '../helpers/reactUtils';
import * as Constants from './Constants';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
const config = {
  params: {
    center: [48.73, 19.46],
    zoomControl: false,
    zoom: 8,
    minZoom: 8,
    scrollwheel: false,
    infoControl: false,
    attributionControl: false
  },
  tileLayer: {
    uri: 'https://tile.freemap.sk/T/{z}/{x}/{y}.jpeg',
    params: {
      minZoom: 8,
      maxZoom: 14,
      id: '',
      accessToken: ''
    }
  },
  tileLayerNew: {
    uri: 'https://tile.freemap.sk/X/{z}/{x}/{y}.jpeg',
    params: {
      minZoom: 8,
      maxZoom: 19,
      id: '',
      accessToken: ''
    }
  }
};

const MapMarker = L.Marker.extend({ poi: '' });

const Map = (props) => {

  const [view, setView] = useStateProp(props.view);

  const [mapObj, setMapObj] = useState();
  const [moving, setMoving] = useState();
  const [zooming, setZooming] = useState();

  const init = (id) => {
    // this function creates the Leaflet map object and is called after the Map component mounts

    const params = Object.assign({}, config.params);
    if (view && view.lat && view.lat) { params.center = [view.lat, view.lon] }
    if (view && view.zoom) { 
      params.zoom = view.zoom; 
    } else if (props.marker || (view && view.poi)) {
      params.zoom = 13;
    }

    const map = L.map(id, params);
    L.control
      .attribution({
        prefix:
          'Mapa © <a href="https://www.freemap.sk">Freemap</a> Slovakia, dáta © prispievatelia <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a>',
        position: 'bottomright'
      })
      .addTo(map);
    L.control
      .scale({
        position: 'bottomright',
        imperial: false
      })
      .addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.geoJSON(devinDukla, {
      style: {
        color: '#fe0000',
        weight: 3,
        opacity: 0.8
      }
    }).addTo(map);

    const mapTiles = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);
    const mapTilesNew = L.tileLayer(config.tileLayerNew.uri, config.tileLayerNew.params);

    const posChanged = () => { 
      const c = map.getCenter(); 
      setView(prev => { return {...prev, lat: c.lat, lon: c.lng, zoom: map.getZoom() }; }); 
    };

    map.on("zoomend", posChanged);
    map.on("moveend", posChanged);

    map.on("movestart", () => setMoving(true));
    map.on("moveend", () => setMoving(false));

    map.on("movestart", () => setZooming(true));
    map.on("moveend", () => setZooming(false));

    const markerLayer = L.layerGroup();
    const guidepostZoomedLayer = L.layerGroup();

    const markerLayers = {};
    const legendLayers = {};
    PoiCategories.forEach(c => {
      const layer = L.layerGroup();
      markerLayers[c.value] = layer;
      legendLayers[`<span><img src="${c.iconUrl}" width="24" height="24" /> ${c.label}</span>`] = layer;
    });

    const zoomChanged = () => {
      if (map.getZoom() >= 12) {
        markerLayers[Constants.PoiCategoryGuidepost].addLayer(guidepostZoomedLayer);
      } else {
        markerLayers[Constants.PoiCategoryGuidepost].removeLayer(guidepostZoomedLayer);
      }
    };
    map.on("zoomend", zoomChanged);
    map.on("popupclose", (e) => {
      setView(prev => { return {...prev, poi: '' }; });
    });

    map.on("popupopen", (e) => {
      const poi = e.popup._source.options.poi;
      setView(prev => { return {...prev, poi }; });
    });

    L.control.layers({"turistická": mapTiles, "turistika + cyklo + běžky": mapTilesNew}, 
      props.showLayers? legendLayers : {}).addTo(map);

    updateLayers({ map, markerLayer, markerLayers, guidepostZoomedLayer });

    setMapObj({ map, markerLayer, markerLayers, guidepostZoomedLayer });
    posChanged();
    zoomChanged();
  }

  const updateLayers = ({ map, markerLayer, markerLayers, guidepostZoomedLayer }) => {
    markerLayer.clearLayers();
    guidepostZoomedLayer.clearLayers();

    Object.values(markerLayers).forEach(l => { l.clearLayers(); markerLayer.addLayer(l); });
    
    // MARKER 
    if (props.marker) {
      const icon = L.icon({
        iconUrl: ostatne,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      const marker = L.marker([props.marker.lat, props.marker.lon], {
        icon
      }).addTo(markerLayer);
      marker.bindPopup(props.marker.name);
    }

    const guideposts = (props.guideposts || []).concat((props.pois || []).filter(p => p.category == "razcestnik"));
    // GUIDEPOSTS 
    if (guideposts) {
      guideposts.forEach(g => {
        const icon = L.icon({
          iconUrl: razcestnik,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        
        const marker = new MapMarker([g.lat, g.lon], {
          icon, riseOnHover: true, poi: g.id
        }).addTo(g.main ? markerLayers[Constants.PoiCategoryGuidepost] : guidepostZoomedLayer);

        marker.bindPopup(`<h4><a href="/pred/itinerar#g${g.id}">${g.name} ${g.ele ? ` ${g.ele} m`: ""}</a></h4>`);

        if (view && view.poi == g.id) {
          marker.once("add", () => {
            marker.getPopup().options.autoPan = false;
            marker.openPopup();
            marker.getPopup().options.autoPan = true;
           });
        }
      });

      if (map.getZoom() >= 12) {
        markerLayers[Constants.PoiCategoryGuidepost].addLayer(guidepostZoomedLayer);
      } else {
        markerLayers[Constants.PoiCategoryGuidepost].removeLayer(guidepostZoomedLayer);
      }
    }

    // DOLEZITE MIESTA
    if (props.pois && props.pois.length > 0) {
      props.pois.filter(p => p.category != "razcestnik").forEach(p => {
        
        const poiCategory = findPoiCategory(p.category);

        const icon = L.icon({
          iconUrl: poiCategory.iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = new MapMarker([p.coordinates[1], p.coordinates[0]], {
          icon, riseOnHover: true, poi: p._id
        }).addTo(markerLayers[poiCategory.value]);

        marker.bindPopup(`<h4><a href="/pred/pois/${p._id}">${p.name || poiCategory.label}</a></h4>
          <p>GPS: ${p.coordinates[1]}, ${p.coordinates[0]}</p>
          <p>${p.text}</p>`);

        if (view && view.poi == p._id) {
          marker.once("add", () => {
            marker.getPopup().options.autoPan = false;
            marker.openPopup();
            marker.getPopup().options.autoPan = true;
           });
        }
      });
    }

    // TRAVELLER MSGs
    if (props.stops && props.stops.length > 0) {
      props.stops.forEach(stop => {
        if (stop.type === 'message') {
          const icon = L.divIcon({
            html: `<img src=${defaultPin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });
          const marker = L.marker([stop.lat, stop.lon], { icon, riseOnHover: true }).addTo(markerLayer);
          marker.bindPopup(`<p>${dateTimeToStr(stop.date)}</p>
          <p>${stop.text}</p>`);
        }
      });
    }

    // ACTIVE TRAVELLERS
    if (
      props.use === 'na-ceste-map-active' &&
      props.travellers.length > 0
    ) {
      props.travellers.forEach(trvlr => {
        if (trvlr.lastMessage && trvlr.color !== '#b19494') {
          const icon = L.divIcon({
            html: `<img src=${trvlr.pin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });
          const marker = L.marker(
            [trvlr.lastMessage.lat, trvlr.lastMessage.lon],
            {
              icon, riseOnHover: true
            }
          ).addTo(markerLayer);
          marker.bindPopup(`
          <p><b><a href='/na/${trvlr.userId}' style={text-decoration: none;}>${trvlr.meno}</a></b></p>
          <p>${dateTimeToStr(trvlr.lastMessage.pub_date)}</p>
          <p>${trvlr.lastMessage.text}</p>`);
        }
      });
    }

    markerLayer.addTo(map);
  }

  useEffect(() => {
    init(props.use);
  }, []);

  useEffect(() => {    
    if (mapObj && !moving && !zooming) {
      const mapCenter = mapObj.map.getCenter();
      const mapZoom = mapObj.map.getZoom();
      if ((view.zoom != mapZoom || view.lat != mapCenter.lat || view.lon != mapCenter.lng)) {
        mapObj.map.setView({ lat: view.lat || mapCenter.lat, lon: view.lon || mapCenter.lng, zoom: view.zoom || mapZoom }, { animate: false });
      }
    }
  }, [props.view]);

  useEffect(() => {
    if (mapObj) {
      updateLayers(mapObj);
    }
  }, [props.pois, props.guideposts, props.marker, props.stop, props.travellers]);

  return <div id={props.use}/>;
}

export default Map;
