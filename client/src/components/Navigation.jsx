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
  hladamPartakov: '/pred/hladampartakov',
  naCeste: '/na/ceste',
  archiv: '/na/archive',
  hladanie: '/hladanie',
  kontakt: '/kontakt',
  mojaCesta: '/ucet',
  poslatSpravu: '/ucet/poslatspravu',
  pridatPOI: '/ucet/pridatpoi',
  pridatClanok: '/ucet/pridatclanok',
  ucetPois: '/ucet/pois',
  ucetHladamPartakov: '/ucet/hladampartakov',
  zmeny: '/ucet/zmeny',
};

const Navigation = () => {
  const authData = useContext(AuthContext);
  const settingsData = useContext(LocalSettingsContext);
  const isTraveler = authData.travellerDetails &&
    Object.keys(authData.travellerDetails).length > 0;

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

          {!!authData.isAuth && !isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={1}
              title="Založiť LIVE Sledovanie"
              className="mobile"
            >
              Založiť LIVE Sledovanie
            </NavRouterItem>)}

          {!!authData.isAuth && isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={1}
              title="Moja cesta"
              className="mobile"
            >
              Moja cesta
            </NavRouterItem>)}

          {!!authData.isAuth && isTraveler && (
            <NavRouterItem
              href={ROUTES.poslatSpravu}
              eventKey={2}
              title="Poslať správu"
              className="mobile"
            >
              Poslať správu
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={3}
              title="Pridať dôležité miesto"
              className="mobile"
            >
              Pridať dôležité miesto             
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.pridatClanok}
              eventKey={4}
              title="Pridať článok"
              className="mobile"
            >
              Pridať článok           
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href={ROUTES.ucetHladamPartakov}
              eventKey={5}
              title="Hľadám parťákov"
              className="mobile"
            >
              Hľadám parťákov           
            </NavRouterItem>)}

          {!!authData.isAuth && !!authData.userDetails && authData.userDetails.articlesRole == 'admin' && (
            <NavRouterItem
              href={ROUTES.zmeny}
              eventKey={6}
              title="Prehľad zmien"
              className="mobile"
            >
              Prehľad zmien           
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              eventKey={7}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="mobile"
            >
              Odhlásiť             
            </NavRouterItem>)}

          {!!authData.isAuth && (
            <NavRouterItem
              href="#"
              className="line-divider mobile"
            >           
              <hr/>
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
            href={ROUTES.hladamPartakov}
            eventKey={14}
            title="Hľadám parťákov"
          >
            Hľadám parťákov
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

          {!isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={20}
              title="Založiť LIVE Sledovanie"
              className="desktop"
            >
              Založiť LIVE Sledovanie
            </NavRouterItem>)}

          {isTraveler && (
            <NavRouterItem
              href={ROUTES.mojaCesta}
              eventKey={20}
              title="Moja cesta"
              className="desktop"
            >
              Moja cesta
            </NavRouterItem>)}

          {isTraveler && (
            <NavRouterItem
              href={ROUTES.poslatSpravu}
              eventKey={21}
              title="Poslať správu z cesty"
              className="desktop"
            >
              Poslať správu z cesty
            </NavRouterItem>)}          

            <NavRouterItem
              href={ROUTES.pridatPOI}
              eventKey={22}
              title="Pridať dôležité miesto"
              className="desktop"
            >
              Pridať dôležité miesto             
            </NavRouterItem>

            <NavRouterItem
              href={ROUTES.pridatClanok}
              eventKey={23}
              title="Pridať článok"
              className="desktop"
            >
              Pridať článok           
            </NavRouterItem>

            <NavRouterItem
              href={ROUTES.ucetHladamPartakov}
              eventKey={24}
              title="Hľadám parťákov"
              className="desktop"
            >
              Hľadám parťákov           
            </NavRouterItem>

            {!!authData.userDetails && authData.userDetails.articlesRole == 'admin' && <NavRouterItem
              href={ROUTES.zmeny}
              eventKey={25}
              title="Prehľad zmien"
              className="desktop"
            >
              Prehľad zmien           
            </NavRouterItem>}

            <NavRouterItem
              href="#"
              eventKey={26}
              title="Odhlásiť"
              onClick={() => auth.signOut()}
              className="desktop"
            >
              Odhlásiť             
            </NavRouterItem>
          </NavDropdown>)}

          <NavRouterItem
              href={ROUTES.hladanie}
              eventKey={30}
              title="Hľadanie"
              className="desktop"
            >
              <i className="fas fa-search"></i>         
          </NavRouterItem>

          <NavRouterItem
              href={ROUTES.hladanie}
              eventKey={3}
              title="Hľadanie"
              className="mobile"
            >
              Hľadanie
          </NavRouterItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
