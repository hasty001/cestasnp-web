import React from 'react';
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
import Traveller from './components/Traveller';
import Active from './components/Active';
import ActiveLight from './components/ActiveLight';
import Cookies from './components/Cookies';
import Account from './components/Account/index';
import { AuthProvider } from './components/AuthContext';

LogRocket.init('2szgtb/cestasnp-web');

const CestaSNP = () => (
  <div className="app">
    <AuthProvider>
      <div className="app-header">
        <Navigation />
      </div>
      <div className="app-body">
        <div className="content-wrap">
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
              <Route exact path="/na/ceste" component={Active} />
              <Route exact path="/na/ceste/light" component={ActiveLight} />
              <Route exact path="/na/archive" component={Archive} />
              <Route path="/na/:traveller" component={Traveller} />
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
);

export default CestaSNP;
