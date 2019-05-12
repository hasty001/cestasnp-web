import React, { Fragment } from 'react'

import { auth } from '../../helpers/firebase'

class LoggedIn extends React.Component {
  constructor(props) {
    super(props) 
    this.state = {
    }

    this.handleSignOut=this.handleSignOut.bind(this)
  }

  handleSignOut() {
    auth.signOut()
  }

  render() {

      console.log('userD ', this.props.userData)
      
      return (
        <Fragment>
          <h1>Tu pride cela uzivatelska sekcia!</h1>
          <button className="snpBtn" onClick={this.handleSignOut} type="submit">Odhlasit</button>
        </ Fragment>
      )
  }
}

export default LoggedIn