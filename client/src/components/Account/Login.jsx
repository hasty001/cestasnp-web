import React from 'react';

import auth from '../../helpers/firebase';
import ForgottenPassword from './ForgottenPassword';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      showBox: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleForgottenPasswordBox = this.handleForgottenPasswordBox.bind(
      this
    );
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleLogin() {
    const { email, password } = this.state;
    auth
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (!user.emailVerified) {
          this.setState({
            error:
              'Účet ešte nie je potvrdený. Po registrácii sme ti zaslali email, ktorý treba otvoriť a potvrdiť. Skús pozrieť do svojej emailovej schránky. Mohlo sa stať aj že skončil v spame.'
          });
        }
      })
      .catch(() => {
        this.setState({
          error: 'Email alebo heslo nesedia. Skús ešte raz!'
        });
      });
  }

  handleForgottenPasswordBox(open) {
    this.setState({
      showBox: open
    });
  }

  render() {
    return (
      <>
        <div className="accountWrap">
        <p>
            Ak sa chceš zúčastniť LIVE Sledovania alebo prispievať k obsahu webu, vytvor si prosím účet a
            prihlás sa na tejto stránke.
          </p>
          <p>
            Tento účet slúži <b>najmä pre zasielanie správ</b> do LIVE Sledovanie, ale aj pre možnosť pridať dôležité miesta a
            komentovať LIVE Sledovanie bez ďalšieho overenia.
          </p>
        </div>
        <form
          className="accountWrap"
          onSubmit={e => {
            this.handleLogin();
            e.preventDefault();
          }}
        >
          <h2>Prihlásiť sa</h2>
          {this.state.error && <p className="errorMsg">{this.state.error}</p>}
          <label htmlFor="email">
            <span>Email:</span>
            <input
              type="email"
              id="login-email"
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
              id="login-password"
              name="password"
              autoComplete="new-password"
              onBlur={e => {
                this.handleChange(e);
                e.preventDefault();
              }}
              onChange={this.handleChange}
            />
          </label>
          <button
            type="button"
            className="linkLikeButton"
            onClick={() => {
              this.handleForgottenPasswordBox(true);
            }}
          >
            Zabudol si heslo?
          </button>
          <button className="snpBtn" onClick={this.handleLogin} type="submit">
            Prihlásiť
          </button>
        </form>

        <ForgottenPassword
          show={this.state.showBox}
          onHide={() => this.handleForgottenPasswordBox(false)}
        />
      </>
    );
  }
}

export default Login;
