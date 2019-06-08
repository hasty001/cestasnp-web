import React, { Component } from 'react';
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
        position: '',
        img: '',
    };

    this.sendMessage = this.sendMessage.bind(this);
  }

  sendMessage() {
    if (!this.state.message || this.state.message.trim().length === 0) {
      this.setState({
        errorMsg: 'Správa nemôže ostať prázdna.',
      });
      return;
    }

    this.setState({
      loading: true,
    });

    let data = {};
    data.lon = "";
    data.lat = "";
    data.accuracy = "";
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

  render() {
    return (
      <div id="Message">
        {this.state.loading && <Loader />}
        {!this.state.loading && 
            <form 
                className="accountWrap"
                onSubmit={(e) => {
                    this.sendMessage
                    e.preventDefault()
                }}>
                <h2>Poslať správu</h2>
                {this.state.errorMsg && <p className="errorMsg">{this.state.errorMsg}</p>}
                <label htmlFor="name">
                    <span>Text</span>
                    <textarea
                        type="text"
                        id="msg"
                        name="msg"
                        onBlur={(e) => {
                            this.handleChange(e)
                            e.preventDefault()
                        }}
                        onChange={this.handleChange}
                        />
                </label>
                <button className="snpBtn" onClick={this.sendMessage} type="submit">Poslať správu</button>
            </form>
        }
      </div>
    );
  }
}

export default Message;
