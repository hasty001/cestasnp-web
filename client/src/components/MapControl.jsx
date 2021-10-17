import React, { useRef, useState, useEffect } from "react"
import MapContext from "./MapContext";
import 'ol/ol.css';
import * as ol from "ol";
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, get, toLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Text, Icon, Circle as CircleStyle } from 'ol/style';
import { defaults as defaultInteraction, KeyboardPan } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON';
import { OSM, Vector as VectorSource } from 'ol/source';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import { ScaleLine, Attribution, defaults as defaultControls } from 'ol/control';
import devinDukla from '../geojson/devin_dukla.json';
import razcestnik from '../../public/img/razcestnik.png';
import * as Constants from './Constants';
import { faMapMarkerAlt, faMapMarker, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useStateProp, useStateWithLocalStorage, useStateResize } from "../helpers/reactUtils";
import { findPoiCategory, PoiCategories } from "./PoiCategories";
import { generateAnchor } from "./reusable/Navigate";
import { dateTimeToStr, escapeHtml, htmlSimpleSanitize } from "../helpers/helpers";
import { Modal } from "react-bootstrap";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";

const FreeMapTiles = new TileLayer({
  title: 'turistika + cyklo + bežky',
  type: 'base',
  className: "free-map",
  maxZoom: 19,
  minZoom: 1,
  source: new OSM({
    attributions:  'Mapa © <a href="https://www.freemap.sk" target="_blank">Freemap</a> Slovakia, dáta © prispievatelia <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a>',
    url: 'https://tile.freemap.sk/X/{z}/{x}/{y}.jpeg',
    crossOrigin: null
  }),
  zIndex: 0
});

const hiddenStyle = new Style(null);

const svg = (iconDefinition, color) => encodeURIComponent(`<svg width="${iconDefinition.icon[0]}" height="${iconDefinition.icon[1]}" version="1.1" xmlns="http://www.w3.org/2000/svg">`
  + `<path d="${iconDefinition.icon[4]}" fill="${color}" stroke="none" />`
  + '</svg>');

const shadowOuterStyle = new Style({
  image: new Icon({
    opacity: 0.6,
    src: 'data:image/svg+xml,' + svg(faMapMarker, 'white'),
    scale: Constants.PoiMarkerSize / 512.0 * 1.08,
    anchor: [0.5, 1],
    imgSize: [faMapMarker.icon[0], faMapMarker.icon[1]]
  })
});

const getMarkerStyle = (color, zIndex, withShadow = false, symbol = null) => {

  const symbolColor = color == "white" ? "red" : "white";

  const markerStyle = color => 
    new Style({
      image: new Icon({
        opacity: 1,
        src: 'data:image/svg+xml,' + svg(faMapMarker, color),
        scale: Constants.PoiMarkerSize / 512.0,
        anchor: [0.5, 1],
        imgSize: [faMapMarker.icon[0], faMapMarker.icon[1]],
      }),
      text: new Text({
        opacity: 1,
        font: '500 15px Ubuntu,sans-serif',
        text: symbol || "⬤",
        offsetY: -20,
        fill: new Fill({ color: symbolColor }),
      }),
      zIndex
    });

  return [withShadow ? shadowOuterStyle : null, markerStyle(color)].filter(s => s);
}

const getPoiMarkerStyle = (iconDefinition, uncertain, color, zIndex) => {

  const markerStyle = new Style({
    image: new Icon({
      opacity: 1,
      src: 'data:image/svg+xml,' + svg(faMapMarker, color),
      scale: Constants.PoiMarkerSize / 512.0,
      imgSize: [faMapMarker.icon[0], faMapMarker.icon[1]],
      anchor: [0.5, 1]
    }),
    zIndex
  });

  const markerIconStyle = iconDefinition => new Style({
    image: new Icon({
      opacity: 1,
      src: 'data:image/svg+xml,' + svg(iconDefinition, 'white'),
      scale: Constants.PoiMarkerSize / Math.max(iconDefinition.icon[0], iconDefinition.icon[1]) / 2.1,
      anchor: [0.5, (iconDefinition.icon[1] < iconDefinition.icon[0]) ? 1.95 : 1.8],
      imgSize: [iconDefinition.icon[0], iconDefinition.icon[1]]
    }),
    zIndex
  });

  const badge = new Style({ 
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color }),
      displacement: [8, 14],
    }), zIndex });

  const uncertainIconDefintion = faQuestion;
  const badgeIcon = new Style({ 
    image: new Icon({
      opacity: 1,
      src: 'data:image/svg+xml,' + svg(uncertainIconDefintion, 'white'),
      scale: Constants.PoiMarkerSize / Math.max(uncertainIconDefintion.icon[0], uncertainIconDefintion.icon[1]) / 3.5,
      imgSize: [uncertainIconDefintion.icon[0], uncertainIconDefintion.icon[1]],
      anchor: [-0.7, 2],
    }), zIndex });

  return [markerStyle, markerIconStyle(iconDefinition), 
    uncertain ? badge : null,  uncertain ? badgeIcon : null].filter(s => s);
}

const clear = (layer, kind) => {
  layer.getFeatures().filter(f => kind.indexOf(f.get('kind') || '') >= 0).forEach(
    f => layer.removeFeature(f)
  );
}

const initialCenter = [19.46, 48.73];

const MapControl = ({ id, children, view, travellers, stops, pois, markers, canScroll, showDeleted, showLayers }) => {
  const mapRef = useRef();
  const popupRef = useRef();
  const [map, setMap] = useState(null);
  const [mapMarkerSource, setMapMarkerSource] = useState(null);
  const [zoom, setZoom] = useState(8);
  const [center, setCenter] = useState(initialCenter);
  const [viewProp, setViewProp] = useStateProp(view);
  const [popupContent, setPopupContent] = useState('');
  const [popupFeature, setPopupFeature] = useState(null);
  const [canFullScreen, setCanFullScreen] = useStateResize(() => window.innerWidth <= Constants.MaxFullscreenPopupWidth);
  const [moving, setMoving] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [mapLayersHide, setMapLayersHide] = useStateWithLocalStorage("MapLayersHide", []);

  const showPopup = (map, feature) => {
    if (!feature) {
      return;
    }

    setViewProp(prev => { return {...prev, poi: feature.get('popupId') || '' }; });

    if (window.innerWidth > Constants.MaxFullscreenPopupWidth) {
      const coords = feature.getGeometry().getCoordinates();
      map.getOverlays().item(0).setPosition(coords);
    }
  }

  useEffect(() => {

    const routeSource = new VectorSource({
      features: new GeoJSON().readFeatures(devinDukla, { featureProjection: 'EPSG:3857' }),
    });
    
    const routeLineStyle = new Style({
      stroke: new Stroke({
        color: [255, 0, 0, 0.8],
        width: 3,
      })
    });

    let routeLayer = new VectorLayer({
      source: routeSource,
      style: (feature) => routeLineStyle,
    });

    const poiStyle = {};
    const poiStyleSelected = {};
    PoiCategories.filter(c => c.value != Constants.PoiCategoryGuidepost).forEach((category, i) => { 
      let p = getPoiMarkerStyle(category.iconDefinition, false, 'black', 30 + i * 10);
      let pu = getPoiMarkerStyle(category.iconDefinition, true, 'black', 30 + i * 10);
      let ps = getPoiMarkerStyle(category.iconDefinition, false, 'red', 1000);
      let psu = getPoiMarkerStyle(category.iconDefinition, true, 'red', 1000);
      poiStyle[category.value] = () => p; 
      poiStyle[category.value + '_uncertain'] = () => pu; 
      poiStyleSelected[category.value] = () => ps;
      poiStyleSelected[category.value + '_uncertain'] = () => psu;
    });

    const guidepostStyle = new Style({
      image: new Icon({ 
        src: razcestnik,
        scale: 16.0 / 512,
    }), zIndex: 20});

    const guidepostSelectedStyle = new Style({
      image: new Icon({ 
        src: razcestnik,
        scale: 16.0 / 512,
    }), zIndex: 1000});

    const shadowSelectedStyle = new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: 'white' })
    }), zIndex: 1000});

    poiStyle[Constants.PoiCategoryGuidepost] = (feature, resolution) => 
      (resolution < 50 || feature.get('data').main) ? guidepostStyle : hiddenStyle;
    poiStyleSelected[Constants.PoiCategoryGuidepost] = (feature, resolution) => 
      (resolution < 50 || feature.get('data').main) ? [shadowSelectedStyle, guidepostSelectedStyle] : hiddenStyle;

    const blueMarkerStyle = getMarkerStyle('blue', 900, false);
    const whiteMarkerStyle = getMarkerStyle('white', 1000, false);
    const blueStyle = new Style({
      stroke: new Stroke({ color: [0, 0, 255, 0.5], width: 2 }), fill: new Fill({ color: [0, 0, 255, 0.2]}),
    });

    const markerSource = new VectorSource({ features: [] });
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: (feature, resolution) => 
        feature.get('kind') == 'circle' ? blueStyle : 
        feature.get('kind') == 'marker' ? (feature.get('selected') ? whiteMarkerStyle : blueMarkerStyle) :
        feature.get('kind') == 'stop' ? getMarkerStyle(feature.get('selected') ? 'white' : 
          (feature.get('data') ? (feature.get('data').color || 'red') : 'red'), feature.get('selected') ? 1000 : 30, true,
          feature.get('data') ? feature.get('data').symbol : null)
          : (feature.get('selected') ? poiStyleSelected : poiStyle)[(feature.get('category') || Constants.PoiCategoryOther) + (feature.get('data').uncertain ? "_uncertain" : "")](feature, resolution)});

    let popupOverlay = new ol.Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    let options = {
      view: new ol.View({ zoom, center: fromLonLat(center), minZoom: 8, maxZoom: 19, constrainRotation: true,
      extent: fromLonLat([16, 46]).concat(fromLonLat([24, 50])), constrainOnlyCenter: true }),
      layers: [FreeMapTiles, routeLayer, markerLayer],
      controls: defaultControls({ attribution: false }).extend([new ScaleLine(), new Attribution()]),
      overlays: [popupOverlay],
      keyboardEventTarget: canScroll ? document : mapRef.current,
      interactions: defaultInteraction({ mouseWheelZoom: !!canScroll, zoomDuration: 0 })
    };
    
    let mapObject = new ol.Map(options);
    mapObject.setTarget(mapRef.current);

    mapObject.on('movestart', event => {
      setMoving(true);
    });

    mapObject.on('moveend', event => {
      const newCenter = toLonLat(mapObject.getView().getCenter());
      const newZoom = mapObject.getView().getZoom();

      setCenter(newCenter);
      setZoom(newZoom);
      setViewProp(prev => { return { lat: newCenter[1], lon: newCenter[0], zoom: newZoom, poi: prev ? prev.poi : ''}; });

      setMoving(false);
    });

    mapObject.on('singleclick', (event) => {
      const data = [];
      var first = null;
      mapObject.forEachFeatureAtPixel(event.pixel,
        (feature, layer) => {
          var popup = feature.get('popup');
          if (popup) {
            first = feature;
            if (data.indexOf(popup) < 0) {
              data.push(popup);
            }
          }
        },
        { layerFilter: (layer) => {
          return layer != routeLayer;
        }, hitTolerance: Constants.NearByMarkersDistance }
      );

      closePopup();

      if (data.length > 0 && first) {
        const content = data.filter(i => i).join("\n<hr/>");
        setMoving(true);
        setPopupFeature(first);
        setPopupContent(content);
        showPopup(mapObject, first);
        setTimeout(() => setMoving(false), 500);
      }
    });

    var selected = null;

    mapObject.on('pointermove', (event) => {
      if (selected !== null) {
        selected.set('selected', false);
        selected = null;
      }
    
      const hit = mapObject.forEachFeatureAtPixel(event.pixel, feature => {
        if (feature.get('kind') == 'circle' || !feature.get('popup')) {
          return false;
        }

        selected = feature;
        feature.set('selected', true);
        return true;
      }, { layerFilter: (layer) => {
        return layer != routeLayer;
      }, hitTolerance: Constants.NearByMarkersDistance });
 
      mapObject.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    setMap(mapObject);
    setMapMarkerSource(markerSource);

    setTimeout(() => { mapObject.updateSize(); });

    const handlePrint = event => {
      setTimeout(() => { mapObject.updateSize(); });
    }

    window.addEventListener('beforeprint', handlePrint);

    if (window.matchMedia) {
      const mediaQueryList = window.matchMedia('print');
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener("change", handlePrint);
      }
    }

    return () => { 
      mapObject.setTarget(undefined);
      window.removeEventListener('beforeprint', handlePrint);

      if (window.matchMedia) {
        const mediaQueryList = window.matchMedia('print');
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener("change", handlePrint);
        }
      }
    };
  }, []);

  const parse = (value, def) => {
    try {
      const res = parseFloat(value);
      return !res || isNaN(res) ? def : res;
    } catch (error) {
      return def;
    }
  }

  useEffect(() => {
    if (!map) return;

    map.getView().setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    if (!map || moving) return;

    map.getView().setCenter(fromLonLat(center));
  }, [center, moving]);

  useEffect(() => {
    if (!mapMarkerSource) return;

    clear(mapMarkerSource, ["stop", "poi"]);

    if (travellers) {
      travellers.filter(t => t.lastMessage && (t.lastMessage.lon != null) && (t.lastMessage.lat != null)).forEach(t =>
        mapMarkerSource.addFeature(new ol.Feature({
          kind: 'stop',
          data: t,
          popupId: t.lastMessage._id,
          popup: `<p><b>${generateAnchor(`/na/${t.url_name || t.user_id}#${t.lastMessage._id}`, '0', escapeHtml(t.meno))}</b></p>
            <p>${dateTimeToStr(t.lastMessage.pub_date)}</p>
            <p>${htmlSimpleSanitize(t.lastMessage.text)}</p>`,
          geometry: new Point(fromLonLat([t.lastMessage.lon, t.lastMessage.lat]))
        }))
        );
      }

    if (stops) {
      stops.filter(t => !t.isComment && (t.lat != null) && (t.lon != null)).forEach(t =>
        mapMarkerSource.addFeature(new ol.Feature({
          kind: 'stop',
          data: t,
          popupId: t._id,
          popup: `<p>${dateTimeToStr(t.pub_date)}</p>
            <p>${htmlSimpleSanitize(t.text)}</p>`,
          geometry: new Point(fromLonLat([t.lon, t.lat]))
        }))
        );
      }

    if (pois) {
      const features = [];

      const food = findPoiCategory(Constants.PoiCategoryFood);
      const water = findPoiCategory(Constants.PoiCategoryWater);
      const uncertain = findPoiCategory(Constants.PoiCategoryUncertain);

      pois.filter(p => (!p.deleted || showDeleted)).forEach(p => {
        const categories = [p.category];
        const poiCategory = findPoiCategory(p.category);

        if (p.food) {
          categories.push(Constants.PoiCategoryFood);
        }

        if (p.water) {
          categories.push(Constants.PoiCategoryWater);
        }

        categories.forEach(category => {
          const f = new ol.Feature({
            kind: 'poi',
            category,
            popupId: p._id || p.id,
            data: p,
            popup:`<h4>${generateAnchor(p.url || `/pred/pois/${p._id}`, '',
              `<i class="${poiCategory.icon}"></i>${p.food ? `<i class="${food.icon}"></i>` : ''}${p.water ? `<i class="${water.icon}"></i>` : ''}${p.uncertain ? `<i class="${uncertain.icon}"></i>` : ''} ${escapeHtml(p.name) || poiCategory.label}`)}</h4>
              <p>GPS: ${p.coordinates[1]}, ${p.coordinates[0]}</p>
              <p>${htmlSimpleSanitize(p.text)}</p>`,
            geometry: new Point(fromLonLat(p.coordinates))
          });

          f.setStyle((!showLayers || !mapLayersHide || (mapLayersHide.indexOf(category) < 0 && (!p.uncertain || mapLayersHide.indexOf(Constants.PoiCategoryUncertain) < 0))) ? null : hiddenStyle);

          features.push(f);
        });
      });

      mapMarkerSource.addFeatures(features);
    }

  }, [travellers, pois, stops, showDeleted, mapMarkerSource]);

  useEffect(() => {
    if (!viewProp || moving) return;

    //console.log(viewProp, popupFeature ? popupFeature.get('popupId') : "");
    
    setCenter(viewProp.lat && viewProp.lon ? [parse(viewProp.lon, initialCenter[0]), parse(viewProp.lat, initialCenter[1])] : center)
    setZoom(parse(viewProp.zoom, viewProp.poi ? 13 : zoom) || zoom);

    if (mapMarkerSource &&
       viewProp.poi && (!popupFeature || popupFeature.get('popupId') != viewProp.poi)) {
      const feature = mapMarkerSource.getFeatures().find(f => f.get('popupId') == viewProp.poi);

      if (feature) {
        //console.log("open popup", viewProp.poi);
        setPopupContent(feature.get('popup'));
        setPopupFeature(feature);
        showPopup(map, feature);
      }
    }

    if (mapMarkerSource && !viewProp.poi && popupFeature) {
      closePopup();
    }
  }, [moving, map, mapMarkerSource, viewProp, popupFeature, pois]);

  useEffect(() => {
    if (!mapMarkerSource || !map) return;

    clear(mapMarkerSource, ["marker", "circle"]);

    if (markers) {
      markers.filter(m => m).forEach((m, i) =>
        mapMarkerSource.addFeatures([
          new ol.Feature({
            kind: 'marker',
            data: m,
            popup: m.name,
            popupId: "marker" + i,
            geometry: new Point(fromLonLat([m.lon, m.lat]))
          }),
          new ol.Feature({
            kind: 'circle',
            geometry: new Circle(fromLonLat([m.lon, m.lat]), 
              m.accuracy / map.getView().getProjection().getMetersPerUnit())
          }),
        ])
        );
      }

  }, [markers, map, mapMarkerSource]);

  const changeLayer = (layer) => {
    const hidden = (!!mapLayersHide && mapLayersHide.indexOf(layer) >= 0);

    if (hidden) {
      setMapLayersHide(mapLayersHide.filter(l => l != layer));
    } else {
      setMapLayersHide((mapLayersHide || []).concat([layer]));
    }
  }

  useEffect(() => {
    if (!mapLayersHide || !mapMarkerSource) {
      return;
    }

    mapMarkerSource.getFeatures().forEach(f => {
      f.setStyle((mapLayersHide.indexOf(f.get('category')) < 0 && (!f.get('data').uncertain || mapLayersHide.indexOf(Constants.PoiCategoryUncertain) < 0)) ? null : hiddenStyle);
    });
  }, [mapMarkerSource, mapLayersHide]);

  const closePopup = () => {
    setPopupContent('');
    setPopupFeature(null);
    setViewProp(prev => { return {...prev, poi: '' }; });
  }

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={mapRef} id={id} className="ol-map" tabIndex="1" data-nosnippet>
        {!!showLayers && <div className="ol-control map-layer-switch">
          {!showLayersPanel && <button onMouseEnter={() => setShowLayersPanel(true)}><i className="fas fa-layer-group"/></button>}
          {showLayersPanel && <div onMouseLeave={() => setShowLayersPanel(false)}>
            {PoiCategories.map((c, i) => <div key={i}>
              <input id={c.value} type="checkbox" checked={!mapLayersHide || mapLayersHide.indexOf(c.value) < 0}
                onChange={() => changeLayer(c.value)}/>
              <label htmlFor={c.value}><i className={c.icon} style={{ width: Constants.PoiIconSize + "px", height: Constants.PoiIconSize + "px"}} alt={c.label}></i> {c.label}</label>  
            </div>)}
          </div>}
        </div>}
        {children}
      </div>

      <div ref={popupRef} className="map-popup" style={{ display: !canFullScreen && popupContent ? 'block' : 'none'}}>
        <a className="close" onClick={() => closePopup()}>×</a>
        <div className="map-popup-content" dangerouslySetInnerHTML={{ __html: popupContent }}>
        </div>
      </div>

      {!!canFullScreen && <Modal className="map-popup-dialog" show={!!popupContent} 
        onHide={() => { if (moving) { return; } closePopup(); }}>
        <Modal.Header closeButton/>
        <Modal.Body>
          <div className="map-popup-dialog-content" dangerouslySetInnerHTML={{ __html: popupContent }}>
          </div>
        </Modal.Body>
        <Modal.Footer>{' '}</Modal.Footer>
      </Modal>}
    </MapContext.Provider>
  )
}
export default MapControl;