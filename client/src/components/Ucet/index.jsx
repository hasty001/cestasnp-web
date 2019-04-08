import React, { Fragment } from 'react'

import LoggedIn from './LoggedIn'
import NotLoggedIn from './NotLoggedIn'

class Account extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            user: null
        }
    }

    componentDidMount() {
        console.log('account mounted')
        firebase.auth().onAuthStateChanged(user => {
            console.log('auth changed')
            if (user) {
                this.setState({
                    user
                })
            } else {
                this.setState({
                    user: null
                })
            }
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