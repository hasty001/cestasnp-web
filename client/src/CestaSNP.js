import React, { Component } from 'react';
import { Router, Switch, Route } from 'react-router';

import LogRocket from 'logrocket';
import history from './helpers/history';

import Navigation from './components/Navigation';
import Archive from './components/Archive';
import Kontakt from './components/Kontakt';
import NotFound from './components/reusable/NotFound';
import Home from './components/Home';
import Articles from './components/Articles';
import Article from './components/Article';
import Pois from './components/Pois';
import Itinerary from './components/Itinerary';
import Traveller from './components/Traveller';
import Active from './components/Active';
import ActiveLight from './components/ActiveLight';
import Cookies from './components/Cookies';
import Account from './components/Account/index';
import { AuthProvider } from './components/AuthContext';

LogRocket.init('2szgtb/cestasnp-web');

class CestaSNP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fillContent: false,
      scrollTop: 0,
    };

    this.handleScroll = this.handleScroll.bind(this);
  }

  removeListener = null;

  pathChanged(path) {
    const newState = (path == "/na/ceste" || path == "/pred/pois");
      
    if (this.state.fillContent != newState)
      this.setState({
        fillContent: newState
      });
  }

  componentDidMount() {
    this.pathChanged(window.location.pathname);

    this.removeListener = history.listen((params) => {
      this.pathChanged(params.pathname);
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  handleScroll(event) {
    const scrollTop = event.target.scrollTop;
    if (scrollTop != this.state.scrollTop)
      this.setState({ scrollTop: event.target.scrollTop });
  }

  render() {
    return (
  <div className="app">
    <AuthProvider>
      <div className="app-header">
        <Navigation />
      </div>
      <div className="app-body" onScroll={this.handleScroll}>
        <div className={this.state.fillContent ? "content-fill" : "content-wrap"}>
          <Router history={history}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route
                path="/pred/articles/article/:articleId"
                component={Article}
              />
              <Route
                path="/pred/filteredarticles/:category/:page"
                component={Articles}
              />
              <Route path="/pred/articles/:page" component={Articles} />
              <Route exact path="/pred/pois" component={Pois} />
              <Route exact path="/pred/itinerar" component={Itinerary} />
              <Route exact path="/na/ceste" component={Active} />
              <Route exact path="/na/ceste/light" component={ActiveLight} />
              <Route exact path="/na/archive" component={Archive} />
              <Route path="/na/:traveller" render={(props) => (<Traveller {...props} scrollTop={this.state.scrollTop} />)}/>
              <Route exact path="/kontakt" component={Kontakt} />
              <Route exact path="/cookies" component={Cookies} />
              <Route exact path="/ucet" component={Account} />
              <Route path="*" component={NotFound} />
            </Switch>
          </Router>
        </div>
      </div>
    </AuthProvider>
  </div>
  );}
}

export default CestaSNP;
