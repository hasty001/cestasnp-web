import React, { Component } from 'react'

class Pred extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pois: []
    }
  }

  render () {
    return (
      <div id='pred-container'>
        <h1>tu pride info pred cestou</h1>
        <button>articles</button>
        <button>pois</button>
      </div>
    )
  }
}

export default Pred
