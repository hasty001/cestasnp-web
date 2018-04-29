import React, { Component } from 'react';
import Map from './Map';
import Loader from '../reusable_components/Loader';
import NotFound from '../reusable_components/NotFound';
import pin01 from '../../public/img/pins/Cervena.png';
import pin02 from '../../public/img/pins/Cierna.png';
import pin03 from '../../public/img/pins/Fialova.png';
import pin04 from '../../public/img/pins/Hneda.png';
import pin05 from '../../public/img/pins/Modra.png';
import pin06 from '../../public/img/pins/Oranzova.png';
import pin07 from '../../public/img/pins/Ruzova.png';
import pin08 from '../../public/img/pins/Svetlo_Ruzova.png';
import pin09 from '../../public/img/pins/Svetlo_zelena.png';
import pin10 from '../../public/img/pins/Tmavo_cervena.png';
import pin11 from '../../public/img/pins/Tmavo_modra.png';

const colors = [
  '#ff0000',
  '#000',
  '#7807ed',
  '#a45311',
  '#158ccb',
  '#ff9c00',
  '#d509ed',
  '#ea34af',
  '#30ff00',
  '#923333',
  '#153fca'
];

const pins = [pin01, pin02, pin03, pin04, pin05, pin06, pin07, pin08, pin09, pin10, pin11];

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
        let travellerIds = [];
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
          travellerData.pin = pins[colorCount];
          travellers.push(travellerData);
          travellerIds.push(traveller.user_id);
          colorCount += 1;
          if (colorCount >= colors.length - 1) {
            colorCount = 0;
          }
        });
        if (travellers.length === 0) {
          this.setState({
            travellers,
            error: true
          });
        } else {
          this.setState({
            travellers
          });
        }
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
              throw err;
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
      <div id="NaCesteActive">
        {this.state.loading && !this.state.error && <Loader />}

        {!this.state.loading &&
          !this.state.error &&
          this.state.travellers && (
            <div>
              <Map use="na-ceste-map-active" travellers={this.state.travellers} />
              <div className="active-travellers" style={{ textAlign: 'center' }}>
                {this.state.travellers.map((traveller, i) => {
                  return (
                    <div
                      key={i}
                      className="active-traveller"
                      style={{ border: `1px solid ${traveller.color}` }}
                    >
                      <p>
                        {traveller.meno}{' '}
                        <img src={traveller.pin} className="mapMarker" alt="Vzor ukazovatela" />
                      </p>
                      <a href={`/na/${traveller.userId}`}>Sleduj putovanie...</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {this.state.error && (
          <div>
            <Map use="na-ceste-map-active" travellers={this.state.travellers} />
            <div className="active-travellers" style={{ textAlign: 'center' }}>
              <p style={{ marginTop: '10px' }}>Momentálne nie je nikto na ceste.</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Active;
