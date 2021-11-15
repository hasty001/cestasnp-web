import React from 'react';

import VerificationSent from './VerificationSent';

import auth from '../../helpers/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      verificationSent: 0,
      error: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleRegister() {
    const { name, email, password, passwordConfirmation } = this.state;

    if (!name || name.trim().length === 0) {
      this.setState({
        error: 'Zabudol si na meno!'
      });
      return;
    }

    if (password !== passwordConfirmation) {
      this.setState({
        error: 'Heslá nie sú rovnaké. Skús ešte raz!'
      });
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        const user = auth.currentUser;
        auth.languageCode = 'sk';
        updateProfile(user, {
          displayName: name
        });
        sendEmailVerification(user);
        auth.signOut();
        this.setState({
          verificationSent: 1
        });
      })
      .catch(error => {
        switch (error.code) {
          case 'auth/invalid-email':
            this.setState({
              error: 'Email má nesprávny formát. Skús ešte raz!'
            });
            break;
          case 'auth/email-already-in-use':
            this.setState({
              error: 'Skús iný email, s týmto to nepôjde.'
            });
            break;
          case 'auth/weak-password':
            this.setState({
              error: 'Máš slabé heslo. Minimálne 6 znakov.'
            });
            break;
          default:
            this.setState({
              error: 'Účet sa nepodarilo vytvoriť. Skús neskôr.'
            });
            break;
        }
      });
  }

  render() {
    return (
      <>
        {this.state.verificationSent ? (
          <VerificationSent email={this.state.email} />
        ) : (
          <form
            className="accountWrap"
            onSubmit={e => {
              this.handleRegister();
              e.preventDefault();
            }}
          >
            <h2>Vytvoriť si účet</h2>
            {this.state.error && <p className="errorMsg">{this.state.error}</p>}
            <label htmlFor="name">
              <span>Meno:</span>
              <input
                type="name"
                id="name"
                name="name"
                onBlur={e => {
                  this.handleChange(e);
                  e.preventDefault();
                }}
                onChange={this.handleChange}
              />
            </label>
            <label htmlFor="email">
              <span>Email:</span>
              <input
                type="email"
                id="reg-email"
                name="email"
                autoComplete="new-email"
                onBlur={e => {
                  this.handleChange(e);
                  e.preventDefault();
                }}
                onChange={this.handleChange}
              />
            </label>
            <label htmlFor="password">
              <span>Heslo:</span>
              <input
                type="password"
                id="reg-password"
                name="password"
                autoComplete="new-password"
                onBlur={e => {
                  this.handleChange(e);
                  e.preventDefault();
                }}
                onChange={this.handleChange}
              />
            </label>
            <label htmlFor="passwordConfirmation">
              <span>Potvrď heslo:</span>
              <input
                type="password"
                id="passwordConfirmation"
                name="passwordConfirmation"
                onBlur={e => {
                  this.handleChange(e);
                  e.preventDefault();
                }}
                onChange={this.handleChange}
              />
            </label>

            <button
              className="snpBtn"
              onClick={this.handleRegister}
              type="submit"
            >
              Vytvoriť účet
            </button>
          </form>
        )}
      </>
    );
  }
}

export default Register;
