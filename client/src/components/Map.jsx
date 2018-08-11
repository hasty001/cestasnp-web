import React, { Component } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import devinDukla from '../geojson/devin_dukla.json';
import chata from '../../public/img/chata.png';
import potraviny from '../../public/img/potraviny.png';
import pristresok from '../../public/img/pristresok.png';
import utulna from '../../public/img/utulna.png';
import pramen from '../../public/img/pramen.png';
import krcma_jedlo from '../../public/img/krcma_jedlo.png';
import posed from '../../public/img/posed.png';
import defaultPin from '../../public/img/pins/Cervena.png';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {
  params: {
    center: [48.73, 19.46],
    zoomControl: false,
    zoom: 8,
    maxZoom: 14,
    minZoom: 7,
    scrollwheel: false,
    infoControl: false,
    attributionControl: false,
  },
  tileLayer: {
    uri: 'https://tiles.freemap.sk/T/{z}/{x}/{y}.png',
    params: {
      minZoom: 7,
      id: '',
      accessToken: '',
    },
  },
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojson: null,
      subwayLinesFilter: '*',
      numEntrances: null,
      use: this.props.use,
    };
  }

  componentDidMount() {
    // AJAX call for geodata here
    if (!this.state.map) this.init(this.state.use);
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params);
    L.control
      .attribution({
        prefix:
          'Mapa © <a href="https://www.freemap.sk">Freemap</a> Slovakia, dáta © prispievatelia <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a>',
        position: 'bottomright',
      })
      .addTo(map);
    L.control
      .scale({
        position: 'bottomright',
        imperial: false,
      })
      .addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.geoJSON(devinDukla, {
      style: {
        color: '#fe0000',
        weight: 3,
        opacity: 0.8,
      },
    }).addTo(map);

    /// DOLEZITE MIESTA
    if (this.props.pois && this.props.pois.length > 0) {
      this.props.pois.map(poi => {
        let iconUrl = '';
        switch (poi.category) {
          case 'chata':
            iconUrl = chata;
            break;
          case 'pramen':
            iconUrl = pramen;
            break;
          case 'potraviny':
            iconUrl = potraviny;
            break;
          case 'pristresok':
            iconUrl = pristresok;
            break;
          case 'utulna':
            iconUrl = utulna;
            break;
          case 'posed':
            iconUrl = posed;
            break;
          case 'krcma_jedlo':
            iconUrl = krcma_jedlo;
            break;
          default:
            iconUrl = posed;
            break;
        }
        let icon = L.icon({
          iconUrl: iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        let marker = L.marker([poi.coordinates[1], poi.coordinates[0]], { icon: icon }).addTo(map);
        marker.bindPopup(`<h4>${poi.name}</h4>
          <p>GPS: ${poi.coordinates[1]}, ${poi.coordinates[0]}</p>
          <p>${poi.text}</p>`);
      });
    }

    // TRAVELLER MSGs
    if (this.props.stops && this.props.stops.length > 0) {
      this.props.stops.map(stop => {
        if (stop.type === 'message') {
          let icon = L.divIcon({
            html: `<img src=${defaultPin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          let marker = L.marker([stop.lat, stop.lon], { icon: icon }).addTo(map);
          marker.bindPopup(`<p>${stop.date}</p>
          <p>${stop.text}</p>`);
        }
      });
    }

    //ACTIVE TRAVELLERS
    if (this.props.use === 'na-ceste-map-active' && this.props.travellers.length > 0) {
      this.props.travellers.forEach(trvlr => {
        if (trvlr.lastMessage && trvlr.color !== '#b19494') {
          let icon = L.divIcon({
            html: `<img src=${trvlr.pin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          let marker = L.marker([trvlr.lastMessage.lat, trvlr.lastMessage.lon], {
            icon: icon,
          }).addTo(map);
          marker.bindPopup(`
          <p><b><a href='/na/${trvlr.userId}' style={text-decoration: none;}>${
            trvlr.meno
          }</a></b></p>
          <p>${trvlr.lastMessage.pub_date}</p>
          <p>${trvlr.lastMessage.text}</p>`);
        }
      });
    }

    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);
    this.setState({ map, tileLayer });
  }

  render() {
    return <div id={this.state.use} />;
  }
}

export default Map;
