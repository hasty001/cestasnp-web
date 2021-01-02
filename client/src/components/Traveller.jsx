import React, { Component, Fragment, useContext } from 'react';
import { Button } from 'react-bootstrap';
import Map from './Map';
import Loader from './reusable/Loader';
import NotFound from './reusable/NotFound';
import CommentBox from './reusable/CommentBox';
import ImageBox from './reusable/ImageBox';
import { dateToStr, dateTimeToStr } from '../helpers/helpers';
import * as Constants from './Constants';
import { AuthContext } from './AuthContext';
import ConfirmBox from './reusable/ConfirmBox';
import UserLabel from './reusable/UserLabel';
import DocumentTitle from 'react-document-title';
import history from '../helpers/history';
import DOMPurify from 'dompurify';

const Traveller = (props) => {
  const authData = useContext(AuthContext);
  return (
    <TravellerWithAuth {...props} userData={authData.authProviderMounted && authData.isAuth ? authData : null} />
  );
};

class TravellerWithAuth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      errorMsg: '',
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
      showCommentBtn: this.props.scrollTop > Constants.ShowCommentBoxScrollOffset,
      showCommentBox: false,
      showImageBox: false,
      imageUrl: '',
      visitorIp: '',
      orderFromOld: false,
      deleteCommentId: null,
      showConfirmDeleteComment: false,
      deleteMessageId: null,
      showConfirmDeleteMessage: false,
    };

    this.handleCommentBox = this.handleCommentBox.bind(this);
    this.handleImageBox = this.handleImageBox.bind(this);
    this.updateTravellerComments = this.updateTravellerComments.bind(this);
    this.handleOrderClick = this.handleOrderClick.bind(this);
    this.handleDeleteCommentClick = this.handleDeleteCommentClick.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
    this.handleDeleteMessageClick = this.handleDeleteMessageClick.bind(this);
    this.handleDeleteMessage = this.handleDeleteMessage.bind(this);
    this.sortMessages = this.sortMessages.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    var orderFromOld = (window.location.search === Constants.FromOldQuery);
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

    this.setState({ errorMsg: "" });

    fetch(`/api/traveller/details/${this.state.travellerId}`)
      .then(resp => resp.json())
      .then(data => {
        const travellerData = {};

        if (data.length == 0) {
          this.setState({ errorMsg: "Momentálne nie je na ceste ani cestu neplánuje." });
          throw "No deatils found.";
        }

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
                  newComment.uid = comment.uid;
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
  }

  componentWillReceiveProps(newProps){
    const showCommentBtn = newProps.scrollTop > Constants.ShowCommentBoxScrollOffset;
    if (showCommentBtn != this.state.showCommentBtn)
      this.setState({
        showCommentBtn: showCommentBtn
      });

    if (this.state.travellerId != newProps.match.params.traveller) {
      this.setState({ travellerId: newProps.match.params.traveller,
        travellerData: {}, travellerMessages: [], 
        showCommentBox: false,
        showImageBox: false,
        orderFromOld: false, 
        loading: true, error: false
        }, this.fetchData);
    }
  }

  handleDeleteMessageClick(event) {
    event.preventDefault();

    this.setState({ deleteMessageId: event.currentTarget.dataset.msgid, showConfirmDeleteMessage: !!event.currentTarget.dataset.msgid });
  }

  handleDeleteMessage(confirmed) {
    if (confirmed) {
      const updatedMessages = this.state.travellerMessages;

      var error = "";
      var success = "";

      this.props.userData.user.getIdToken().then(token => 
        fetch('/api/traveller/deleteMessage', {
          method: 'POST',
          body: JSON.stringify({ 
            id: this.state.deleteMessageId, 
            uid: this.props.userData.userDetails.uid }),
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          })
        })
      .then(res => res.json())
      .then(msg => {
        if (msg.error) {
          console.error(msg.error);
          error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
        } else {
          success = 'Správa bola uspešne zmazaná.';
        }
      }))
      .catch(err => {
        console.error(err);
        error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
      }).then(() =>
      {
        updatedMessages.forEach(msg => {
            msg.error = msg.id === this.state.deleteMessageId ? error : "";
            msg.success = msg.id === this.state.deleteMessageId ? success : "";
            msg.deleted = msg.deleted || (msg.id === this.state.deleteMessageId && success);
          });
        
        this.setState({
          travellerMessages: updatedMessages,
          showConfirmDeleteMessage: false 
        });
      });
    } else {
      this.setState({
        showConfirmDeleteMessage: false 
      });
    }
  }

  handleDeleteCommentClick(event) {
    event.preventDefault();

    this.setState({ deleteCommentId: event.currentTarget.dataset.msgid, showConfirmDeleteComment: !!event.currentTarget.dataset.msgid });
  }

  handleDeleteComment(confirmed) {
    if (confirmed) {
      const updatedComments = this.state.travellerMessages;

      var error = "";
      var success = "";

      this.props.userData.user.getIdToken().then(token => 
        fetch('/api/traveller/deleteComment', {
          method: 'POST',
          body: JSON.stringify({ 
            id: this.state.deleteCommentId, 
            uid: this.props.userData.userDetails.uid,
            articleId: this.state.travellerData.articleID }),
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          })
        })
      .then(res => res.json())
      .then(comment => {
        if (comment.error) {
          console.error(comment.error);
          error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
        } else {
          success = 'Komentár bol uspešne zmazaný.';
        }
      }))
      .catch(err => {
        console.error(err);
        error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
      }).then(() =>
      {
        updatedComments.forEach(msg => {
            msg.error = msg.id === this.state.deleteCommentId ? error : "";
            msg.success = msg.id === this.state.deleteCommentId ? success : "";
            msg.deleted = msg.deleted || (msg.id === this.state.deleteCommentId && success);
          });
        
        this.setState({
          travellerMessages: updatedComments,
          showConfirmDeleteComment: false 
        });
      });
    } else {
      this.setState({
        showConfirmDeleteComment: false 
      });
    }
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
    var order = !this.state.orderFromOld;

    if (!window.history.pushState) {
      history.push((order ? Constants.FromOldQuery : "?") + window.location.hash);
    } else {
      window.history.pushState(null, null, (order ? Constants.FromOldQuery : "?") + window.location.hash);

      this.setState({
        orderFromOld: order,
        travellerMessages: this.sortMessages(this.state.travellerMessages, order)
      });
    }
  }

  handleImageBox(open, url) {
    this.setState({
      showImageBox: open,
      imageUrl: url
    });
  }

  updateTravellerComments(comment) {
    const updatedComments = this.state.travellerMessages;

    updatedComments.forEach(msg => {
      msg.error = "";
      msg.success = "";
    });

    const newComment = {};
    newComment.type = 'comment';
    newComment.date = comment.date;
    newComment.username = comment.name;
    newComment.text = comment.comment;
    newComment.id = comment._id;
    newComment.uid = comment.uid;
    updatedComments.push(newComment);
    this.sortMessages(updatedComments, this.state.orderFromOld);

    window.location.hash = "#" + newComment.id;

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

            <DocumentTitle title={`${this.state.travellerData.meno}${Constants.WebTitleSuffix}`} />

            <div className="na-ceste-traveller" style={{ textAlign: 'center' }}>
              <p>{this.state.travellerData.meno}</p>
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(this.state.travellerData.text) }}></p>
              <p>
                Začiatok: {this.state.travellerData.start_miesto}{' '}
                {dateToStr(this.state.travellerData.start_date)}
              </p>              
            </div>

            <div className="na-ceste-traveller-sort" data-nosnippet >
              Zoradiť: <a href="#" onClick={this.handleOrderClick}>{this.state.orderFromOld ? " od najnovšie" : " od najstaršie"} </a>           
            </div>

            <div className="na-ceste-traveller-msgs">
              {this.state.travellerMessages.map((message, i) => {
                const error = <Fragment>{!!message.error && (<p className="errorMsg">{message.error}</p>)}</Fragment>;
                const success = <Fragment>{!!message.success && (<p className="successMsg">{message.success}</p>)}</Fragment>;
                  
                if (message.type === 'message') {
                  var divClassName = "traveller-message";

                  if (message.deleted) {
                    return (<div key={i} className={divClassName + "-deleted"}>
                        {error}
                        {success}
                      </div>);
                  }

                  if (window.location.hash === "#" + message.id)
                  {
                    divClassName += " highlighted";
                  }

                  return (
                    <div key={i} className={divClassName}>
                      <div id={message.id} className="traveller-message-scrolllink" />
                      {error}
                      {success}
                      <p>
                        <span className="red-stripe" />
                        {`${dateTimeToStr(message.date)} ${message.username}`}
                        <span className="traveller-message-actions">
                        {(this.props.userData && (this.state.travellerId == this.props.userData.userDetails.uid)) && 
                          (<a href="#" data-msgid={message.id} onClick={this.handleDeleteMessageClick} className="traveller-message-delete" title="zmazať správu"><i className="fas fa-trash-alt"/></a>)}
                        <a href={`#${message.id}`} className="traveller-message-link" title="odkaz na správu"><i className="fas fa-link"/></a>
                        </span>
                      </p>
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
                          alt={`${this.state.travellerData.meno} - fotka z putovania`}
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
                      <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
                    </div>
                  );
                }

                var divClassName = "traveller-comment";

                if (message.deleted) {
                  return (<div key={i} className={divClassName + "-deleted"}>
                      {error}
                      {success}
                    </div>);
                }

                if (window.location.hash === "#" + message.id)
                {
                  divClassName += " highlighted";
                }

                return (
                  <div key={i} className={divClassName}>
                    <div id={message.id} className="traveller-comment-scrolllink" />
                    {error}
                    {success}
                    <div style={{ float: "left", marginRight: "4px" }} >
                      <i className="fa fa-comment" aria-hidden="true" style={{ color: '#ccc2c2' }} />
                    </div>    
                    <p>                
                      {` ${dateTimeToStr(message.date)} `}
                      <UserLabel uid={message.uid} name={message.username} />
                      <span className="traveller-comment-actions">
                        {(this.props.userData 
                          && (message.uid === this.props.userData.userDetails.uid 
                            || (this.state.travellerId == this.props.userData.userDetails.uid))) && 
                          (<a href="#" data-msgid={message.id} onClick={this.handleDeleteCommentClick} className="traveller-comment-delete" title="zmazať komentár"><i className="fas fa-trash-alt"/></a>)}
                        <a href={`#${message.id}`} className="traveller-comment-link" title="odkaz na komentár"><i className="fas fa-link"/></a>
                      </span>
                    </p>
                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
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

            <ConfirmBox
              title="Zmazať komentár"
              text="Naozaj chcete zmazať tento komentár?"
              confirmText="Zmazať"
              show={this.state.showConfirmDeleteComment}
              onConfirm={() => this.handleDeleteComment(true)}
              onHide={() => this.handleDeleteComment(false)}
            />

            <ConfirmBox
              title="Zmazať správu"
              text="Naozaj chcete zmazať túto správu?"
              confirmText="Zmazať"
              show={this.state.showConfirmDeleteMessage}
              onConfirm={() => this.handleDeleteMessage(true)}
              onHide={() => this.handleDeleteMessage(false)}
            />
          </div>
        )}

        {this.state.error && (this.state.errorMsg ? <p style={{ margin: '10px' }}>{this.state.errorMsg}</p> : <NotFound />)}
      </div>
    );
  }
}

export default Traveller;
