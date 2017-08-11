import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to CestaSNP.sk v4</h2>
        </div>
        <div className="App-message">
        Stay tuned for fresh new CestaSNP.sk. In the mean time use <a src="https://cestasnp.sk">CestaSNP.sk v3</a>
        </div>
      </div>
    );
  }
}

export default App;