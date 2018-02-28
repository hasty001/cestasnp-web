import React, { Component } from 'react';
import Map from './Map';
import Loader from './Loader';

class Archive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      archivedTravellers: []
    };
  }

  componentDidMount() {
    fetch('/api/traveller/finishedTravellers')
      .then(resp => resp.json())
      .then(data => {
        let archivedTravellers = [];
        data.forEach(traveller => {
          let travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = traveller.start_date;
          travellerData.endDate = traveller.end_date;
          archivedTravellers.push(travellerData);
        });
        this.setState({
          archivedTravellers,
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
      <div className="archive-container">
        {this.state.loading && !this.state.error && <Loader />}
        {!this.state.loading &&
          !this.state.error &&
          this.state.archivedTravellers && (
            <div>
              {this.state.archivedTravellers.map((traveller, i) => {
                return (
                  <div key={i} style={{ backgroundColor: 'lightGreen' }}>
                    <p>{traveller.meno}</p>
                    <p>
                      Začiatok: {traveller.startDate} na {traveller.startMiesto}
                    </p>
                    <p>Koniec: {traveller.endDate}</p>
                    <p dangerouslySetInnerHTML={{ __html: traveller.text }} />
                    <a href={`/na/${traveller.userId}`}>Sleduj celé putovanie...</a>
                    <hr />
                  </div>
                );
              })}
            </div>
          )}

        {this.state.error && <p>Ľutujeme ale archív je prázdny.</p>}
      </div>
    );
  }
}

export default Archive;
