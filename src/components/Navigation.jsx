import React, {Component} from 'react';
import menu from '../img/menu.png';

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
        <img src={menu} className="menu-icon" alt="Menu logo"/>
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