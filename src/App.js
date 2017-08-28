import React, { Component } from 'react';
import logo from './img/logo.png';
// import './App.css';
import Navigation from './components/Navigation';

class App extends Component {
  render() {
    let navigation = <Navigation/>;

    return (
      <div className="app">
        <div className="app-header">
          <img src={logo} className="app-logo" alt="logo" />
          {navigation}
        </div>
        <div className="app-message">
        Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a>
        </div>
      </div>
    );
  }
}

export default App;

