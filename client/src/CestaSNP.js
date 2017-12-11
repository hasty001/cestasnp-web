import React, { Component } from 'react'
import { Router, Switch, Route } from 'react-router'
import createHistory from 'history/createBrowserHistory'

import Navigation from './components/Navigation'
import Na from './components/Na'
import Pred from './components/Pred'
import Kontakt from './components/Kontakt'
import NotFound from './components/NotFound'
import Home from './components/Home'

import '../public/index.css'
import logo from '../public/img/logo.png'

const history = createHistory()

class CestaSNP extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showHideSideNav: 'hiddenSideNav'
    }
    this.toggleSideNav = this.toggleSideNav.bind(this)
  }

  render () {
    return (
      <div className='app'>
        <div className='app-header'>
          <a href='/'>
            <img src={logo} className='app-logo' alt='Cesta SNP logo' />
          </a>
          <Navigation
            showHideSideNav={this.state.showHideSideNav}
            toggleSideNav={this.toggleSideNav}
          />
        </div>
        <div className='app-body'>
          <Router history={history}>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/pred/' component={Pred} />
              <Route exact path='/na' component={Na} />
              <Route exact path='/kontakt' component={Kontakt} />
              <Route component={NotFound} />
            </Switch>
          </Router>
        </div>
      </div>
    )
  }

  toggleSideNav () {
    const showHideSideNav = (this.state.showHideSideNav === 'hiddenSideNav') ? 'shownSideNav' : 'hiddenSideNav'
    this.setState({ showHideSideNav: showHideSideNav })
  }
}

export default CestaSNP
