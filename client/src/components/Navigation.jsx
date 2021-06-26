import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import NavRouterItem from './reusable/NavRouterItem'
import logo from '../../public/img/logo.svg';
import { AuthContext } from './AuthContext';
import { A } from './reusable/Navigate';
import { LocalSettingsContext } from './LocalSettingsContext';
import auth from '../helpers/firebase';
import { fetchPostJsonWithToken } from '../helpers/fetchUtils';
import * as Constants from './Constants';
import { sortByDate } from '../helpers/helpers';

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
  const [newComments, setNewComments] = useState([]);

  const authData = useContext(AuthContext);
  const settingsData = useContext(LocalSettingsContext);
  const isTraveler = authData.travellerDetails &&
    Object.keys(authData.travellerDetails).length > 0;
  const isFindBuddies = authData.findBuddies && authData.findBuddies.enabled;

  const checkNewComments = () => {
    fetchPostJsonWithToken(authData.user, '/api/traveller/newComments', {  
      uid: authData.userDetails.uid,
      detailsId: authData.travellerDetails ? authData.travellerDetails._id : null, 
      articleId: authData.travellerDetails ? authData.travellerDetails.articleID : 0, 
      findBuddiesId: authData.findBuddies ? authData.findBuddies._id : null,

      travellerDate: (authData.travellerDetails ? authData.travellerDetails.lastViewed : null) || Constants.NewCommentsNotificationAfter,
      findBuddiesDate: (authData.findBuddies ? authData.findBuddies.lastViewed : null) || Constants.NewCommentsNotificationAfter
    })
    .then(data => {
      if (data) {
        sortByDate(data.traveller || [], a => a.date, true);  
        sortByDate(data.findBuddies || [], a => a.date, true);  
      }

      setNewComments(data);
    })
    .catch(err => console.error(err));
  }

  useEffect(() => {
    if (isTraveler || isFindBuddies) {
      checkNewComments();
      const interval = setInterval(checkNewComments, Constants.NewCommentsNotificationPeriod);

      return () => clearInterval(interval);
    } else {
      setNewComments([]);
    }
  }, [isTraveler, isFindBuddies, authData.travellerDetails.lastViewed, authData.findBuddies.lastViewed]);

  const hasNewTravellerCommentsText =  newComments && newComments.traveller && newComments.traveller.length > 0 ?
    `nový komentár cesty od ${newComments.traveller[0].name}` : "";
  const hasNewFindBuddiesCommentsText =  newComments && newComments.findBuddies && newComments.findBuddies.length > 0 ?
    `nová odpoveď na inzerát od ${newComments.findBuddies[0].name}` : "";

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
        <Navbar.Toggle title="Menu" className={hasNewTravellerCommentsText || hasNewFindBuddiesCommentsText ? 'has-badge' : ''} />
        <NavRouterItem
          href={ROUTES.hladanie}
          eventKey={99}
          title="Hľadanie"
          className="navbar-search"
        >
          <i className="fas fa-search"></i>
        </NavRouterItem>
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

            {!!authData.isAuth && !!hasNewTravellerCommentsText && (
            <NavRouterItem
              href={`/na/${authData.travellerDetails.url_name || authData.userDetails.uid}#${newComments.traveller[0]._id}`}
              eventKey={100}
              title={hasNewTravellerCommentsText}
              className="mobile new-comments"
            >
              {hasNewTravellerCommentsText}
            </NavRouterItem>)}

            {!!authData.isAuth && !!hasNewFindBuddiesCommentsText && (
            <NavRouterItem
              href={`/pred/hladampartakov/${authData.userDetails.uid}#${newComments.findBuddies[0]._id}`}
              eventKey={101}
              title={hasNewFindBuddiesCommentsText}
              className="mobile new-comments"
            >
              {hasNewFindBuddiesCommentsText}
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
              Hľadám parťákov - môj inzerát           
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
            href={ROUTES.itinerary}
            eventKey={13}
            title="Itinerár"
            className="mobile"
          >
            Itinerár
          </NavRouterItem>

          <NavRouterItem
            href={settingsData.activeLink.href}
            eventKey={14}
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
          <NavDropdown eventKey={17} title="Môj účet" id="basic-nav-dropdown" 
            className={"desktop" + ((hasNewTravellerCommentsText || hasNewFindBuddiesCommentsText) ? ' has-badge' : '')}>
            <NavRouterItem
              href="#"
              className="desktop account-name"
            >
              {authData.userDetails.email}
            </NavRouterItem>

          {!!authData.isAuth && !!hasNewTravellerCommentsText && (
            <NavRouterItem
              href={`/na/${authData.travellerDetails.url_name || authData.userDetails.uid}#${newComments.traveller[0]._id}`}
              eventKey={200}
              title={hasNewTravellerCommentsText}
              className="desktop new-comments"
            >
              {hasNewTravellerCommentsText}
            </NavRouterItem>)}

            {!!authData.isAuth && !!hasNewFindBuddiesCommentsText && (
            <NavRouterItem
              href={`/pred/hladampartakov/${authData.userDetails.uid}#${newComments.findBuddies[0]._id}`}
              eventKey={201}
              title={hasNewFindBuddiesCommentsText}
              className="desktop new-comments"
            >
              {hasNewFindBuddiesCommentsText}
            </NavRouterItem>)}

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
              Hľadám parťákov - môj inzerát          
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
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
