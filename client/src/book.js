import 'core-js';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'promise-polyfill';
import '../public/book.css';
import { logDev } from './helpers/logDev';
import Book from './components/Book';
import history from './helpers/history';
import { Router, Switch, Route } from 'react-router';
import NotFound from './components/reusable/NotFound';
import { faIconsRegister } from './helpers/faIcons';

// To add to window
if (!window.Promise) {
  window.Promise = Promise;
}

faIconsRegister();

logDev('Looks like we are in development mode!');

ReactDOM.render(
  <Router history={history}>
    <div className="app">
      <Switch>
        <Route path="/na/dennik/:traveller" render={(props) => (<Book {...props} />)}/>
        <Route path="*" component={NotFound} />
      </Switch>
    </div>
  </Router>, document.getElementById('root'));
