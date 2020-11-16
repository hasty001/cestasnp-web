import React, { Component, Fragment } from 'react';

import { NavItem } from 'react-bootstrap';
import format from 'date-fns/format';
import history from '../helpers/history';

import Map from './Map';
import Loader from './reusable/Loader';
import pin01 from '../../public/img/pins/Cervena.png';
import pin02 from '../../public/img/pins/Cierna.png';
import pin03 from '../../public/img/pins/Tmavo_modra.png';
import pin04 from '../../public/img/pins/Fialova.png';
import pin05 from '../../public/img/pins/Hneda.png';
import pin06 from '../../public/img/pins/Oranzova.png';
import pin07 from '../../public/img/pins/Ruzova.png';
import pin08 from '../../public/img/pins/Svetlo_Ruzova.png';
import pin09 from '../../public/img/pins/Svetlo_zelena.png';
import pin10 from '../../public/img/pins/Tmavo_cervena.png';
import pin11 from '../../public/img/pins/Modra.png';
import { sortByDateAsc, dateToStr } from '../helpers/helpers';
import * as Constants from './Constants';

const colors = [
  '#ff0000',
  '#000',
  '#153fca',
  '#7807ed',
  '#a45311',
  '#ff9c00',
  '#d509ed',
  '#ea34af',
  '#30ff00',
  '#923333',
  '#158ccb',
  '#ffe401'
];

const grey = '#b19494';

const pins = [
  pin01,
  pin02,
  pin03,
  pin04,
  pin05,
  pin06,
  pin07,
  pin08,
  pin09,
  pin10,
  pin11
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
        const travellers = [];
        const travellerIds = [];
        const now = format(new Date(), 'YYYY-MM-DD');
        data.forEach(traveller => {
          const travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = format(traveller.start_date, 'YYYY-MM-DD');
          travellerData.endDate = traveller.end_date;
          travellers.push(travellerData);
          travellerIds.push(traveller.user_id);
        });
        sortByDateAsc(travellers, 'startDate');
        if (travellers.length === 0) {
          this.setState({
            travellers,
            error: true
          });
        } else {
          let colorCount = 0;
          travellers.forEach(trvlr => {
            // eslint-disable-next-line no-param-reassign
            trvlr.pin = pins[colorCount];
            // eslint-disable-next-line no-param-reassign
            trvlr.color = trvlr.startDate <= now ? colors[colorCount] : grey;
            colorCount += 1;
            if (colorCount >= colors.length - 1) {
              colorCount = 0;
            }
          });
          this.setState({
            travellers
          });
        }
        return travellerIds;
      })
      .then(travellerIds => {
        const data = {
          travellerIds
        };
        if (travellerIds.length > 0) {
          fetch('/api/traveller/lastMessages', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          })
            .then(resp => {
              return resp.json();
            })
            .then(messages => {
              const ids = [];
              const lastMessages = [];

              messages.forEach(msg => {
                if (ids.length === 0) {
                  ids.push(msg.user_id);
                  lastMessages.push(msg);
                } else {
                  let idCounter = 0;
                  ids.forEach(id => {
                    if (id === msg.user_id) {
                      idCounter += 1;
                    }
                  });
                  if (idCounter === 0) {
                    ids.push(msg.user_id);
                    lastMessages.push(msg);
                  }
                }
              });

              const travellers = this.state.travellers.map(trvlr => {
                lastMessages.forEach(msg => {
                  if (msg.user_id === trvlr.userId) {
                    // eslint-disable-next-line no-param-reassign
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

        {!this.state.loading && !this.state.error && this.state.travellers && (
          <Fragment>
            <Map use="na-ceste-map-active" travellers={this.state.travellers} />
            <div className="active-travellers" style={{ textAlign: 'center' }}>
              {this.state.travellers.map((traveller, i) => {
                return (
                  <NavItem
                    key={i}
                    onClick={() => {
                      history.push(`/na/${traveller.userId}`);
                    }}
                  >
                    {traveller.color !== grey ? (
                      <div
                        className="active-traveller"
                        style={{
                          border: `1px solid ${traveller.color}`,
                          textAlign: 'center'
                        }}
                      >
                        <p
                          style={{
                            color: traveller.color,
                            margin: '12px 0 0 0'
                          }}
                        >
                          {traveller.meno}{' '}
                          <i className="fas fa-map-marker-alt" 
                            style={{ width: `${Constants.PoiMarkerSize}px`, height: `${Constants.PoiMarkerSize}px` }} alt="Vzor ukazovatela"></i>
                        </p>
                      </div>
                    ) : (
                      <div
                        className="active-traveller"
                        style={{ border: `1px solid ${grey}`, color: grey }}
                      >
                        <p style={{ margin: '8px 0 0 0' }}>{traveller.meno}</p>
                        <p style={{ margin: '0px', fontSize: '12px' }}>
                          vyráža {dateToStr(traveller.startDate, "kdoviekdy")}
                        </p>
                      </div>
                    )}
                  </NavItem>
                );
              })}
            </div>
          </Fragment>
        )}

        {this.state.error && (
          <Fragment>
            <Map use="na-ceste-map-active" travellers={this.state.travellers} />
            <div className="active-travellers" style={{ textAlign: 'center' }}>
              <p style={{ marginTop: '10px' }}>
                Momentálne nie je nikto na ceste.
              </p>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

export default Active;
