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

const MapMarker = L.Marker.extend({ poi: '', popupContent: '' });

const Map = (props) => {

  const [view, setView] = useStateProp(props.view);

  const [mapObj, setMapObj] = useState();
  const [markers, setMarkers] = useState([]);
  const [moving, setMoving] = useState();
  const [zooming, setZooming] = useState();

  const parse = (value, def) => {
    try {
      const res = parseFloat(value);
      return !res || isNaN(res) ? def : res;
    } catch (error) {
      return def;
    }
  }

  const init = (id) => {
    // this function creates the Leaflet map object and is called after the Map component mounts

    const params = Object.assign({}, config.params);
    if (view && view.lat && view.lat) { params.center = [parse(view.lat, params.center[0]), parse(view.lon, params.center[1])] }
    if (view && view.zoom) { 
      params.zoom = parse(view.zoom, params.zoom); 
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

    L.control.layers({"turistická": mapTiles, "turistika + cyklo + běžky": mapTilesNew}, 
      props.showLayers? legendLayers : {}).addTo(map);

    posChanged();
    zoomChanged();

    setMapObj({ map, markerLayer, markerLayers, guidepostZoomedLayer });
  }

  const updateLayers = ({ map, markerLayer, markerLayers, guidepostZoomedLayer }) => {
    const poiPopupClose = (e) => {
      const poi = e.popup._source.options.poi;
      if (poi) {
        setView(prev => { return {...prev, poi: '' }; });
      }
    };
    const poiPopupOpen = (e) => {
      const poi = e.popup._source.options.poi;
      if (poi) {
        setView(prev => { return {...prev, poi }; });
      }
    };

    map.off("popupclose", poiPopupClose);
    map.off("popupopen", poiPopupOpen);

    markerLayer.clearLayers();
    guidepostZoomedLayer.clearLayers();
    const newMarkers = [];

    Object.values(markerLayers).forEach(l => { l.clearLayers(); markerLayer.addLayer(l); });

    // join popup content of nearby markers
    const popupOpen = (e) => {
      const content = e.popup.getContent();
      const latLng = e.popup.getLatLng();

      const minDistance = map.containerPointToLatLng([0, 0])
        .distanceTo(map.containerPointToLatLng([Constants.NearByMarkersDistance, Constants.NearByMarkersDistance]));

      const newContentItems = [e.popup._source.options.popupContent];
      newMarkers.forEach(m => {
        const mPos = m.getLatLng();

        if (m.options.popupContent && m.getElement() && mPos.distanceTo(latLng) < minDistance) {
          const popupContent = m.options.popupContent;

          if (newContentItems.indexOf(popupContent) < 0) {
            newContentItems.push(popupContent);
          }
        }
      });

      const newContent = newContentItems.join("\n<hr/>");
      if (content != newContent) {
        e.popup.setContent(newContent);
      }
    };
    map.off("popupopen", popupOpen);
    map.on("popupopen", popupOpen);
    
    // MARKER 
    if (props.marker) {
      const icon = L.icon({
        iconUrl: ostatne,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      const marker = L.marker([props.marker.lat, props.marker.lon], {
        icon,
        popupContent: props.marker.name
      }).addTo(markerLayer);
      marker.bindPopup("");
      newMarkers.push(marker);
    }

    const guideposts = (props.guideposts || []).concat((props.pois || []).filter(p => p.category == "razcestnik"));
    // GUIDEPOSTS 
    if (guideposts) {
      const guidepostIcon = findPoiCategory(Constants.PoiCategoryGuidepost).icon;

      guideposts.forEach(g => {
        const icon = L.icon({
          iconUrl: razcestnik,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        
        const marker = new MapMarker([g.lat, g.lon], {
          icon, poi: g.id,
          popupContent: `<h4><a href="/pred/itinerar#g${g.id}"><i class="${guidepostIcon}"></i> ${g.name} ${g.ele ? ` ${g.ele} m`: ""}</a></h4>`
        }).addTo(g.main ? markerLayers[Constants.PoiCategoryGuidepost] : guidepostZoomedLayer);
        newMarkers.push(marker);
  
        marker.bindPopup("");
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
          icon, poi: p._id,
          popupContent: `<h4><a href="/pred/pois/${p._id}"><i class="${poiCategory.icon}"></i> ${p.name || poiCategory.label}</a></h4>
          <p>GPS: ${p.coordinates[1]}, ${p.coordinates[0]}</p>
          <p>${p.text}</p>`
        }).addTo(markerLayers[poiCategory.value]);
        newMarkers.push(marker);

        marker.bindPopup("");
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
          const marker = L.marker([stop.lat, stop.lon], { icon,
            popupContent: `<p>${dateTimeToStr(stop.date)}</p>
          <p>${stop.text}</p>` }).addTo(markerLayer);
          newMarkers.push(marker);
          marker.bindPopup("");
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
              icon,
              popupContent: `<p><b><a href='/na/${trvlr.userId}' style={text-decoration: none;}>${trvlr.meno}</a></b></p>
          <p>${dateTimeToStr(trvlr.lastMessage.pub_date)}</p>
          <p>${trvlr.lastMessage.text}</p>`
            }
          ).addTo(markerLayer);
          newMarkers.push(marker);
          marker.bindPopup("");
        }
      });
    }

    markerLayer.addTo(map);
    
    map.on("popupclose", poiPopupClose);
    map.on("popupopen", poiPopupOpen);

    setMarkers(newMarkers);
  }

  useEffect(() => {
    init(props.use);
  }, []);

  useEffect(() => {   
    if (mapObj && !moving && !zooming) {
      const mapCenter = mapObj.map.getCenter();
      const mapZoom = mapObj.map.getZoom();

      if ((view.zoom != mapZoom || view.lat != mapCenter.lat || view.lon != mapCenter.lng)) {
        console.log("setView");
        mapObj.map.setView({ lat: parse(view.lat, mapCenter.lat), lon: parse(view.lon, mapCenter.lng) }, 
          parse(view.zoom, mapZoom), { animate: false });
      }
    }

    if (mapObj && markers) {
      if (!view.poi) {
        const index = markers.findIndex(m => m.options.poi && m.isPopupOpen());
        if (index >= 0) {
          markers[index].closePopup();
        }
      } else {
        const index = markers.findIndex(m => m.options.poi == view.poi);
        if (index >= 0) {
          const marker = markers[index];
          if (!marker.isPopupOpen()) {
            if (marker.getElement()) {
              marker.getPopup().options.autoPan = false;
              marker.openPopup();
              marker.getPopup().options.autoPan = true;
            } else {
              marker.once("add", () => {
                marker.getPopup().options.autoPan = false;
                marker.openPopup();
                marker.getPopup().options.autoPan = true;
              });
            }
          }
        }
      }
    }
  }, [mapObj, view, moving, zooming, markers]);

  useEffect(() => {
    if (mapObj) {
      updateLayers(mapObj);
    }
  }, [mapObj, props.pois, props.guideposts, props.marker, props.stop, props.travellers]);

  return <div id={props.use}/>;
}

export default Map;
