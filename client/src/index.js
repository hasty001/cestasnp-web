import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'promise-polyfill';
import URLSearchParams from 'url-search-params-polyfill';
import findIndex from 'array.prototype.findindex';
import assign from 'object.assign';
import values from 'object.values'
import replaceAll from 'string.prototype.replaceall';
import matchAll from 'string.prototype.matchall';
import CestaSNP from './CestaSNP';
import '../public/index.css';
import promiseFinally from 'promise.prototype.finally';
import { logDev } from './helpers/logDev';
import { faIconsRegister } from './helpers/faIcons'

// To add to window
if (!window.Promise) {
  window.Promise = Promise;
}

promiseFinally.shim();

if (!window.URLSearchParams) {
  window.URLSearchParams = URLSearchParams;
}

if (!Array.findIndex) {
  findIndex.shim();
}

if (!Object.assign) {
  assign.shim();
}

if (!Object.values) {
  values.shim();
}

if (!String.replaceAll) {
  replaceAll.shim();
}

matchAll.shim();

faIconsRegister();

logDev('Looks like we are in development mode!');

ReactDOM.render(<CestaSNP />, document.getElementById('root'));
