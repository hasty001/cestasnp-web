import React, { Component, Fragment, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recaptcha from 'react-recaptcha';
import Loader from './Loader';
import { AuthContext } from '../AuthContext';
import UserLabel from './UserLabel';
import { logDev } from '../../helpers/logDev';

const CommentBox = (props) => {
  const authData = useContext(AuthContext);
  return (
    <Fragment>
      {!authData.authProviderMounted ? (
        <Loader />
      ) : (
        <CommentBoxWithAuth {...props} userData={authData.isAuth ? authData : null} />
      )}
    </Fragment>
  );
};

class CommentBoxWithAuth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      name: '',
      captcha: '',
      loading: false,
      captchaError: '',
      commentError: '',
      nameError: ''
    };

    this.addComment = this.addComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.updateName = this.updateName.bind(this);
    this.onloadCallback = this.onloadCallback.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.expiredCallback = this.expiredCallback.bind(this);
  }

  onloadCallback = () => {
    logDev('captcha loaded');
  };

  addComment() {
    if (!this.props.userData && this.state.captcha === '') {
      this.setState({
        captchaError: 'Prosím potvrď, že nie si robot'
      });
      return;
    }

    if (!this.props.userData && this.state.name === '') {
      this.setState({
        nameError: 'Prosím vyplň svoje meno'
      });
      return;
    }

    if (this.state.comment === '') {
      this.setState({
        commentError: 'Prosím napíš komentár'
      });
      return;
    }

    this.setState({
      loading: true
    });

    const data = {};
    data.comment = this.state.comment;
    data.name = !this.props.userData ? this.state.name : 
      (this.props.userData.travellerDetails && this.props.userData.travellerDetails.meno) ?
        this.props.userData.travellerDetails.meno : this.props.userData.userDetails.name;
    data.articleId = this.props.articleID;
    data.visitorIp = this.props.visitorIp;
    data.travellerName = this.props.travellerName;
    data.travellerId = this.props.travellerId;
    data['g-recaptcha-response'] = this.state.captcha;
    data.uid = this.props.userData ? this.props.userData.userDetails.uid : null;

    const promise = this.props.userData ? 
      this.props.userData.user.getIdToken()
      : Promise.resolve("");

    promise.then(token => 
      fetch('/api/traveller/addComment', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        })
      })
      .then(res => res.json())
      .then(comment => {
        if (comment.error) {
          this.setState({
            loading: false,
            captchaError: 'Ups, niekde sa stala chyba. Skús neskôr prosím'
          });
        } else if (comment.responseError) {
          this.setState({
            loading: false,
            captchaError: 'Prosím potvrď, že nie si robot'
          });
        } else {
          this.setState({
            loading: false,
            comment: '',
            captchaError: ''
          });
          this.props.updateTravellerComments(comment);
          this.props.onHide();
        }
      }))
      .catch(err => {
        this.setState({
          loading: false,
          captchaError: 'Ups, niekde sa stala chyba. Skús neskôr prosím'
        });
        throw err;
      });
  }

  verifyCallback(response) {
    this.setState({
      captcha: response,
      captchaError: ''
    });
  }

  updateName(e) {
    e.preventDefault();
    this.setState({
      name: e.target.value,
      nameError: ''
    });
  }

  updateComment(e) {
    e.preventDefault();
    this.setState({
      comment: e.target.value,
      commentError: ''
    });
  }

  expiredCallback() {
    this.setState({
      captcha: ''
    });
  }

  render() {
    const { userData, articleID, visitorIp, 
      updateTravellerComments, travellerId, travellerName, ...modalProps } = this.props;
    return (
      <div>
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <Modal
            id="CommentBox"
            {...modalProps}
            dialogClassName="comment-box"
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">
                Tvoj komentár
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label className="commentLabel">    
                Meno:            
                {!this.props.userData ?
                  (<input
                    value={this.state.name}
                    onChange={this.updateName}
                    className="nameInput"
                    />)
                  : (<div>
                       <UserLabel uid={this.props.userData.travellerDetails.user_id} 
                         name={(this.props.userData.travellerDetails && this.props.userData.travellerDetails.meno) ?
                           this.props.userData.travellerDetails.meno : this.props.userData.userDetails.name} />
                    </div>)
                }
              </label>
              {this.state.nameError !== '' && (
                <p className="commentError">{this.state.nameError}</p>
              )}
              <label className="commentLabel">
                Komentár:
                <textarea
                  value={this.state.comment}
                  onChange={this.updateComment}
                  className="commentInput"
                />
              </label>
              {this.state.commentError !== '' && (
                <p className="commentError">{this.state.commentError}</p>
              )}
              {!this.props.userData &&
              (<div className="recaptchaWrapper">
                <Recaptcha
                  render="explicit"
                  verifyCallback={this.verifyCallback}
                  onloadCallback={this.onloadCallback}
                  expiredCallback={this.expiredCallback}
                  sitekey="6LdmY1UUAAAAAOi_74AYzgrYCp-2fpusucy1lmrK"
                  hl="sk"
                  size={window.innerWidth <= 390 ? 'compact' : 'normal'}
                />
              </div>)}
              {this.state.captchaError !== '' && (
                <p className="commentError">{this.state.captchaError}</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.addComment}>Pridaj komentár</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}

export default CommentBox;
