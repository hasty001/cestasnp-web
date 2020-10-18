import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown, NavItem } from 'react-bootstrap';
import history from '../helpers/history';
import logo_screen from '../../public/img/logo_screen.png';
import logo_mobile from '../../public/img/logo_mobile.png';
import { AuthContext } from './AuthContext';

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles/1',
  pois: '/pred/pois',
  itinerary: '/pred/itinerar',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  kontakt: '/kontakt',
  mojaCesta: '/ucet'
};

const Navigation = () => {
  const authData = useContext(AuthContext);
  return (
    <Navbar inverse collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <div
            title="Domov"
            className="logo-position-mobile"
            onClick={() => {
              history.push(ROUTES.domov);
            }}
          >
            <img
              src={logo_mobile}
              className="logo-mobile"
              alt="Cesta SNP logo pre mobil"
            />
          </div>
          <div
            title="Domov"
            className="logo-position-screen"
            onClick={() => {
              history.push(ROUTES.domov);
            }}
          >
            <img
              src={logo_screen}
              className="logo-screen"
              alt="Cesta SNP logo pre obrazovku"
            />
          </div>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <NavItem
            eventKey={1}
            title="Domov"
            onClick={() => {
              history.push(ROUTES.domov);
            }}
          >
            Domov
          </NavItem>

          <NavDropdown eventKey={2} title="Pred cestou" id="basic-nav-dropdown">
            <NavItem
              eventKey={2.1}
              title="Články"
              onClick={() => {
                history.push(ROUTES.clanky);
              }}
            >
              Články
            </NavItem>
            <NavItem
              eventKey={2.2}
              title="Dôležité miesta"
              onClick={() => {
                history.push(ROUTES.pois);
              }}
            >
              Dôležité miesta
            </NavItem>
            <NavItem
              eventKey={2.3}
              title="Itinerár"
              onClick={() => {
                history.push(ROUTES.itinerary);
              }}
            >
              Itinerár
            </NavItem>
          </NavDropdown>

          <NavItem
            eventKey={3}
            title="LIVE sledovanie"
            onClick={() => {
              history.push(ROUTES.naCeste);
            }}
          >
            LIVE sledovanie
          </NavItem>

          <NavItem
            eventKey={5}
            title="Archív"
            onClick={() => {
              history.push(ROUTES.archiv);
            }}
          >
            Archív
          </NavItem>

          <NavItem
            eventKey={6}
            title="Kontakt"
            onClick={() => {
              history.push(ROUTES.kontakt);
            }}
          >
            Kontakt
          </NavItem>

          <NavItem
            eventKey={4}
            title="Moja cesta"
            onClick={() => {
              history.push(ROUTES.mojaCesta);
            }}
          >
            {!authData.isAuth ? 'Prihlásiť sa' : 'Poslať správu'}
          </NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
