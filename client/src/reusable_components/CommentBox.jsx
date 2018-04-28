import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recaptcha from 'react-recaptcha';

import Loader from '../reusable_components/Loader';

class CommentBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      name: '',
      captcha: '',
      captchaLoaded: false,
      loading: false,
      errorMsg: ''
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
      comment: e.target.value
    });
  }

  updateName(e) {
    e.preventDefault();
    this.setState({
      name: e.target.value
    });
  }

  addComment() {
    if (this.state.captcha === '') {
      this.setState({
        errorMsg: 'Prosím dokáž, že nie si robot'
      });
      return;
    }

    this.setState({
      loading: true
    });

    let data = {};
    data.comment = this.state.comment;
    data.name = this.state.name;
    data['g-recaptcha-response'] = this.state.captcha;

    fetch('/api/traveller/addComment', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

  verifyCallback(response) {
    this.setState({
      captcha: response,
      errorMsg: ''
    });
  }

  onloadCallback() {
    this.setState({
      captchaLoaded: true
    });
  }

  expiredCallback() {
    this.setState({
      captcha: ''
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
              <Modal.Title id="contained-modal-title-lg">Tvoj koment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label style={{ display: 'block' }}>
                Meno:
                <input
                  value={this.state.name}
                  onChange={this.updateName}
                  style={{ display: 'block' }}
                />
              </label>
              <label style={{ display: 'block' }}>
                Komentár:
                <textarea
                  value={this.state.comment}
                  onChange={this.updateComment}
                  style={{ display: 'block' }}
                />
              </label>
              <Recaptcha
                render="explicit"
                verifyCallback={this.verifyCallback}
                onloadCallback={this.onloadCallback}
                expiredCallback={this.expiredCallback}
                sitekey="6LdmY1UUAAAAAOi_74AYzgrYCp-2fpusucy1lmrK"
                hl="sk"
              />
              {this.state.errorMsg !== '' && (
                <p style={{ color: 'white', background: 'pink' }}>{this.state.errorMsg}</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.addComment}>Pridaj komentár</Button>
              <Button onClick={this.props.onHide}>Zavri</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}

export default CommentBox;
