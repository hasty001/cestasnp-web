import React, { Component } from 'react';
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import logo_screen from '../../public/img/logo_screen.png';
import logo_mobile from '../../public/img/logo_mobile.png';

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles/1',
  pois: '/pred/pois',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  kontakt: '/kontakt'
};

class Navigation extends Component {
  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/" className="logo-position-mobile">
              <img src={logo_mobile} className="logo-mobile" alt="Cesta SNP logo pre mobil" />
            </a>
            <a href="/" className="logo-position-screen">
              <img src={logo_screen} className="logo-screen" alt="Cesta SNP logo pre obrazovku" />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <MenuItem eventKey={1} title="Domov" href={ROUTES.domov}>
              Domov
            </MenuItem>

            <NavDropdown eventKey={2} title="Pred cestou" id="basic-nav-dropdown">
              <MenuItem eventKey={2.1} title="Články" href={ROUTES.clanky}>
                Články
              </MenuItem>
              <MenuItem eventKey={2.2} title="Dôležité miesta" href={ROUTES.pois}>
                Dôležité miesta
              </MenuItem>
            </NavDropdown>

            <MenuItem eventKey={3} title="LIVE sledovanie" href={ROUTES.naCeste}>
              LIVE sledovanie
            </MenuItem>

            <MenuItem eventKey={4} title="Archív" href={ROUTES.archiv}>
              Archív
            </MenuItem>

            <MenuItem eventKey={5} title="Kontakt" href={ROUTES.kontakt}>
              Kontakt
            </MenuItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Navigation;
