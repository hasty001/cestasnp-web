import React, { Component } from 'react';
import Map from './Map';
import Loader from '../reusable_components/Loader';

class Pois extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      pois: []
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
          <div>
            <Map pois={this.state.pois} use="pois-map" />
          </div>
        )}
      </div>
    );
  }
}

export default Pois;
