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
        Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a>
        </div>
      </div>
    );
  }
}

export default App;