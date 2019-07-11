import React, { Fragment } from 'react'

import Login from './Login'
import Register from './Register'

class NotLoggedIn extends React.Component {

    render() {
        return (
          <Fragment>
            <Login />
            <hr></hr>
            <Register />
          </Fragment>
        )
    }
}

export default NotLoggedIn