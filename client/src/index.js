import React from 'react';
import ReactDOM from 'react-dom';
import CestaSNP from './CestaSNP';
import '../public/index.css';

import Promise from 'promise-polyfill';

// To add to window
if (!window.Promise) {
  window.Promise = Promise;
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

ReactDOM.render(<CestaSNP />, document.getElementById('root'));
