import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import devinDukla from '../geojson/devin_dukla.json';
import razcestnik from '../../public/img/razcestnik.png';
import { dateTimeToStr } from '../helpers/helpers';
import { findPoiCategory, PoiCategories } from './PoiCategories';
import { useStateProp } from '../helpers/reactUtils';
import * as Constants from './Constants';
import { generateAnchor } from './reusable/Navigate';

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
      legendLayers[`<span><i class="${c.icon}" style="width: ${Constants.PoiIconSize}px; height: ${Constants.PoiIconSize}px" alt="${c.label}"></i> ${c.label}</span>`] = layer;
    });

    markerLayers["marker"] = L.layerGroup();

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
    };
    map.off("popupopen", popupOpen);
    map.on("popupopen", popupOpen);

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
          icon, poi: g.id, zIndexOffset: -4000,
          popupContent: `<h4>${generateAnchor(`/pred/itinerar#g${g.id}`, '', `<i class="${guidepostIcon}"></i> ${g.name} ${g.ele ? ` ${g.ele}\u00A0m`: ""}`)}</h4>`
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
      const food = findPoiCategory(Constants.PoiCategoryFood);
      const water = findPoiCategory(Constants.PoiCategoryWater);

      props.pois.filter(p => (!p.deleted || props.showDeleted) && p.category != "razcestnik").forEach(p => {
        
        const poiCategory = findPoiCategory(p.category);

        const categories = [ poiCategory ];

        if (p.food) {
          categories.push(food);
        }

        if (p.water) {
          categories.push(water);
        }

        categories.forEach((category, i) => {
          const icon = L.divIcon({
            html: 
              `<i class="fas fa-map-marker icon-stack" style="width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px" ></i>
              <i class="fas ${category.icon} fa-inverse icon-stack" style="width: ${Constants.PoiMarkerSize/2}px; height: ${Constants.PoiMarkerSize/2}px" data-fa-transform="up-3" ></i>`,
              ...Constants.PoiMarkerIconProps,
          });

          const marker = new MapMarker([p.coordinates[1], p.coordinates[0]], {
            icon, poi: p._id, zIndexOffset: -i,
            popupContent: `<h4>${generateAnchor(`/pred/pois/${p._id}`, '',
              `<i class="${poiCategory.icon}"></i>${p.food ? `<i class="${food.icon}"></i>` : ''}${p.water ? `<i class="${water.icon}"></i>` : ''} ${p.name || poiCategory.label}`)}</h4>
            <p>GPS: ${p.coordinates[1]}, ${p.coordinates[0]}</p>
            <p>${p.text}</p>`
          }).addTo(markerLayers[category.value]);

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
            html: `<i class="fas fa-map-marker-alt mapMarker" alt="Ukazovatel na mape" style="color: ${trvlr.color}; width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px"></i>`,
            ...Constants.PoiMarkerIconProps,
          });
          const marker = L.marker(
            [trvlr.lastMessage.lat, trvlr.lastMessage.lon],
            {
              icon,
              popupContent: `<p><b>${generateAnchor(`/na/${trvlr.userId}`, 'style="{text-decoration: none;}"', trvlr.meno)}</b></p>
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
    if (props.marker ) {
      const icon = L.divIcon({
        html: `<i class="fas fa-map-marker-alt" style="width: ${Constants.PoiMarkerSize}px; height: ${Constants.PoiMarkerSize}px; color: ${props.marker.color || "blue"}" ></i>`,
        ...Constants.PoiMarkerIconProps,
      });
      const marker = L.marker([props.marker.lat, props.marker.lon], {
        icon, zIndexOffset: 2
      }).addTo(layer);
      if (props.marker.name) { 
        marker.bindPopup(props.marker.name);
      }

      if (props.marker.accuracy) {
        const circle = L.circle([props.marker.lat, props.marker.lon], { 
          zIndexOffset: -3999,
          color: props.marker.color || "blue",
          opacity: 0.5,
          fillColor: props.marker.color || "blue",
          fillOpacity: 0.2,
          radius: props.marker.accuracy }).addTo(layer);
      }
    }
  }, [mapObj, props.marker]);

  return <div id={props.use} data-nosnippet/>;
}

export default Map;
