import React from 'react';

import { auth } from '../helpers/firebase'

export let AuthContext = React.createContext({
    isAuth: 0,
    user: null,
    userDetails: {},
    travellerDetails: {},
});

export class AuthProvider extends React.Component {

    state = {
        isAuth: 0,
        user: null,
        userDetails: {},
        travellerDetails: {},
    }

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            console.log('auth changed', user)
            if (user && user.emailVerified) {
                this.userMongoCheck(user)
            } else {
                this.setState({
                    isAuth: 0,
                    user: null,
                    userDetails: {},
                    travellerDetails: {},
                })
            }
        })
    }
  
    userMongoCheck(user) {
        fetch('/api/traveller/userCheck', {
            method: 'POST',
            body: JSON.stringify({
                email: user.email,
                name: user.displayName,
                uid: user.uid,
            }),
            headers: new Headers({
              'Content-Type': 'application/json',
            }),
        })
        .then(res => res.json())
        .then(({ userDetails, travellerDetails }) => {
            console.log('userDetails ', userDetails);
            console.log('travellerDetails ', travellerDetails);
            this.setState({
                isAuth: 1,
                user,
                userDetails,
                travellerDetails,
            })
        })
        .catch(e => {
            console.error('error ', e);
            let loggedUser = auth.currentUser
            if (loggedUser) {
                auth.signOut()
            }
            this.setState({
                isAuth: 0,
                user: null,
                userDetails: {},
                travellerDetails: {},
            })
        })
    }


    render(){
        return(
            <AuthContext.Provider value={{ ...this.state }}>
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}

export const AuthConsumer = AuthContext.Consumer;
