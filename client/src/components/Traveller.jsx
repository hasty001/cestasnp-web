import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import Map from './Map';
import Loader from '../reusable_components/Loader';
import NotFound from '../reusable_components/NotFound';
import CommentBox from '../reusable_components/CommentBox';

class Traveller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
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
      travellerMessages: '',
      showCommentBtn: false,
      showCommentBox: false,
      visitorIp: ''
    };

    this.handleCommentBox = this.handleCommentBox.bind(this);
    this.updateTravellerComments = this.updateTravellerComments.bind(this);
  }

  componentDidMount() {
    //get user's API address
    fetch('https://api.ipify.org/?format=json')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          visitorIp: data.ip
        });
      })
      .catch(err => {
        throw err;
      });

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
        travellerData.travellerId = data[0]['_id'];
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
            let data = {};
            data.articleId = this.state.travellerData.articleID;
            data.travellerId = this.state.travellerData.travellerId;
            fetch('/api/traveller/comments', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            })
              .then(res => res.json())
              .then(data => {
                let travellerMessages = this.state.travellerMessages;
                data.forEach(comment => {
                  let newComment = {};
                  newComment.type = 'comment';
                  newComment.date = comment.date;
                  if (comment.username) {
                    newComment.username = comment.username;
                  } else {
                    newComment.username = comment.name;
                  }
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
                this.setState({
                  error: true
                });
                throw e;
              });
          })
          .catch(e => {
            this.setState({
              error: true
            });
            throw e;
          });
      })
      .catch(e => {
        this.setState({
          error: true
        });
        throw e;
      });

    window.addEventListener('scroll', () => {
      if (!this.state.showCommentBtn && window.scrollY > 300) {
        this.setState({
          showCommentBtn: true
        });
      } else if (this.state.showCommentBtn && window.scrollY <= 300) {
        this.setState({
          showCommentBtn: false
        });
      }
    });
  }

  handleCommentBox(open) {
    this.setState({ showCommentBox: open });
  }

  updateTravellerComments(comment) {
    let updatedComments = this.state.travellerMessages;
    let newComment = {};
    newComment.type = 'comment';
    newComment.date = comment.date;
    newComment.username = comment.username;
    newComment.text = comment.comment;
    updatedComments.push(newComment);
    updatedComments.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    this.setState({
      travellerMessages: updatedComments
    });
  }

  render() {
    return (
      <div id="Traveller">
        {this.state.loading && !this.state.error && <Loader />}

        {!this.state.loading &&
          !this.state.error &&
          this.state.travellerData && (
            <div>
              <Map
                use="na-ceste-map-traveller"
                start={this.state.travellerData.start_miesto}
                stops={this.state.travellerMessages}
              />

              <div className="na-ceste-traveller" style={{ textAlign: 'center' }}>
                <p>{this.state.travellerData.meno}</p>
                <p>{this.state.travellerData.text}</p>
                <p>Začiatok: {this.state.travellerData.start_miesto}</p>
              </div>

              <div className="na-ceste-traveller-msgs">
                {this.state.travellerMessages.map((message, i) => {
                  if (message.type === 'message') {
                    return (
                      <div key={i} className="traveller-message">
                        {message.img !== 'None' && (
                          <img
                            src={
                              'http://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/' +
                              message.img
                            }
                            style={{
                              display: '-webkit-box',
                              margin: '0px auto 15px',
                              minWidth: '80px',
                              maxWidth: '100%',
                              maxHeight: '80vh'
                            }}
                            alt="fotka z putovania"
                          />
                        )}
                        <div className="red-stripe" />
                        <p style={{ display: 'inline-block' }}>
                          {message.date + ' ' + message.username}
                        </p>
                        <p dangerouslySetInnerHTML={{ __html: message.text }} />
                      </div>
                    );
                  } else {
                    return (
                      <div key={i} className="traveller-comment">
                        <p>
                          <i
                            className="fa fa-comment"
                            aria-hidden="true"
                            style={{ color: '#ccc2c2' }}
                          />
                          {' ' + message.date + ' ' + message.username}
                        </p>
                        <p dangerouslySetInnerHTML={{ __html: message.text }} />
                      </div>
                    );
                  }
                })}
              </div>

              {this.state.showCommentBtn && (
                <Button className="comment-box-btn" onClick={() => this.handleCommentBox(true)}>
                  Komentuj
                </Button>
              )}

              <CommentBox
                show={this.state.showCommentBox}
                onHide={() => this.handleCommentBox(false)}
                dialogClassName="comment-box"
                articleID={this.state.travellerData.articleID}
                visitorIp={this.state.visitorIp}
                updateTravellerComments={this.updateTravellerComments}
                travellerId={this.state.travellerData.travellerId}
                travellerName={this.state.travellerData.meno}
              />
            </div>
          )}

        {this.state.error && <NotFound />}
      </div>
    );
  }
}

export default Traveller;