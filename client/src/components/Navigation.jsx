import React, { Component } from 'react'

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  naCeste: '/na',
  kontakt: '/kontakt'
}

class Navigation extends Component {
  render () {
    // DESKTOP VIEW //
    const desktopNavList =
      <div className='desktop-nav-list'>
        <a href={ROUTES.domov}>Domov</a>
        <a href={ROUTES.predCestou}>Pred cestou</a>
        <a href={ROUTES.naCeste}>Na ceste</a>
        <a href={ROUTES.kontakt}>Kontakt</a>
      </div>

    const desktopNav =
      <div className='desktop-nav'>
        {desktopNavList}
      </div>

    // PHONE VIEW //
    const phoneNavList =
      <div className={this.props.showHideSideNav}>
        <div className='phone-nav-list'>
          <a href={ROUTES.domov}>Domov</a>
          <a href={ROUTES.predCestou}>Pred cestou</a>
          <a href={ROUTES.naCeste}>Na ceste</a>
          <a href={ROUTES.kontakt}>Kontakt</a>
        </div>
      </div>

    const phoneNav =
      <div className='phone-nav'>
        <div className='menu-icon' onClick={this.props.toggleSideNav}>
          <i className='fas fa-bars' alt='Menu logo' />
        </div>
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