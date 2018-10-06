import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment-timezone';
import Recaptcha from 'react-recaptcha';
import Loader from '../reusable_components/Loader';

moment.tz.setDefault('Europe/Vienna');

class CommentBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      name: '',
      captcha: '',
      captchaLoaded: false,
      loading: false,
      captchaError: '',
      commentError: '',
      nameError: '',
    };

    this.addComment = this.addComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.updateName = this.updateName.bind(this);
    this.onloadCallback = this.onloadCallback.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.expiredCallback = this.expiredCallback.bind(this);
  }

  updateComment(e) {
    e.preventDefault();
    this.setState({
      comment: e.target.value,
      commentError: '',
    });
  }

  updateName(e) {
    e.preventDefault();
    this.setState({
      name: e.target.value,
      nameError: '',
    });
  }

  addComment() {
    if (this.state.captcha === '') {
      this.setState({
        captchaError: 'Prosím potvrď, že nie si robot',
      });
      return;
    }

    if (this.state.name === '') {
      this.setState({
        nameError: 'Prosím vyplň svoje meno',
      });
      return;
    }

    if (this.state.comment === '') {
      this.setState({
        commentError: 'Prosím napíš komentár',
      });
      return;
    }

    this.setState({
      loading: true,
    });

    let data = {};
    data.date = moment().format('YYYY-MM-DD HH:mm:ss');
    data.comment = this.state.comment;
    data.name = this.state.name;
    data.articleId = this.props.articleID;
    data.visitorIp = this.props.visitorIp;
    data.travellerName = this.props.travellerName;
    data.travellerId = this.props.travellerId;
    data['g-recaptcha-response'] = this.state.captcha;

    fetch('/api/traveller/addComment', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })
      .then(res => res.json())
      .then(comment => {
        if (comment.error === 'Malicious comment') {
          this.setState({
            loading: false,
            captchaError: 'Ups, niekde sa stala chyba. Skús neskôr prosím',
          });
          return;
        } else {
          this.setState({
            loading: false,
          });
          this.props.updateTravellerComments(comment);
          this.props.onHide();
        }
      })
      .catch(err => {
        this.setState({
          loading: false,
          captchaError: 'Ups, niekde sa stala chyba. Skús neskôr prosím',
        });
        throw err;
      });
  }

  verifyCallback(response) {
    this.setState({
      captcha: response,
      captchaError: '',
    });
  }

  onloadCallback() {
    this.setState({
      captchaLoaded: true,
    });
  }

  expiredCallback() {
    this.setState({
      captcha: '',
    });
  }

  render() {
    return (
      <div id="CommentBox">
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <Modal
            {...this.props}
            show={this.props.show}
            onHide={this.props.onHide}
            dialogClassName="comment-box"
            style={{ marginTop: '100px' }}
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-lg">Tvoj komentár</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label className="commentLabel">
                Meno:
                <input value={this.state.name} onChange={this.updateName} className="nameInput" />
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
              <div className="recaptchaWrapper">
                <Recaptcha
                  render="explicit"
                  verifyCallback={this.verifyCallback}
                  onloadCallback={this.onloadCallback}
                  expiredCallback={this.expiredCallback}
                  sitekey="6LdmY1UUAAAAAOi_74AYzgrYCp-2fpusucy1lmrK"
                  hl="sk"
                  size={window.innerWidth <= 390 ? 'compact' : 'normal'}
                />
              </div>
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
