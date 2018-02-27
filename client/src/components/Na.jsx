import React, { Component } from 'react';
import Map from './Map';
import Loader from './Loader';

class Na extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      travellerId: parseInt(this.props.match.params.traveller),
      travellerData: {
        meno: '',
        text: '',
        articleID: '',
        start_miesto: '',
        start_date: '',
        end_date: '',
        completed: ''
      },
      travellerMessages: ''
    };
  }

  componentDidMount() {
    fetch('/api/traveller/details/' + this.state.travellerId)
      .then(resp => resp.json())
      .then(data => {
        let travellerData = {};
        travellerData.meno = data[0].meno;
        travellerData.text = data[0].text;
        travellerData.articleID = data[0].articleID;
        travellerData.start_miesto = data[0].start_miesto;
        travellerData.start_date = data[0].start_date;
        travellerData.end_date = data[0].end_date;
        travellerData.completed = data[0].completed;
        this.setState({
          travellerData
        });
      })
      .then(() => {
        fetch('/api/traveller/messages/' + this.state.travellerId)
          .then(resp => resp.json())
          .then(data => {
            let travellerMessages = data.map(message => {
              let newMessage = {};
              newMessage.type = 'message';
              newMessage.date = message.pub_date;
              newMessage.img = message.img;
              newMessage.lat = message.lat;
              newMessage.lon = message.lon;
              newMessage.text = message.text;
              newMessage.username = this.state.travellerData.meno;
              return newMessage;
            });
            this.setState({
              travellerMessages
            });
          })
          .then(() => {
            fetch('/api/traveller/comments/' + this.state.travellerData.articleID)
              .then(resp => resp.json())
              .then(data => {
                let travellerMessages = this.state.travellerMessages;
                data.forEach(comment => {
                  let newComment = {};
                  newComment.type = 'comment';
                  newComment.date = comment.date;
                  newComment.username = comment.username;
                  newComment.text = comment.comment;
                  travellerMessages.push(newComment);
                });
                travellerMessages.sort((a, b) => {
                  return new Date(b.date) - new Date(a.date);
                });
                this.setState({
                  travellerMessages,
                  loading: false
                });
              })
              .catch(e => {
                throw e;
              });
          })
          .catch(e => {
            throw e;
          });
      })
      .catch(e => {
        throw e;
      });
  }

  render() {
    return (
      <div className="na-ceste-container">
        <div>
          <Map use="na-ceste" />
        </div>

        {this.state.loading && <Loader />}
        {!this.state.loading &&
          this.state.travellerData && (
            <div className="na-ceste-traveller" style={{ textAlign: 'center' }}>
              <p>{this.state.travellerData.meno}</p>
              <p>{this.state.travellerData.text}</p>
              <p>Začiatok: {this.state.travellerData.start_miesto}</p>
            </div>
          )}

        <div>
          {this.state.loading && <Loader />}
          {!this.state.loading &&
            this.state.travellerMessages.map((message, i) => {
              if (message.type === 'message') {
                return (
                  <div key={i} style={{ backgroundColor: 'lightGrey' }}>
                    <img src={message.img} alt="fotka z putovania" />
                    <p>{message.date + ' ' + message.username}</p>
                    <p dangerouslySetInnerHTML={{ __html: message.text }} />
                    <hr />
                  </div>
                );
              } else {
                return (
                  <div key={i} style={{ backgroundColor: 'lightBlue' }}>
                    <p>{message.date + ' ' + message.username}</p>
                    <p dangerouslySetInnerHTML={{ __html: message.text }} />
                    <hr />
                  </div>
                );
              }
            })}
        </div>
      </div>
    );
  }
}

export default Na;
