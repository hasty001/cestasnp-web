import React, {Component} from 'react';

class Navigation extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="navigation">
        <ul>
          <li>Domov</li>
          <li>Pred cestou</li>
          <li>Na ceste</li>
          <li>Kontakt</li>
        </ul>
      </div>
    ) 
  }

}

export default Navigation