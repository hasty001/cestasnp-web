import React, { Component } from 'react';
import moment from 'moment-timezone';

import FloatingLoader from '../reusable/FloatingLoader';
import CloudinaryWidget from '../reusable/CloudinaryWidget';
import * as Constants from '../Constants';
import { parseGPSPos } from '../../helpers/GPSPosParser';

moment.tz.setDefault('Europe/Vienna');

class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errorMsg: '',
      message: '',
      latlon: '',
      accuracy: '',
      img: '',
      edit: {
        latlon: 0
      },
      positionLoading: 0
    };

    this.handleChange = this.handleChange.bind(this);
    this.verifyGPSFormat = this.verifyGPSFormat.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getMyPosition = this.getMyPosition.bind(this);
    this.triggerEdit = this.triggerEdit.bind(this);
    this.updateImageDetails = this.updateImageDetails.bind(this);
  }

  getMyPosition() {
    this.setState({
      positionLoading: 1
    });

    const options = {
      timeout: 8000,
      enableHighAccuracy: true
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        var lat = coords.latitude.toFixed(6);
        var lon = coords.longitude.toFixed(6);

        if (coords.accuracy > Constants.MaxAllowedGPSAccuracy) {
          console.error('low GPS accuracy ', coords.accuracy);

          this.setState({
            errorMsg: (
              <span>
                Nedostatočná presnosť súradnic. Prosím načítaj pozíciu ešte raz.
                Skontroluj si nastavenie presnosti lokalizačných služieb v nastavení telefónu. 
                Taktiež je možné že nemáš priamy výhľad na oblohu pre správne fungovanie GPS. 
                <br/>Prípadne súradnice zadaj ručne.               
              </span>
            ),
            positionLoading: 0
          });
        } else {
          this.setState({
            latlon: lat + ", " + lon,
            accuracy: coords.accuracy,
            positionLoading: 0
          });
        }
      },
      err => {
        console.error('err ', err.message);
        this.setState({
          errorMsg: (
            <span>
              Vyzerá to, že nemáš povelené získavanie GPS pozície. Povoľ podľa
              návodu{' '}
              <a
                href="https://cestasnp.sk/pred/articles/article/10004"
                target="_blank"
              >
                tu
              </a>{' '}
              alebo zadaj ručne.
            </span>
          ),
          positionLoading: 0
        });
      },
      options
    );
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      errorMsg: '',
      successMsg: ''
    });
  }

  verifyGPSFormat({ target }) {
    const { value } = target;

    if (value === '') {
      return;
    }

    if (!parseGPSPos(value)) {
      this.setState({
        errorMsg: 'GPS súradnica má nesprávny formát.'
      });
      return;
    }
  }

  sendMessage() {
    if (!this.state.message || this.state.message.trim().length === 0) {
      this.setState({
        errorMsg: 'Správa nemôže ostať prázdna.'
      });
      return;
    }

    var latlon = parseGPSPos(this.state.latlon);

    if (
      !this.state.latlon ||
      this.state.latlon.trim().length === 0 ||      
      !latlon
    ) {
      this.setState({
        errorMsg: 'GPS súradnice majú nesprávny formát.'
      });
      return;
    }

    this.setState({
      loading: true
    });

    const data = {};
    data.lon = latlon[1].toFixed(6);
    data.lat = latlon[0].toFixed(6);
    data.accuracy = this.state.accuracy;
    data.text = this.state.message;
    data.pub_date = moment().format('YYYY-MM-DD HH:mm:ss');
    data.user_id = this.props.userId;
    data.img = this.state.img;
    data.pub_date_milseconds = moment().valueOf();
    data.details_id = this.props.travellerId;

    this.props.traveller.user.getIdToken()
      .then(token => 
      fetch('/api/traveller/sendMessage', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        })
      })
      .then(res => res.json())
      .then(msgRes => {
        if (msgRes.error) {
          console.error('send message err ', msgRes.error);

          this.setState({
            loading: false,
            errorMsg: 'Ups, niekde sa stala chyba. Skús neskôr prosím'
          });
        } else {
          this.setState({
            loading: false,
            successMsg: 'Správa úspešne poslaná!',
            message: '',
            latlon: '',
            img: '',
            edit: {
              latlon: 0
            }
          });
          this.props.updateTravellerMsgs(msgRes);
        }
      }))
      .catch(e => {
        console.error('send message err ', e);

        this.setState({
          loading: false,
          errorMsg: 'Ups, niekde sa stala chyba. Skús neskôr prosím'
        });
      });
  }

  triggerEdit(target) {
    const { edit } = this.state;
    edit[target] = this.state.edit[target] === 1 ? 0 : 1;
    this.setState({
      edit
    });
  }

  updateImageDetails(details) {
    this.setState({
      img: details
    });
  }

  render() {
    return (
      <div id="MessageForm" className="thinRedWrap for-floating-loader">    
        {this.state.loading && <FloatingLoader />}    
        <div className={this.state.loading ? "invisible" : null}>
            <h2>Poslať správu</h2>
            {this.state.errorMsg && (
              <p className="errorMsg">{this.state.errorMsg}</p>
            )}
            {this.state.successMsg && (
              <p className="successMsg">{this.state.successMsg}</p>
            )}
            <div className="for-floating-loader">
              {this.state.positionLoading == 1 && <FloatingLoader />}
              <div className={this.state.positionLoading ? "invisible" : null}>
                <label htmlFor="latlon">
                  <span
                    onClick={() => {
                      this.triggerEdit('latlon');
                    }}
                  >
                    Zem. šírka, dĺžka (latitude, longitude): <i className="fas fa-edit" />
                  </span>
                  {this.state.edit.latlon ? (
                    <input
                      id="latlon"
                      name="latlon"
                      value={this.state.latlon}
                      onBlur={e => {
                        e.preventDefault();
                        this.verifyGPSFormat(e);
                      }}
                      onChange={this.handleChange}
                    />
                  ) : (
                    <p className="travellerP">{this.state.latlon}</p>
                  )}
                </label>                
                <button
                  className="snpBtnWhite"
                  onClick={this.getMyPosition}
                  type="button"
                >
                  Získaj pozíciu
                </button>
              </div>
            </div>
            <label htmlFor="name">
              <span>Text</span>
              <textarea
                type="text"
                id="message"
                name="message"
                onBlur={e => {
                  e.preventDefault();
                  this.handleChange(e);
                }}
                onChange={this.handleChange}
                value={this.state.message}
              />
            </label>
            {this.state.img ? (
              <>
                <img
                  src={this.state.img.secure_url}
                  alt="nahrana fotka z cesty"
                />
                <CloudinaryWidget
                  uid={this.props.userId}
                  updateImageDetails={this.updateImageDetails}
                  btnTxt="Nahraj inú fotku"
                />
              </>
            ) : (
              <CloudinaryWidget
                uid={this.props.userId}
                updateImageDetails={this.updateImageDetails}
                btnTxt="Nahraj fotku"
              />
            )}
            <button className="snpBtn" onClick={this.sendMessage} type="submit">
              Poslať správu
            </button>
          </div>
      </div>
    );
  }
}

export default Message;
