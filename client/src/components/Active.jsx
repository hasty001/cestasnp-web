import React, { Component } from 'react';
import Map from './Map';
import Loader from './Loader';

class Active extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      travellers: []
    };
  }

  componentDidMount() {
    fetch('/api/traveller/activeTravellers')
      .then(resp => resp.json())
      .then(data => {
        let travellers = [];
        data.forEach(traveller => {
          let travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = traveller.start_date;
          travellerData.endDate = traveller.end_date;
          travellers.push(travellerData);
        });
        this.setState({
          travellers,
          loading: false
        });
      })
      .catch(e => {
        this.setState({
          error: true
        });
        throw e;
      });
  }

  render() {
    return (
      <div className="na-ceste-container">
        {this.state.loading && !this.state.error && <Loader />}
        {!this.state.loading &&
          !this.state.error &&
          this.state.travellers && (
            <div>
              <div>
                <Map use="na-ceste-map-active" />
              </div>

              <div className="na-ceste-active" style={{ textAlign: 'center' }}>
                {this.state.travellers.map((traveller, i) => {
                  return (
                    <div key={i} className="na-ceste-active-single">
                      <p>{traveller.meno}</p>
                      <a href={`/na/${traveller.userId}`}>Sleduj putovanie...</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {this.state.error && <p>Ľutujeme ale momentálne nie je nikto na ceste.</p>}
      </div>
    );
  }
}

export default Active;
