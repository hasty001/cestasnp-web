import React from 'react';

import { Modal } from 'react-bootstrap';
import auth from '../../helpers/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

class ForgottenPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      error: '',
      passwordSent: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  handleChange(event) {
    this.setState({
      email: event.target.value
    });
  }

  resetPassword() {
    if (!this.state.email || this.state.email.trim().length === 0) {
      this.setState({
        error: 'Email, má nesprávny formát.'
      });
      return;
    }

    sendPasswordResetEmail(auth, this.state.email)
      .then(() => {
        this.setState({
          error: '',
          passwordSent: true
        });
      })
      .catch(() => {
        this.setState({
          error: '',
          passwordSent: true
        });
      });
  }

  render() {
    return (
      <Modal
        id="ForgottenPassword"
        show={this.props.show}
        onHide={this.props.onHide}
        dialogClassName="resetPasswordModal"
      >
        <Modal.Body close>
          {!this.state.passwordSent && (
            <>
              <div id="resetWrap" className="accountWrap">
                <p style={{ fontSize: '20px', textAlign: 'center' }}>
                  Zabudol si heslo? Nevadí, zadaj email a pošleme ti nové.
                </p>
                {this.state.error && (
                  <p className="errorMsg">{this.state.error}</p>
                )}
                <label htmlFor="email">
                  <span>Email:</span>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="new-email"
                    style={{ marginLeft: '15px' }}
                    onBlur={e => {
                      this.handleChange(e);
                      e.preventDefault();
                    }}
                    onChange={this.handleChange}
                  />
                </label>
                <button
                  className="snpBtn"
                  onClick={this.resetPassword}
                  type="submit"
                >
                  Poslať nové heslo
                </button>
              </div>
            </>
          )}
          {this.state.passwordSent && (
            <p
              style={{ fontSize: '20px', textAlign: 'center', margin: '30px' }}
            >
              Ak má u nás <b>{this.state.email}</b> účet. Zaslali sme mu email s
              novým heslom.
            </p>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}

export default ForgottenPassword;
