import React, {Component} from 'react';

class Navigation extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="nav">
        <MediaQuery query='(max-width: 700px)'>
            <div>You also have a huge screen</div>
        </MediaQuery>
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