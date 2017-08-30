import React, {Component} from 'react';

class Navigation extends Component {
  constructor(props) {
    super(props)
  }

  render() {

    const navList =
      <ul>
        <li>Domov</li>
        <li>Pred cestou</li>
        <li>Na ceste</li>
        <li>Kontakt</li>
      </ul>

    const phoneNav =
      <div className="phone-nav">
        <p>BurgerIconHere</p>
      </div>

    const desktopNav =
      <div className="desktop-nav">
        {navList}
      </div>

    return (
      <div id="nav">
        {phoneNav}
        {desktopNav}
      </div>
    )
  }
}

export default Navigation