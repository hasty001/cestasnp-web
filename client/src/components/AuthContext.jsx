import React from 'react';

import auth from '../helpers/firebase';

export const AuthContext = React.createContext({
  isAuth: 0,
  user: null,
  userDetails: {},
  travellerDetails: {},
  travellerMessages: [],
  authProviderMounted: 0,
  updateTravellerDetails: () => {}
});

export class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: 0,
      user: null,
      userDetails: {},
      travellerDetails: {},
      travellerMessages: [],
      authProviderMounted: 0,
      updateTravellerDetails: this.updateTravellerDetails.bind(this)
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        this.userMongoCheck(user);
      } else if (user) {
        auth.signOut();
        this.setState({
          isAuth: 0,
          user: null,
          userDetails: {},
          travellerDetails: {},
          travellerMessages: [],
          authProviderMounted: 1
        });
      } else {
        this.setState({
          isAuth: 0,
          user: null,
          userDetails: {},
          travellerDetails: {},
          travellerMessages: [],
          authProviderMounted: 1
        });
      }
    });
  }

  userMongoCheck(user) {
    fetch('/api/traveller/userCheck', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        name: user.displayName,
        uid: user.uid
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(({ userDetails, travellerDetails, travellerMessages }) => {
        this.setState({
          isAuth: 1,
          user,
          userDetails,
          travellerDetails,
          travellerMessages,
          authProviderMounted: 1
        });
      })
      .catch(e => {
        console.error('userMongoCheck error ', e);
        const loggedUser = auth.currentUser;
        if (loggedUser) {
          auth.signOut();
        }
        this.setState({
          isAuth: 0,
          user: null,
          userDetails: {},
          travellerDetails: {},
          travellerMessages: [],
          authProviderMounted: 1
        });
      });
  }

  updateTravellerDetails(details) {
    this.setState({
      travellerDetails: details
    });
  }

  render() {
    return (
      <AuthContext.Provider value={{ ...this.state }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export const AuthConsumer = AuthContext.Consumer;
