import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'promise-polyfill';
import URLSearchParams from 'url-search-params-polyfill';
import findIndex from 'array.prototype.findindex';
import assign from 'object.assign';
import CestaSNP from './CestaSNP';
import '../public/index.css';

// To add to window
if (!window.Promise) {
  window.Promise = Promise;
}

if (!window.URLSearchParams) {
  window.URLSearchParams = URLSearchParams;
}

if (!Array.findIndex) {
  findIndex.shim();
}

if (!Object.assign) {
  assign.shim();
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

ReactDOM.render(<CestaSNP />, document.getElementById('root'));
