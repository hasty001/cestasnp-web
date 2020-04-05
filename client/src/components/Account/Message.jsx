import React, { Component } from 'react';
import moment from 'moment-timezone';
import { isDecimal } from 'validator';

import Loader from '../reusable/Loader';
import CloudinaryWidget from '../reusable/CloudinaryWidget';

moment.tz.setDefault('Europe/Vienna');

class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errorMsg: '',
      message: '',
      lat: '',
      lon: '',
      accuracy: '',
      img: '',
      edit: {
        lat: 0,
        lon: 0
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
      positionLoading: 1,
      errorMsg: ''
    });

    const options = {
      timeout: 8000,
      enableHighAccuracy: true
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.setState({
          lat: coords.latitude.toFixed(6),
          lon: coords.longitude.toFixed(6),
          accuracy: coords.accuracy,
          positionLoading: 0
        });
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

    if (!isDecimal(value)) {
      this.setState({
        errorMsg: 'GPS súradnica musí byť desatinné číslo oddelené bodkou!'
      });
    }
  }

  sendMessage() {
    if (!this.state.message || this.state.message.trim().length === 0) {
      this.setState({
        errorMsg: 'Správa nemôže ostať prázdna.'
      });
      return;
    }
    if (
      !this.state.lat ||
      this.state.lat.trim().length === 0 ||
      !this.state.lon ||
      this.state.lon.trim().length === 0
    ) {
      this.setState({
        errorMsg: 'Pozícia nemôže ostať prázdna.'
      });
      return;
    }

    this.setState({
      loading: true
    });

    const data = {};
    data.lon = this.state.lon;
    data.lat = this.state.lat;
    data.accuracy = this.state.accuracy;
    data.text = this.state.message;
    data.pub_date = moment().format('YYYY-MM-DD HH:mm:ss');
    data.user_id = this.props.userId;
    data.img = this.state.img;
    data.pub_date_milseconds = moment().valueOf();
    data.details_id = this.props.travellerId;

    fetch('/api/traveller/sendMessage', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(msgRes => {
        if (msgRes.error) {
          this.setState({
            loading: false,
            errorMsg: 'Ups, niekde sa stala chyba. Skús neskôr prosím'
          });
        } else {
          this.setState({
            loading: false,
            successMsg: 'Správa úspešne poslaná!',
            message: '',
            lat: '',
            lon: '',
            img: ''
          });
          this.props.updateTravellerMsgs(msgRes);
        }
      })
      .catch(() => {
        this.setState({
          loading: false
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
      <div id="MessageForm" className="thinRedWrap">
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <>
            <h2>Poslať správu</h2>
            {this.state.errorMsg && (
              <p className="errorMsg">{this.state.errorMsg}</p>
            )}
            {this.state.successMsg && (
              <p className="successMsg">{this.state.successMsg}</p>
            )}
            {this.state.positionLoading ? (
              <Loader />
            ) : (
              <>
                <label htmlFor="lat">
                  <span
                    onClick={() => {
                      this.triggerEdit('lat');
                    }}
                  >
                    Zem. šírka (latitude): <i className="fas fa-edit" />
                  </span>
                  {this.state.edit.lat ? (
                    <input
                      id="lat"
                      name="lat"
                      value={this.state.lat}
                      onBlur={e => {
                        this.verifyGPSFormat(e);
                        e.preventDefault();
                      }}
                      onChange={this.handleChange}
                    />
                  ) : (
                    <p className="travellerP">{this.state.lat}</p>
                  )}
                </label>
                <label htmlFor="lon">
                  <span
                    onClick={() => {
                      this.triggerEdit('lon');
                    }}
                  >
                    Zem. dĺžka (longitude): <i className="fas fa-edit" />
                  </span>
                  {this.state.edit.lon ? (
                    <input
                      id="lon"
                      name="lon"
                      value={this.state.lon}
                      onBlur={e => {
                        this.verifyGPSFormat(e);
                        e.preventDefault();
                      }}
                      onChange={this.handleChange}
                    />
                  ) : (
                    <p className="travellerP">{this.state.lon}</p>
                  )}
                </label>
                <button
                  className="snpBtnWhite"
                  onClick={this.getMyPosition}
                  type="button"
                >
                  Získaj pozíciu
                </button>
              </>
            )}
            <label htmlFor="name">
              <span>Text</span>
              <textarea
                type="text"
                id="message"
                name="message"
                onBlur={e => {
                  this.handleChange(e);
                  e.preventDefault();
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
          </>
        )}
      </div>
    );
  }
}

export default Message;
