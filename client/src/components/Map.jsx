import React, { Component } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import devinDukla from '../geojson/devin_dukla.json'
import pin from '../../public/img/pin.png'

// store the map configuration properties in an object,
// we could also move this to a separate file & import it if desired.
let config = {}
config.params = {
  center: [48.73, 19.46],
  zoomControl: false,
  zoom: 8,
  maxZoom: 12,
  minZoom: 7,
  scrollwheel: false,
  infoControl: false,
  attributionControl: true
}
config.tileLayer = {
  uri: 'http://tiles.freemap.sk/T/{z}/{x}/{y}.png',
  params: {
    minZoom: 7,
    attribution: 'mapa © <a href="https://www.freemap.sk">Freemap</a> Slovakia, dáta © prispievatelia <a href="https://osm.org/copyright" target="_blank">OpenStreetMap</a>',
    id: '',
    accessToken: ''
  }
}

class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {
      map: null,
      tileLayer: null,
      geojsonLayer: null,
      geojson: null,
      subwayLinesFilter: '*',
      numEntrances: null
    }
  }

  componentDidMount () {
    // AJAX call for geodata here
    if (!this.state.map) this.init('map')
  }

  init (id) {
    if (this.state.map) return
    // this function creates the Leaflet map object and is called after the Map component mounts
    let map = L.map(id, config.params)
    L.control.scale({
      position: 'bottomright',
      imperial: false
    }).addTo(map)
    L.control.zoom({position: 'bottomright'}).addTo(map)
    L.geoJSON(devinDukla, {
      style: {
        color: '#fe0000',
        weight: 3,
        opacity: 0.8

      }
    }).addTo(map)

    /// DOLEZITE MIESTA
    if (this.props.pois && this.props.pois.length > 0) {
      this.props.pois.map((poi) => {
        let icon = L.icon({
          iconUrl: pin,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
        let marker = L.marker([poi.coordinates[1], poi.coordinates[0]], { icon: icon }).addTo(map)
        marker.bindPopup(`<h4>${poi.name}</h4>
          <p>GPS: ${poi.coordinates[1]}, ${poi.coordinates[0]}</p>
          <p>${poi.text}</p>`)
      })
    }
    const tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(map)
    this.setState({ map, tileLayer })
  }

  render () {
    return (
      <div id='map' />
    )
  }
}

export default Map

// componentDidUpdate(prevProps, prevState) {
  //   // code to run when the component receives new props or state
  //   // check to see if geojson is stored, map is created, and geojson overlay needs to be added
  //   // if (this.state.geojson && this.state.map && !this.state.geojsonLayer) {
  //   //   // add the geojson overlay
  //   //   this.addGeoJSONLayer(this.state.geojson);
  //   // }

  //   // // check to see if the subway lines filter has changed
  //   // if (this.state.subwayLinesFilter !== prevState.subwayLinesFilter) {
  //   //   // filter / re-render the geojson overlay
  //   //   this.filterGeoJSONLayer();
  //   // }
  // }

  // componentWillUnmount() {
  //   // code to run just before unmounting the component
  //   // this destroys the Leaflet map object & related event listeners
  //   this.state.map.remove();
  // }

  // getData() {
  //   // could also be an AJAX request that results in setting state with the geojson data
  //   // for simplicity sake we are just importing the geojson data using webpack's json loader
  //   this.setState({
  //     numEntrances: geojson.features.length,
  //     geojson
  //   });
  // }

  // updateMap(e) {
  //   let subwayLine = e.target.value;
  //   // change the subway line filter
  //   if (subwayLine === "All lines") {
  //     subwayLine = "*";
  //   }
  //   // update our state with the new filter value
  //   this.setState({
  //     subwayLinesFilter: subwayLine
  //   });
  // }

  // addGeoJSONLayer(geojson) {
  //   // create a native Leaflet GeoJSON SVG Layer to add as an interactive overlay to the map
  //   // an options object is passed to define functions for customizing the layer
  //   const geojsonLayer = L.geoJson(geojson, {
  //     onEachFeature: this.onEachFeature,
  //     pointToLayer: this.pointToLayer,
  //     filter: this.filterFeatures
  //   });
  //   // add our GeoJSON layer to the Leaflet map object
  //   geojsonLayer.addTo(this.state.map);
  //   // store the Leaflet GeoJSON layer in our component state for use later
  //   this.setState({ geojsonLayer });
  //   // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
  //   this.zoomToFeature(geojsonLayer);
  // }

  // filterGeoJSONLayer() {
  //   // clear the geojson layer of its data
  //   this.state.geojsonLayer.clearLayers();
  //   // re-add the geojson so that it filters out subway lines which do not match state.filter
  //   this.state.geojsonLayer.addData(geojson);
  //   // fit the map to the new geojson layer's geographic extent
  //   this.zoomToFeature(this.state.geojsonLayer);
  // }

  // zoomToFeature(target) {
  //   // pad fitBounds() so features aren't hidden under the Filter UI element
  //   var fitBoundsParams = {
  //     paddingTopLeft: [200,10],
  //     paddingBottomRight: [10,10]
  //   };
  //   // set the map's center & zoom so that it fits the geographic extent of the layer
  //   this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  // }

  // filterFeatures(feature, layer) {
  //   // filter the subway entrances based on the map's current search filter
  //   // returns true only if the filter value matches the value of feature.properties.LINE
  //   const test = feature.properties.LINE.split('-').indexOf(this.state.subwayLinesFilter);
  //   if (this.state.subwayLinesFilter === '*' || test !== -1) {
  //     return true;
  //   }
  // }

  // pointToLayer(feature, latlng) {
  //   // renders our GeoJSON points as circle markers, rather than Leaflet's default image markers
  //   // parameters to style the GeoJSON markers
  //   var markerParams = {
  //     radius: 4,
  //     fillColor: 'orange',
  //     color: '#fff',
  //     weight: 1,
  //     opacity: 0.5,
  //     fillOpacity: 0.8
  //   };

  //   return L.circleMarker(latlng, markerParams);
  // }

  // onEachFeature(feature, layer) {
  //   if (feature.properties && feature.properties.NAME && feature.properties.LINE) {

  //     // if the array for unique subway line names has not been made, create it
  //     // there are 19 unique names total
  //     if (subwayLineNames.length < 19) {

  //       // add subway line name if it doesn't yet exist in the array
  //       feature.properties.LINE.split('-').forEach(function(line, index){
  //         if (subwayLineNames.indexOf(line) === -1) subwayLineNames.push(line);
  //       });

  //       // on the last GeoJSON feature
  //       if (this.state.geojson.features.indexOf(feature) === this.state.numEntrances - 1) {
  //         // use sort() to put our values in alphanumeric order
  //         subwayLineNames.sort();
  //         // finally add a value to represent all of the subway lines
  //         subwayLineNames.unshift('All lines');
  //       }
  //     }

  //     // assemble the HTML for the markers' popups (Leaflet's bindPopup method doesn't accept React JSX)
  //     const popupContent = `<h3>${feature.properties.NAME}</h3>
  //       <strong>Access to MTA lines: </strong>${feature.properties.LINE}`;

  //     // add our popups
  //     layer.bindPopup(popupContent);
  //   }
  //  }
