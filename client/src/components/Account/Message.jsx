import React, { Component, Fragment } from 'react';
import moment from 'moment-timezone';
import Loader from '../reusable/Loader';

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
            lon: 0,
        },
        positionLoading: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getMyPosition = this.getMyPosition.bind(this);
    this.triggerEdit = this.triggerEdit.bind(this);
  }

  handleChange(event) {
    this.setState({
        [event.target.name]: event.target.value,
        errorMsg: "",
    })
  }

  getMyPosition() {
    this.setState({
        positionLoading: 1
    })
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        this.setState({
            lat: coords.latitude.toFixed(2),
            lon: coords.longitude.toFixed(2),
            accuracy: coords.accuracy,
            positionLoading: 0,
        })
    });
  }

  sendMessage() {
    if (!this.state.message || this.state.message.trim().length === 0) {
        this.setState({
            errorMsg: 'Správa nemôže ostať prázdna.',
        });
        return;
    } else if (!this.state.lat || this.state.lat.trim().length === 0 || !this.state.lon || this.state.lon.trim().length === 0) {
        this.setState({
            errorMsg: 'Pozícia nemôže ostať prázdna.',
        });
        return;
    }

    this.setState({
      loading: true,
    });

    let data = {};
    data.lon = this.state.lon;
    data.lat = this.state.lat;
    data.accuracy = this.state.accuracy;
    data.text = this.state.message;
    data.pub_date = moment().format('YYYY-MM-DD HH:mm:ss');
    data.user_id = this.props.userId;
    data.img = null;
    data.pub_date_milseconds = moment().valueOf();
    data.details_id = this.props.travellerId;

    fetch('/api/traveller/sendMessage', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })
      .then(res => res.json())
      .then(msgRes => {
        if (msgRes.error) {
            console.log('msgError ', msgRes.error);
            this.setState({
                loading: false,
                errorMsg: 'Ups, niekde sa stala chyba. Skús neskôr prosím',
            });
            return;
        } else {
          this.setState({
            loading: false,
          });
          this.props.updateTravellerMsgs(msgRes)
          this.props.onHide();
        }
      })
      .catch(err => {
        console.log('err ', err)
        this.setState({
          loading: false,
          captchaError: 'Ups, niekde sa stala chyba. Skús neskôr prosím',
        });
        return;
      });
  }


  triggerEdit(target) {
    console.log('trigger event ', target)
    let edit = this.state.edit
    edit[target] = this.state.edit[target] === 1 ? 0 : 1
    this.setState({
        edit
    })
  }

  render() {
    return (
      <div id="MessageForm" className="thinRedWrap">
        {this.state.loading && <Loader />}
        {!this.state.loading && 
            <Fragment>

                <h2>Poslať správu</h2>
                {this.state.errorMsg && <p className="errorMsg">{this.state.errorMsg}</p>}
                <label htmlFor="name">
                    <span>Text</span>
                    <textarea
                        type="text"
                        id="message"
                        name="message"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        value={this.state.message}
                        />
                </label>
                {this.state.positionLoading ? 
                    <Loader />
                    :
                    <Fragment>
                        <label htmlFor="lat">
                            <span onClick={() => {
                                this.triggerEdit("lat") 
                            }}>Lat: <i className="fas fa-edit" ></i></span>
                            {this.state.edit.lat ?
                                <input
                                id="lat"
                                name="lat"
                                value={this.state.lat}
                                onBlur={(e) => {
                                    this.handleChange(e)
                                    e.preventDefault()
                                }}
                                onChange={this.handleChange}
                                />
                                :
                                <p className="travellerP">{this.state.lat}</p>
                            }
                        </label>
                        <label htmlFor="lon">
                            <span onClick={() => {
                                this.triggerEdit("lon") 
                            }}>Lon: <i className="fas fa-edit" ></i></span>
                            {this.state.edit.lon ?
                                <input
                                id="lon"
                                name="lon"
                                value={this.state.lon}
                                onBlur={(e) => {
                                    this.handleChange(e)
                                    e.preventDefault()
                                }}
                                onChange={this.handleChange}
                                />
                                :
                                <p className="travellerP">{this.state.lon}</p>
                            }
                        </label>
                        <button className="snpBtn" onClick={this.getMyPosition} type="button">Získaj pozíciu</button>
                    </Fragment>
                }
                <button className="snpBtn" onClick={this.sendMessage} type="submit">Poslať správu</button>
            </Fragment>
        }
      </div>
    );
}
}

export default Message;
