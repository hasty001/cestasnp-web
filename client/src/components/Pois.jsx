import React, { Component } from 'react';
import Map from './Map';
import Loader from './reusable/Loader';

class Pois extends Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.hash);

    this.state = {
      loading: true,
      pois: [],
      lat: params.get('lat'),
      lon: params.get('lon'),
      zoom: params.get('zoom'),
      poi: params.get('poi'),
      guidepost: params.get('guidepost'),
    };
  }

  componentDidMount() {
    fetch('/api/pois')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          pois: data,
          loading: false
        });
      });
  }

  render() {
    return (
      <div id="Pois">
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <Map pois={this.state.pois} use="pois-map" 
            lat={this.state.lat} lon={this.state.lon}
            poi={this.state.poi} marker={this.state.guidepost} zoom={this.state.zoom} />
        )}
      </div>
    );
  }
}

export default Pois;
