import React, { Component } from 'react';
import Map from './Map';
import Loader from '../reusable_components/Loader';

const colors = [
  '#f6d046',
  '#f646b0',
  '#f6465e',
  '#7146f6',
  '#466cf6',
  '#46def6',
  '#46f69d',
  '#61f646',
  '#f67746',
  '#e3f646'
];

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
        let colorCount = 0;
        data.forEach(traveller => {
          let travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = traveller.start_date;
          travellerData.endDate = traveller.end_date;
          travellerData.color = colors[colorCount];
          travellers.push(travellerData);
          colorCount += 1;
          if (colorCount >= colors.length - 1) {
            colorCount = 0;
          }
        });
        this.setState({
          travellers
        });
        let travellerIds = [];
        travellers.forEach(traveller => {
          travellerIds.push(traveller.userId);
        });
        return travellerIds;
      })
      .then(travellerIds => {
        let data = {
          travellerIds: travellerIds
        };
        if (travellerIds.length > 0) {
          fetch('/api/traveller/lastMessages/', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          })
            .then(resp => resp.json())
            .then(messages => {
              let ids = [];
              let lastMessages = [];

              messages.forEach(msg => {
                if (!ids.includes(msg.user_id)) {
                  ids.push(msg.user_id);
                  lastMessages.push(msg);
                }
              });

              let travellers = this.state.travellers.map(trvlr => {
                lastMessages.forEach(msg => {
                  if (msg.user_id == trvlr.userId) {
                    trvlr.lastMessage = msg;
                  }
                });
                return trvlr;
              });

              this.setState({
                travellers,
                loading: false
              });
            })
            .catch(err => {
              console.log(err);
            });
        }
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
                <Map use="na-ceste-map-active" travellers={this.state.travellers} />
              </div>

              <div className="na-ceste-active" style={{ textAlign: 'center' }}>
                {this.state.travellers.map((traveller, i) => {
                  return (
                    <div
                      key={i}
                      className="na-ceste-active-single"
                      style={{ backgroundColor: traveller.color }}
                    >
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
