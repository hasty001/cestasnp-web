import React from 'react'
import ReactDOM from 'react-dom'
import CestaSNP from './CestaSNP'
import '../public/index.css'

import Promise from 'promise-polyfill'

// To add to window
if (!window.Promise) {
  window.Promise = Promise
}

ReactDOM.render(<CestaSNP />, document.getElementById('root'))
