import React, { Component } from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import logo from '../../public/img/logo.png'

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles',
  pois: '/pred/pois',
  naCeste: '/na',
  kontakt: '/kontakt'
}

class Navigation extends Component {

  render () {
    let divStyle = {
      backgroungColor: 'white',
      color: 'white'
    }

    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='/'>
              <img src={logo} className='app-logo' alt='Cesta SNP logo' />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse className='navigacka'>
          <Nav pullRight>
            <MenuItem eventKey={1} style={divStyle} title='Domov' href={ROUTES.domov}>Domov</MenuItem>
            <NavDropdown eventKey={2} title='Pred cestou' id='basic-nav-dropdown'>
              <MenuItem eventKey={2.1} href={ROUTES.clanky}>Články</MenuItem>
              <MenuItem eventKey={2.2} href={ROUTES.pois}>Dôležité miesta</MenuItem>
            </NavDropdown>
            <MenuItem eventKey={3} href={ROUTES.naCeste}>Na ceste</MenuItem>
            <MenuItem eventKey={4} href={ROUTES.kontakt}>Kontakt</MenuItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default Navigation
