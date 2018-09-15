import React from 'react';
import { Router, Switch, Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';

import Navigation from './components/Navigation';
import Archive from './components/Archive';
import Kontakt from './components/Kontakt';
import NotFound from './reusable_components/NotFound';
import Home from './components/Home';
import Articles from './components/Articles';
import Article from './components/Article';
import Pois from './components/Pois';
import Traveller from './components/Traveller';
import Active from './components/Active';

import websupport from '../public/img/websupport.png';

const history = createHistory();

const CestaSNP = () => (
  <div className="app">
    <div className="app-header">
      <Navigation />
    </div>
    <div className="app-body">
      <div className="content-wrap">
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/pred/articles/article/:articleId" component={Article} />
            <Route path="/pred/filteredarticles/:category/:page" component={Articles} />
            <Route path="/pred/articles/:page" component={Articles} />
            <Route exact path="/pred/pois" component={Pois} />
            <Route exact path="/na/ceste" component={Active} />
            <Route exact path="/na/archive" component={Archive} />
            <Route path="/na/:traveller" component={Traveller} />
            <Route exact path="/kontakt" component={Kontakt} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Router>
      </div>
      <div className="app-footer">
        <img src={websupport} alt="logo sponzora" className="sponzor" />
      </div>
    </div>
  </div>
);

export default CestaSNP;
