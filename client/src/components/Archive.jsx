import React, { Component } from 'react';
import Loader from '../reusable_components/Loader';

class Archive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      fullyCompleted: [],
      partiallyCompleted: []
    };
  }

  componentDidMount() {
    fetch('/api/traveller/finishedTravellers')
      .then(resp => resp.json())
      .then(data => {
        let fully = [];
        let partially = [];
        data.forEach(traveller => {
          let travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = traveller.start_date;
          travellerData.endDate = traveller.end_date;
          travellerData.completed = traveller.completed;
          if (travellerData.completed) {
            fully.push(travellerData);
          } else {
            partially.push(travellerData);
          }
        });
        this.setState({
          fullyCompleted: fully,
          partiallyCompleted: partially,
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
          this.state.fullyCompleted && (
            <div>
              <h2>Cestu prešli celú:</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap'
                }}
              >
                {this.state.fullyCompleted.map((traveller, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'inline-block',
                        position: 'relative',
                        backgroundColor: 'lightGreen',
                        width: '23%',
                        height: '360px',
                        padding: '10px',
                        marginRight: '2%',
                        marginBottom: '10px'
                      }}
                    >
                      <p style={{ fontWeight: '800' }}>{traveller.meno}</p>
                      <p style={{ fontWeight: '600' }}>{traveller.startMiesto}</p>
                      <p>Začiatok: {traveller.startDate.substring(0, 11)}</p>
                      <p>Koniec: {traveller.endDate.substring(0, 11)}</p>
                      <div
                        style={{
                          overflow: 'scroll',
                          height: '200px'
                        }}
                      >
                        <p dangerouslySetInnerHTML={{ __html: traveller.text }} />
                      </div>
                      <a href={`/na/${traveller.userId}`}>Sleduj celé putovanie...</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        {!this.state.loading &&
          !this.state.error &&
          this.state.partiallyCompleted && (
            <div>
              <h2>Cestu prešli čiastočne:</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap'
                }}
              >
                {this.state.partiallyCompleted.map((traveller, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'inline-block',
                        position: 'relative',
                        backgroundColor: 'lightBlue',
                        width: '23%',
                        height: '360px',
                        padding: '10px',
                        marginRight: '2%',
                        marginBottom: '10px'
                      }}
                    >
                      <p style={{ fontWeight: '800' }}>{traveller.meno}</p>
                      <p style={{ fontWeight: '600' }}>{traveller.startMiesto}</p>
                      <p>Začiatok: {traveller.startDate.substring(0, 11)}</p>
                      <p>Koniec: {traveller.endDate.substring(0, 11)}</p>
                      <div
                        style={{
                          overflow: 'scroll',
                          height: '200px'
                        }}
                      >
                        <p dangerouslySetInnerHTML={{ __html: traveller.text }} />
                      </div>
                      <a href={`/na/${traveller.userId}`}>Sleduj celé putovanie...</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {this.state.error && <p>Ľutujeme ale archív je prázdny.</p>}
      </div>
    );
  }
}

export default Archive;
