import React from 'react';
import { fetchPostJsonWithToken } from '../helpers/fetchUtils';
import auth from '../helpers/firebase';

export const AuthContext = React.createContext({
  isAuth: 0,
  user: null,
  userDetails: {},
  travellerDetails: {},
  findBuddies: {},
  authProviderMounted: 0,
  updateTravellerDetails: () => {},
  updateUserDetails: () => {},
  updateFindBuddies: () => {}
});

export class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: 0,
      user: null,
      userDetails: {},
      travellerDetails: {},
      findBuddies: {},
      authProviderMounted: 0,
      updateTravellerDetails: this.updateTravellerDetails.bind(this),
      updateUserDetails: this.updateUserDetails.bind(this),
      updateFindBuddies: this.updateFindBuddies.bind(this)
    };
  }

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        this.userMongoCheck(user);
      } else {
        if (user) {
          auth.signOut();
        }

        this.setState({
          isAuth: 0,
          user: null,
          userDetails: {},
          travellerDetails: {},
          findBuddies: {},
          authProviderMounted: 1
        });
      } 
    });
  }

  userMongoCheck(user) {
    fetchPostJsonWithToken(user, '/api/traveller/userCheck', {
      email: user.email,
      name: user.displayName,
      uid: user.uid
    })
    .then(r => {
      if (r.error) {
        throw r.error; 
      } else { 
        return r; 
      }})
    .then(({ userDetails, travellerDetails, findBuddies }) => {
      this.setState({
        isAuth: 1,
        user,
        userDetails,
        travellerDetails,
        findBuddies,
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
        findBuddies: {},
        authProviderMounted: 1
      });
    });
  }

  updateTravellerDetails(details) {
    this.setState({
      travellerDetails: details
    });
  }

  updateUserDetails(details) {
    this.setState({
      userDetails: details
    });
  }

  updateFindBuddies(data) {
    this.setState({
      findBuddies: data || {}
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
