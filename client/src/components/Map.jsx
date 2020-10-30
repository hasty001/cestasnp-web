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
import { dateTimeToStr } from '../helpers/helpers';

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
const config = {
  params: {
    center: [48.73, 19.46],
    zoomControl: false,
    zoom: 8,
    maxZoom: 14,
    minZoom: 8,
    scrollwheel: false,
    infoControl: false,
    attributionControl: false
  },
  tileLayer: {
    uri: 'https://tile.freemap.sk/T/{z}/{x}/{y}.jpeg',
    params: {
      minZoom: 8,
      id: '',
      accessToken: ''
    }
  }
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      use: this.props.use,
      lat: this.props.lat,
      lon: this.props.lon,
      zoom: this.props.zoom,
      poi: this.props.poi,
      marker: this.props.marker,
    };
  }

  componentDidMount() {
    // AJAX call for geodata here
    if (!this.state.map) this.init(this.state.use);
  }

  init(id) {
    if (this.state.map) return;
    // this function creates the Leaflet map object and is called after the Map component mounts

    const params = Object.assign({}, config.params);
    if (this.state.lat) { params.center[0] = this.state.lat; }
    if (this.state.lon) { params.center[1] = this.state.lon; }
    if (this.state.zoom) { 
      params.zoom = this.state.zoom; 
    } else if (this.state.marker || this.state.poi) {
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

    // MARKER 
    if (this.state.marker && this.state.lat && this.state.lon) {
      const iconUrl = posed;
      const icon = L.icon({
        iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      const marker = L.marker([this.state.lat, this.state.lon], {
        icon
      }).addTo(map);
      marker.bindPopup(this.state.marker);
    }

    // GUIDEPOSTS 
    if (this.props.guideposts) {
      this.props.guideposts.forEach(g => {
        const iconUrl = posed;
        const icon = L.icon({
          iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        const marker = L.marker([g.lat, g.lon], {
          icon
        }).addTo(map);
        marker.bindPopup(`<h4><a href="/pred/itinerary#g${g.id}">${g.name} ${g.ele ? ` ${g.ele} m`: ""}</a></h4>`);
      });
    }

    // DOLEZITE MIESTA
    if (this.props.pois && this.props.pois.length > 0) {
      this.props.pois.forEach(poi => {
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
        const icon = L.icon({
          iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        const marker = L.marker([poi.coordinates[1], poi.coordinates[0]], {
          icon
        }).addTo(map);
        marker.bindPopup(`<h4><a href="/pred/pois/${poi._id}">${poi.name}</a></h4>
          <p>GPS: ${poi.coordinates[1]}, ${poi.coordinates[0]}</p>
          <p>${poi.text}</p>
          <a href="/pred/pois/${poi._id}">viac</a>`);

        if (this.state.poi === poi._id) {
          marker.openPopup();
        }
      });
    }

    // TRAVELLER MSGs
    if (this.props.stops && this.props.stops.length > 0) {
      this.props.stops.forEach(stop => {
        if (stop.type === 'message') {
          const icon = L.divIcon({
            html: `<img src=${defaultPin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });
          const marker = L.marker([stop.lat, stop.lon], { icon }).addTo(map);
          marker.bindPopup(`<p>${dateTimeToStr(stop.date)}</p>
          <p>${stop.text}</p>`);
        }
      });
    }

    // ACTIVE TRAVELLERS
    if (
      this.props.use === 'na-ceste-map-active' &&
      this.props.travellers.length > 0
    ) {
      this.props.travellers.forEach(trvlr => {
        if (trvlr.lastMessage && trvlr.color !== '#b19494') {
          const icon = L.divIcon({
            html: `<img src=${trvlr.pin} alt="Ukazovatel na mape" class="mapMarker"/>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });
          const marker = L.marker(
            [trvlr.lastMessage.lat, trvlr.lastMessage.lon],
            {
              icon
            }
          ).addTo(map);
          marker.bindPopup(`
          <p><b><a href='/na/${trvlr.userId}' style={text-decoration: none;}>${trvlr.meno}</a></b></p>
          <p>${dateTimeToStr(trvlr.lastMessage.pub_date)}</p>
          <p>${trvlr.lastMessage.text}</p>`);
        }
      });
    }

    L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map);
    this.setState({ map });
  }

  render() {
    return <div id={this.state.use} />;
  }
}

export default Map;
