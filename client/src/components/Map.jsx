import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import devinDukla from '../geojson/devin_dukla.json';
import razcestnik from '../../public/img/razcestnik.png';
import { dateTimeToStr, escapeHtml, htmlSimpleSanitize } from '../helpers/helpers';
import { findPoiCategory, PoiCategories } from './PoiCategories';
import { useStateProp, useStateWithLocalStorage } from '../helpers/reactUtils';
import * as Constants from './Constants';
import { generateAnchor } from './reusable/Navigate';
import LonLayers from './reusable/LonLayers';
import { Modal } from 'react-bootstrap';

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
  const [popupContent, setPopupContent] = useState('');

  const [mapTilesLayer, setMapTilesLayer] = useStateWithLocalStorage("MapTilesLayer", props.tiles);

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
    } else if ((props.markers && props.markers.filter(m => m).length > 0) || (view && view.poi)) {
      params.zoom = 13;
    }

    const map = L.map(id, params);
    L.control
      .attribution({
        prefix:
          'Mapa © <a href="https://www.freemap.sk" target="_blank">Freemap</a> Slovakia, dáta © prispievatelia <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a>',
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

    const mapTiles = L.tileLayer(config.tileLayer.uri, config.tileLayer.params);
    const mapTilesNew = L.tileLayer(config.tileLayerNew.uri, config.tileLayerNew.params);

    if (mapTilesLayer == "new") {
      mapTilesNew.addTo(map);
    } else {
      mapTiles.addTo(map);
    }

    map.on('baselayerchange', e => setMapTilesLayer(e.name == "turistika + cyklo + běžky" ? "new" : null));

    const guidepostZoomedLayers = new LonLayers(12, 1000);
    
    const posChanged = () => { 
      const c = map.getCenter(); 
      setView(prev => { return {...prev, lat: c.lat, lon: c.lng, zoom: map.getZoom() }; }); 

      guidepostZoomedLayers.refresh(map);
    };

    map.on("zoomend", posChanged);
    map.on("moveend", posChanged);

    map.on("movestart", () => setMoving(true));
    map.on("moveend", () => setMoving(false));

    map.on("movestart", () => setZooming(true));
    map.on("moveend", () => setZooming(false));

    const markerLayer = L.layerGroup();    

    const markerLayers = {};
    const legendLayers = {};
    PoiCategories.forEach(c => {
      const layer = L.layerGroup();
      markerLayers[c.value] = layer;
      legendLayers[`<span><i class="${c.icon}" style="width: ${Constants.PoiIconSize}px; height: ${Constants.PoiIconSize}px" alt="${c.label}"></i> ${c.label}</span>`] = layer;
    });

    markerLayers["marker"] = L.layerGroup();

    L.control.layers({"turistická": mapTiles, "turistika + cyklo + běžky": mapTilesNew}, 
      props.showLayers? legendLayers : {}).addTo(map);

    posChanged();

    setMapObj({ map, markerLayer, markerLayers, guidepostZoomedLayers });
  }

  const updateLayers = ({ map, markerLayer, markerLayers, guidepostZoomedLayers }) => {
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

    map.removeLayer(markerLayer);

    markerLayer.clearLayers();
    guidepostZoomedLayers.clear();
    const newMarkers = [];

    markerLayer.addLayer(markerLayers["marker"]);
    markerLayer.addLayer(markerLayers["marker"]);
    Object.values(markerLayers).filter(l => l != markerLayers["marker"])
      .forEach(l => { l.clearLayers(); markerLayer.addLayer(l); });

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

      const newContent = newContentItems.filter(i => i).join("\n<hr/>");
      if (newContent && content != newContent) {
        e.popup.setContent(newContent);
      }

      setPopupContent(newContent);
    };
    map.off("popupopen", popupOpen);
    map.on("popupopen", popupOpen);

    // DOLEZITE MIESTA
    if (props.pois && props.pois.length > 0) {
      const food = findPoiCategory(Constants.PoiCategoryFood);
      const water = findPoiCategory(Constants.PoiCategoryWater);

      const categoryIcons = {};
      PoiCategories.filter(c => c.value != Constants.PoiCategoryGuidepost).forEach(category => { 
        categoryIcons[category.value] = L.divIcon({
          html: 
            `<i class="fas fa-map-marker icon-stack" style="width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px" ></i>
            <i class="fas ${category.icon} fa-inverse icon-stack" style="width: ${Constants.PoiMarkerSize/2}px; height: ${Constants.PoiMarkerSize/2}px" data-fa-transform="up-3" ></i>`,
            ...Constants.PoiMarkerIconProps,
        })});

      categoryIcons[Constants.PoiCategoryGuidepost] = L.icon({
        iconUrl: razcestnik,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      props.pois.filter(p => (!p.deleted || props.showDeleted)).forEach(p => {
        
        const poiCategory = findPoiCategory(p.category);

        const categories = [ poiCategory ];

        if (p.food) {
          categories.push(food);
        }

        if (p.water) {
          categories.push(water);
        }

        categories.forEach((category, i) => {
          const marker = new MapMarker([p.coordinates[1], p.coordinates[0]], {
            icon: categoryIcons[category.value], poi: p._id || p.id, zIndexOffset: -i,
            popupContent: `<h4>${generateAnchor(p.url || `/pred/pois/${p._id}`, '',
              `<i class="${poiCategory.icon}"></i>${p.food ? `<i class="${food.icon}"></i>` : ''}${p.water ? `<i class="${water.icon}"></i>` : ''} ${escapeHtml(p.name) || poiCategory.label}`)}</h4>
            <p>GPS: ${p.coordinates[1]}, ${p.coordinates[0]}</p>
            <p>${htmlSimpleSanitize(p.text)}</p>`
          }).addTo(
            category.value == Constants.PoiCategoryGuidepost && !p.main ? 
              guidepostZoomedLayers.match(p.coordinates[0])
              : markerLayers[category.value]);

          newMarkers.push(marker);

          marker.bindPopup("");
        });
      });
    }

    // TRAVELLER MSGs
    if (props.stops && props.stops.length > 0) {
      props.stops.forEach(stop => {
        if (stop.type === 'message') {
          const icon = L.divIcon({
            html: `<i class="fas fa-map-marker-alt mapMarker" alt="Ukazovatel na mape" style="width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px"></i>`,
            ...Constants.PoiMarkerIconProps,
          });
          const marker = L.marker([stop.lat, stop.lon], { icon,
            popupContent: `<p>${dateTimeToStr(stop.date)}</p>
          <p>${htmlSimpleSanitize(stop.text)}</p>` }).addTo(markerLayer);
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
            html: `<i class="fas fa-map-marker-alt mapMarker" alt="Ukazovatel na mape" style="color: ${trvlr.color}; width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px"></i>`,
            ...Constants.PoiMarkerIconProps,
          });
          const marker = L.marker(
            [trvlr.lastMessage.lat, trvlr.lastMessage.lon],
            {
              icon,
              popupContent: `<p><b>${generateAnchor(`/na/${trvlr.userId}`, 'style="{text-decoration: none;}"', escapeHtml(trvlr.meno))}</b></p>
          <p>${dateTimeToStr(trvlr.lastMessage.pub_date)}</p>
          <p>${htmlSimpleSanitize(trvlr.lastMessage.text)}</p>`
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

    return () => {
      map.off();
      map.remove();
    };
  }

  useEffect(() => {
    return init(props.use);
  }, []);

  useEffect(() => {   
    if (mapObj && !moving && !zooming) {
      const mapCenter = mapObj.map.getCenter();
      const mapZoom = mapObj.map.getZoom();

      if ((view.zoom != mapZoom || view.lat != mapCenter.lat || view.lon != mapCenter.lng)) {
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
  }, [mapObj, props.pois, props.guideposts, props.stop, props.travellers]);

  useEffect(() => {
    if (!mapObj || !mapObj.markerLayers || !mapObj.markerLayers["marker"]) {
      return;
    }

    const layer = mapObj.markerLayers["marker"];
    layer.clearLayers();

    // MARKER 
    if (props.markers) {
      props.markers.filter(m => m).forEach(m => {
        const icon = L.divIcon({
          html: `<i class="fas fa-map-marker-alt" style="width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px; color: ${m.color || "blue"}" ></i>`,
          ...Constants.PoiMarkerIconProps,
        });
        const marker = L.marker([m.lat, m.lon], {
          icon, zIndexOffset: 2
        }).addTo(layer);

        if (m.name) { 
          marker.bindPopup(m.name);
        }

        if (m.accuracy) {
          const circle = L.circle([m.lat, m.lon], { 
            zIndexOffset: -3999,
            color: m.color || "blue",
            opacity: 0.5,
            fillColor: m.color || "blue",
            fillOpacity: 0.2,
            radius: m.accuracy }).addTo(layer);
        }
      });
    }
  }, [mapObj, props.markers]);

  return (
    <div id={props.use} data-nosnippet>
      {props.children}

      <Modal className="map-popup-dialog" show={!!popupContent && window.innerWidth <= 600} onHide={() => { setPopupContent(''); mapObj.map.closePopup(); }}>
        <Modal.Header closeButton/>
        <Modal.Body>
          <div className="map-popup-content" dangerouslySetInnerHTML={{ __html: popupContent }}>
          </div>
        </Modal.Body>
        <Modal.Footer>{' '}</Modal.Footer>
      </Modal>
    </div>);
}

export default Map;
