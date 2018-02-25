import React, { Component } from 'react';
import Pois from './Pois';
import Articles from './Articles';

export const RENDER_OPTIONS = {
  ARTICLES: 'articles',
  POIS: 'pois',
  NONE: 'none'
};

class Pred extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: RENDER_OPTIONS.NONE
    };

    this.handleShowChoice = this.handleShowChoice.bind(this);
  }

  handleShowChoice(e) {
    e.preventDefault();
    let showChoice = e.target.value;
    this.setState({ show: showChoice });
  }

  render() {
    return (
      <div id="pred-container">
        <h1>tu pride info pred cestou</h1>
        <button value={RENDER_OPTIONS.ARTICLES} onClick={this.handleShowChoice}>
          articles
        </button>
        <button value={RENDER_OPTIONS.POIS} onClick={this.handleShowChoice}>
          pois
        </button>
        {this.state.show === RENDER_OPTIONS.POIS && <Pois />}
        {this.state.show === RENDER_OPTIONS.ARTICLES && <Articles />}
      </div>
    );
  }
}

export default Pred;
