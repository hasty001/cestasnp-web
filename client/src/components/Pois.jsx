import React, { Component } from 'react'
import Map from './Map'

class Pois extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      pois: []
    }
  }

  componentDidMount () {
    fetch('https://cestasnp-web.herokuapp.com/api/pois')
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
      <div className='screen-container'>
        {this.state.loading &&
        <div>
          <i className='fas fa-spinner fa-spin fa-2x' />
          <span className='sr-only'>Loading...</span>
        </div>}
        {!this.state.loading &&
        <div>
          <Map pois={this.state.pois} />
          {this.state.pois.map((poi, i) => {
            return (
              <div key={i}>
                {console.log(poi)}
              </div>
            )
          })}
        </div>}
      </div>
    )
  }
}

export default Pois
