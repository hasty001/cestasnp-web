import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import NavRouterItem from './reusable/NavRouterItem'
import logo from '../../public/img/logo.svg';
import { AuthContext } from './AuthContext';
import { A } from './reusable/Navigate';
import { LocalSettingsContext } from './LocalSettingsContext';

const ROUTES = {
  domov: '/',
  predCestou: '/pred',
  clanky: '/pred/articles/1',
  pois: '/pred/pois',
  itinerary: '/pred/itinerar',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  kontakt: '/kontakt',
  mojaCesta: '/ucet',
  pridatPOI: '/ucet/pridatpoi',
  ucetPois: '/ucet/pois'
};

const Navigation = () => {
  const authData = useContext(AuthContext);
  const settingsData = useContext(LocalSettingsContext);
  return (
    <Navbar inverse collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <A href={ROUTES.domov}>
            <div
              title="Domov"
              className="logo-position-mobile"
            >
              <img
                src={logo}
                className="logo-mobile"
                alt="Cesta SNP logo pre mobil"
              />
            </div>
            <div
              title="Domov"
              className="logo-position-screen"
            >
              <img
                src={logo}
                className="logo-screen"
                alt="Cesta SNP logo pre obrazovku"
              />
            </div>
          </A>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight className={!authData.isAuth ? "not-auth" : "auth"}>
          <NavDropdown eventKey={2} title="Pred cestou" id="basic-nav-dropdown">
            <NavRouterItem
              href={ROUTES.clanky}
              eventKey={2.1}
              title="Články"
            >
              Články
            </NavRouterItem>
            <NavRouterItem
              href={ROUTES.pois}
              eventKey={2.2}
              title="Dôležité miesta"
            >
              Dôležité miesta
            </NavRouterItem>
            <NavRouterItem
              href={ROUTES.itinerary}
              eventKey={2.3}
              title="Itinerár"
            >
              Itinerár
            </NavRouterItem>
          </NavDropdown>

          <NavRouterItem
            href={settingsData.activeLink.href}
            eventKey={3}
            title="LIVE sledovanie"
          >
            LIVE sledovanie
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.archiv}
            eventKey={5}
            title="Archív"
          >
            Archív
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.kontakt}
            eventKey={6}
            title="Kontakt"
          >
            Kontakt
          </NavRouterItem>

          {!!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.mojaCesta}
            eventKey={4}
            title="Moja cesta"
          >
            {!authData.isAuth ? 'Prihlásiť sa' : 'Poslať správu'}
          </NavRouterItem>          
          )}

          {!!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.pridatPOI}
            eventKey={5}
            title="Pridať dôležité miesto"
          >
            {!authData.isAuth ? 'Prihlásiť sa' : 'Pridať dôležité miesto'}             
          </NavRouterItem>
          )}

          {!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.ucetPois}
            eventKey={6}
            className="red-button"
          >
            Prihlásiť sa             
          </NavRouterItem>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
