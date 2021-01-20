import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import NavRouterItem from './reusable/NavRouterItem'
import logo from '../../public/img/logo.svg';
import { AuthContext } from './AuthContext';
import { A } from './reusable/Navigate';
import { LocalSettingsContext } from './LocalSettingsContext';
import auth from '../helpers/firebase';

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
          {!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.ucetPois}
            eventKey={0}
            className="red-button mobile"
          >
            Prihlásiť sa             
          </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              className="mobile account-name"
            >
              {authData.userDetails.email}
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={1}
              title="Moja cesta"
              className="mobile"
            >
              Poslať správu
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={2}
              title="Pridať dôležité miesto"
              className="mobile"
            >
              Pridať dôležité miesto             
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              eventKey={3}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="mobile"
            >
              Odhlásiť             
            </NavRouterItem>)}

          <NavRouterItem
            href={ROUTES.clanky}
            eventKey={11}
            title="Články"
          >
            Pred cestou
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.pois}
            eventKey={12}
            title="Dôležité miesta"
          >
            Mapa
          </NavRouterItem>

          <NavRouterItem
            href={settingsData.activeLink.href}
            eventKey={13}
            title="LIVE sledovanie"
          >
            LIVE sledovanie
          </NavRouterItem>

          <NavRouterItem
            href={ROUTES.archiv}
            eventKey={15}
            title="Archív"
          >
            Archív
          </NavRouterItem>

          {!authData.isAuth && (
          <NavRouterItem
            href={ROUTES.ucetPois}
            eventKey={16}
            className="red-button desktop"
          >
            Prihlásiť sa             
          </NavRouterItem>)}

          {!!authData.isAuth && (
          <NavDropdown eventKey={17} title="Môj účet" id="basic-nav-dropdown" className="desktop">
            <NavRouterItem
              href="#"
              className="desktop account-name"
            >
              {authData.userDetails.email}
            </NavRouterItem>

            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={21}
              title="Moja cesta"
              className="desktop"
            >
              Poslať správu
            </NavRouterItem>          

            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={22}
              title="Pridať dôležité miesto"
              className="desktop"
            >
              Pridať dôležité miesto             
            </NavRouterItem>

            <NavRouterItem
              href="#"
              eventKey={23}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="desktop"
            >
              Odhlásiť             
            </NavRouterItem>
          </NavDropdown>)}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
