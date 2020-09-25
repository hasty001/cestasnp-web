import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import Map from './Map';
import Loader from './reusable/Loader';
import NotFound from './reusable/NotFound';
import CommentBox from './reusable/CommentBox';
import ImageBox from './reusable/ImageBox';
import { dateToStr, dateTimeToStr } from '../helpers/helpers';

class Traveller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      travellerId: this.props.match.params.traveller,
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
      showImageBox: false,
      imageUrl: '',
      visitorIp: '',
      orderFromOld: false
    };

    this.handleCommentBox = this.handleCommentBox.bind(this);
    this.handleImageBox = this.handleImageBox.bind(this);
    this.updateTravellerComments = this.updateTravellerComments.bind(this);
    this.handleOrderClick = this.handleOrderClick.bind(this);

    this.sortMessages = this.sortMessages.bind(this);
  }

  componentDidMount() {

    var orderFromOld = (window.location.hash === "#from-old");
    if (orderFromOld != this.state.orderFromOld)
      this.setState({
        orderFromOld: orderFromOld
      });

    // get user's API address
    fetch('https://api.ipify.org/?format=json')
      .then(resp => resp.json())
      .then(ipData => {
        this.setState({
          visitorIp: ipData.ip
        });
      })
      .catch(err => {
        throw err;
      });

    fetch(`/api/traveller/details/${this.state.travellerId}`)
      .then(resp => resp.json())
      .then(data => {
        const travellerData = {};
        travellerData.meno = data[0].meno;
        travellerData.text = data[0].text;
        travellerData.articleID = data[0].articleID;
        travellerData.start_miesto = data[0].start_miesto;
        travellerData.start_date = data[0].start_date;
        travellerData.end_date = data[0].end_date;
        travellerData.completed = data[0].completed;
        travellerData.travellerId = data[0]._id;
        this.setState({
          travellerData
        });
      })
      .then(() => {
        fetch(`/api/traveller/messages/${this.state.travellerId}`)
          .then(resp => resp.json())
          .then(data => {
            const travellerMessages = data.map(message => {
              const newMessage = {};
              newMessage.type = 'message';
              newMessage.date = message.pub_date.substring(0, 16);
              if (message.img) {
                if (message.img.eager) {
                  newMessage.img = message.img.eager[0].secure_url;
                  const first = message.img.secure_url.slice(0, 51);
                  const second = '/c_scale,w_1240/';
                  const third = message.img.secure_url.slice(52);
                  newMessage.fullImg = first + second + third;
                } else {
                  newMessage.img = message.img;
                }
              } else {
                newMessage.img = 'None';
              }
              newMessage.lat = message.lat;
              newMessage.lon = message.lon;
              newMessage.text = message.text;
              newMessage.username = this.state.travellerData.meno;
              newMessage.id = message._id;
              return newMessage;
            });
            this.setState({
              travellerMessages
            });
          })
          .then(() => {
            const commentData = {
              articleId: this.state.travellerData.articleID,
              travellerId: this.state.travellerData.travellerId
            };
            fetch('/api/traveller/comments', {
              method: 'POST',
              body: JSON.stringify(commentData),
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            })
              .then(res => res.json())
              .then(data => {
                const { travellerMessages } = this.state;
                data.forEach(comment => {
                  const newComment = {};
                  newComment.type = 'comment';
                  newComment.date = comment.date.substring(0, 16);
                  if (comment.username) {
                    newComment.username = comment.username;
                  } else {
                    newComment.username = comment.name;
                  }
                  newComment.text = comment.comment;
                  newComment.id = comment._id;
                  travellerMessages.push(newComment);
                });
                this.sortMessages(travellerMessages, this.state.orderFromOld);
                this.setState({
                  travellerMessages,
                  loading: false
                });

                if (window.location.hash.length > 1) {
                  var highlighted = document.getElementById(window.location.hash.slice(1));
                  if (highlighted)
                    highlighted.scrollIntoView();
                }
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
      if (!this.state.showCommentBtn && window.pageYOffset > 300) {
        this.setState({
          showCommentBtn: true
        });
      } else if (this.state.showCommentBtn && window.pageYOffset <= 300) {
        this.setState({
          showCommentBtn: false
        });
      }
    });
  }

  handleCommentBox(open) {
    this.setState({ showCommentBox: open });
  }

  sortMessages(msgs, order)
  {
    return msgs.sort((a, b) => {
      return (order ? (b.date > a.date ? -1 : b.date < a.date ? 1 : 0) :
        (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    });
  }

  handleOrderClick(e) {
    e.preventDefault();

    var order = !this.state.orderFromOld;
    this.setState({
      orderFromOld: order,
      travellerMessages: this.sortMessages(this.state.travellerMessages, order)
    });
  }

  handleImageBox(open, url) {
    this.setState({
      showImageBox: open,
      imageUrl: url
    });
  }

  updateTravellerComments(comment) {
    const updatedComments = this.state.travellerMessages;
    const newComment = {};
    newComment.type = 'comment';
    newComment.date = comment.date;
    newComment.username = comment.name;
    newComment.text = comment.comment;
    newComment.id = comment._id;
    updatedComments.push(newComment);
    this.sortMessages(updatedComments, this.state.orderFromOld);
    this.setState({
      travellerMessages: updatedComments
    });
  }

  render() {
    return (
      <div id="Traveller">
        {this.state.loading && !this.state.error && <Loader />}

        {!this.state.loading && !this.state.error && this.state.travellerData && (
          <div>
            <Map
              use="na-ceste-map-traveller"
              start={this.state.travellerData.start_miesto}
              stops={this.state.travellerMessages}
            />

            <div className="na-ceste-traveller" style={{ textAlign: 'center' }}>
              <p>{this.state.travellerData.meno}</p>
              <p>{this.state.travellerData.text}</p>
              <p>
                Začiatok: {this.state.travellerData.start_miesto}{' '}
                {dateToStr(this.state.travellerData.start_date)}
              </p>              
            </div>

            <div className="na-ceste-traveller-sort" >
              Zoradiť: <a href="#" onClick={this.handleOrderClick}>{this.state.orderFromOld ? " od najnovšie" : " od najstaršie"} </a>           
            </div>

            <div className="na-ceste-traveller-msgs">
              {this.state.travellerMessages.map((message, i) => {
                if (message.type === 'message') {
                  var divClassName = "traveller-message";

                  if (window.location.hash === "#" + message.id)
                  {
                    divClassName += " highlighted";
                  }

                  return (
                    <div key={i} className={divClassName}>
                      <div id={message.id} className="traveller-message-scrolllink" />
                      {message.img !== 'None' && message.img !== null && (
                        <img
                          src={
                            typeof message.img === 'string' &&
                            message.img.indexOf('res.cloudinary.com') === -1
                              ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${message.img}`
                              : message.img
                          }
                          style={{
                            display: 'block',
                            margin: '0px auto 15px',
                            minWidth: '80px',
                            maxWidth: '100%',
                            maxHeight: '80vh'
                          }}
                          alt="fotka z putovania"
                          onClick={() => {
                            this.handleImageBox(
                              true,
                              message.img.indexOf('res.cloudinary.com') === -1
                                ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${message.img}`
                                : message.fullImg
                            );
                          }}
                        />
                      )}
                      <div className="red-stripe" />
                      <p style={{ display: 'inline-block' }}>
                        {`${dateTimeToStr(message.date)} ${message.username} `}
                        <a href={`#${message.id}`} className="traveller-message-link" title="odkaz na správu">🔗</a>
                      </p>
                      <p dangerouslySetInnerHTML={{ __html: message.text }} />
                    </div>
                  );
                }

                var divClassName = "traveller-comment";

                if (window.location.hash === "#" + message.id)
                {
                  divClassName += " highlighted";
                }

                return (
                  <div key={i} className={divClassName}>
                    <div id={message.id} className="traveller-comment-scrolllink" />
                    <p>
                      <i
                        className="fa fa-comment"
                        aria-hidden="true"
                        style={{ color: '#ccc2c2' }}
                      />
                      {` ${dateTimeToStr(message.date)} ${message.username} `}
                      <a href={`#${message.id}`} className="traveller-comment-link" title="odkaz na komentár">🔗</a>
                    </p>
                    <p dangerouslySetInnerHTML={{ __html: message.text }} />
                  </div>
                );
              })}
            </div>

            {this.state.showCommentBtn && (
              <Button
                className="comment-box-btn"
                onClick={() => this.handleCommentBox(true)}
              >
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

            <ImageBox
              show={this.state.showImageBox}
              onHide={() => this.handleImageBox(false)}
              url={this.state.imageUrl}
            />
          </div>
        )}

        {this.state.error && <NotFound />}
      </div>
    );
  }
}

export default Traveller;
