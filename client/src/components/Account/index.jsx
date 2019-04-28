import React, { Fragment } from 'react'

import LoggedIn from './LoggedIn'
import NotLoggedIn from './NotLoggedIn'

class Account extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user: null,
            userDetails: null,
        }

        this.userMongoCheck = this.userMongoCheck.bind(this)
    }

    componentDidMount() {
        console.log('account mounted')
        firebase.auth().onAuthStateChanged(user => {
            console.log('auth changed', user)
            if (user && user.emailVerified) {
                this.userMongoCheck(user)
            } else {
                this.setState({
                    user: null,
                    userDetails: null,
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
        .then(userArray => {
            this.setState({
                user,
                userDetails: userArray[0],
            })
        })
        .catch(e => {
            console.error('error ', e);
            let loggedUser = firebase.auth().currentUser
            if (loggedUser) {
                firebase.auth().signOut()
            }
            this.setState({
                user: null,
                userDetails: null,
            })
        })
    }
    
    render() {        
        return(
            <Fragment>
                {this.state.user ? <LoggedIn /> : <NotLoggedIn />}
            </Fragment>
        )
    }
} 

export default Account