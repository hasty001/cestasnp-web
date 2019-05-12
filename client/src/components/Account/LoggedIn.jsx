import React, { Fragment } from 'react'

import { auth } from '../../helpers/firebase'

import FanAccount from './FanAccount'
import TravellerAccount from './TravellerAccount'

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
          {Object.keys(this.props.userData.travellerDetails).length > 0 
            ? 
            <TravellerAccount traveller={this.props.userData}/>
            :
            <FanAccount fan={this.props.userData}/>}
          <button className="snpBtn" style={{
            display: 'block',
            margin: '15px auto',
          }} onClick={this.handleSignOut} type="submit">Odhlásiť</button>
        </ Fragment>
      )
  }
}

export default LoggedIn