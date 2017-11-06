import React, { Component } from 'react';
import logo from './img/logo.png';
// import './App.css';
import NavigationComponent from './components/NavigationComponent';
import MapComponent from './components/MapComponent';

class App extends Component {
  constructor(props){
    super(props)
    
    this.state={
      showHideSideNav: "hiddenSideNav"
    }

    this.toggleSideNav = this.toggleSideNav.bind(this)
    
  }
  
  render() {

    return (
      <div className="app">
        <div className="app-header">
          <img src={logo} className="app-logo" alt="Cesta SNP logo" />
          <NavigationComponent
            showHideSideNav = {this.state.showHideSideNav}
            toggleSideNav = {this.toggleSideNav}
          />
        </div>
        <div className="app-body">
          <MapComponent/>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
          <p>Stay tuned for the fresh and new CestaSNP.sk. In the mean time use current version (v3) of <a href="https://cestasnp.sk">CestaSNP.sk</a></p>
        </div>
      </div>
    );
  }

  toggleSideNav() {
    console.log("Clicked on menu button");
    const showHideSideNav = (this.state.showHideSideNav === "hiddenSideNav") ? "shownSideNav" : "hiddenSideNav";
    this.setState({ showHideSideNav: showHideSideNav });
  }
}

export default App;