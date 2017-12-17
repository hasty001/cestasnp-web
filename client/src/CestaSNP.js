import React, { Component } from 'react'
import { Router, Switch, Route } from 'react-router'
import createHistory from 'history/createBrowserHistory'

import Navigation from './components/Navigation'
import Na from './components/Na'
import Pred from './components/Pred'
import Kontakt from './components/Kontakt'
import NotFound from './components/NotFound'
import Home from './components/Home'
import Articles from './components/Articles'
import Article from './components/Article'
import Pois from './components/Pois'

import '../public/index.css'

const history = createHistory()

class CestaSNP extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className='app'>
        <div className='app-header'>
          <Navigation />
        </div>
        <div className='app-body'>
          <Router history={history}>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/pred/' component={Pred} />
              <Route exact path='/na' component={Na} />
              <Route exact path='/kontakt' component={Kontakt} />
              <Route exact path='/pred/articles' component={Articles} />
              <Route path='/pred/articles/:articleId' component={Article} />
              <Route exact path='/pred/pois' component={Pois} />
              <Route path='*' component={NotFound} />
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
