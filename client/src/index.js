import 'core-js';
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'promise-polyfill';
import CestaSNP from './CestaSNP';
import '../public/index.css';
import { logDev } from './helpers/logDev';
import { faIconsRegister } from './helpers/faIcons';

// To add to window
if (!window.Promise) {
  window.Promise = Promise;
}

faIconsRegister();

logDev('Looks like we are in development mode!');

ReactDOM.render(<CestaSNP />, document.getElementById('root'));
