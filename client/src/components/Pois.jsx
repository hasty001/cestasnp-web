import React, { Component } from 'react'
import Map from './Map'
import Loader from './Loader'

class Pois extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      pois: []
    }
  }

  componentDidMount () {
    fetch('/api/pois')
    .then((resp) => resp.json())
    .then((data) => {
      this.setState({
        pois: data,
        loading: false
      })
    })
  }

  render () {
    return (
      <div id='map-container'>
        {this.state.loading &&
        <Loader />}
        {!this.state.loading &&
        <div>
          <Map pois={this.state.pois} />
          {this.state.pois.map((poi, i) => {
            return (
              <div key={i}>
                {/* {console.log(poi)} */}
              </div>
            )
          })}
        </div>}
      </div>
    )
  }
}

export default Pois
