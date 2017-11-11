import React, { Component } from 'react'
import menu from '../../public/img/menu.png'

class Navigation extends Component {
  render () {
    // DESKTOP VIEW //
    const desktopNavList =
      <div className='desktop-nav-list'>
        <a href=''>Domov</a>
        <a href=''>Pred cestou</a>
        <a href=''>Na ceste</a>
        <a href=''>Kontakt</a>
      </div>

    const desktopNav =
      <div className='desktop-nav'>
        {desktopNavList}
      </div>

    // PHONE VIEW //
    const phoneNavList =
      <div className={this.props.showHideSideNav}>
        <div className='phone-nav-list'>
          <a href=''>Domov</a>
          <a href=''>Pred cestou</a>
          <a href=''>Na ceste</a>
          <a href=''>Kontakt</a>
        </div>
      </div>

    const phoneNav =
      <div className='phone-nav'>
        <img src={menu} className='menu-icon' alt='Menu logo' onClick={this.props.toggleSideNav}/>
        {phoneNavList}
      </div>

    return (
      <div id='nav'>
        {phoneNav}
        {desktopNav}
      </div>
    )
  }
}

export default Navigation
