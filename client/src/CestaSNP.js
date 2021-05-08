import React, { useEffect, useRef, useState } from 'react';
import { Router, Switch, Route } from 'react-router';

import LogRocket from 'logrocket';
import history from './helpers/history';

import Navigation from './components/Navigation';
import Archive from './components/Archive';
import Kontakt from './components/Kontakt';
import NotFound from './components/reusable/NotFound';
import Home from './components/Home';
import Articles from './components/Articles';
import Article from './components/Article';
import Pois from './components/Pois';
import PoisInTable from './components/PoisInTable';
import Poi from './components/Poi';
import Itinerary from './components/Itinerary';
import Traveller from './components/Traveller';
import Active from './components/Active';
import ActiveLight from './components/ActiveLight';
import Cookies from './components/Cookies';
import Account from './components/Account/index';
import { AuthProvider } from './components/AuthContext';
import DocumentTitle from 'react-document-title';
import * as Constants from './components/Constants';
import SiteFooter from './components/SiteFooter';
import ActivePhotos from './components/ActivePhotos';
import { LocalSettingsProvider } from './components/LocalSettingsContext';
import ArticleHistory from './components/ArticleHistory';
import EditArticle from './components/Account/EditArticle';

LogRocket.init('2szgtb/cestasnp-web');

const CestaSNP = props => {
  const [fillContent, setFillContent] = useState(false);
  const prevFillContent = useRef(false);
  const prevPath = useRef('');
  
  const appBodyRef = useRef();

  const pathChanged = path => {
    if (path != prevPath.current && appBodyRef.current) {
      if (appBodyRef.current.scrollTo) {
        appBodyRef.current.scrollTo(0, 0);
      } else {
        appBodyRef.current.scrollTop = 0;
        appBodyRef.current.scrollLeft = 0;
      }
    }
    prevPath.current = path;

    const newState = 
      (path == "/na/ceste" || path == "/pred/pois" || path == "/na/ceste/fotky") ||
      (path == "/na/ceste/" || path == "/pred/pois/" || path == "/na/ceste/fotky/");
      
    if (prevFillContent.current != newState) {
      prevFillContent.current = newState;
      setFillContent(newState);
    }
  }

  pathChanged(window.location.pathname);

  useEffect(() => {
    pathChanged(window.location.pathname);

    const listener = history.listen((params) => {
      pathChanged(params.pathname);
    });

    return () => listener();
  }, []);

  return (
  <AuthProvider>
    <LocalSettingsProvider>
    <DocumentTitle title={Constants.WebTitle}>
    <Router history={history}>
      <div className="app">
        <div className="app-header" data-nosnippet>
          <Navigation />
        </div>
        <div className="app-body" ref={appBodyRef}>
          <div className={fillContent ? "content-fill" : "content-wrap"}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route
                path="/pred/articles/article/:articleId/historia"
                component={ArticleHistory}
              />
              <Route
                path="/pred/articles/article/:articleId/upravit"
                component={EditArticle}
              />
              <Route
                path="/pred/articles/article/:articleId"
                component={Article}
              />
              <Route
                path="/pred/filteredarticles/:category/:page"
                component={Articles}
              />
              <Route path="/pred/articles/:page" component={Articles} />
              <Route exact path="/pred/pois/tabulka" component={PoisInTable} />
              <Route path="/pred/pois/:poi" component={Poi} />
              <Route exact path="/pred/pois" component={Pois} />
              <Route exact path="/pred/itinerar" component={Itinerary} />
              <Route exact path="/na/ceste" component={Active} />
              <Route exact path="/na/ceste/light" component={ActiveLight} />
              <Route exact path="/na/ceste/fotky" component={ActivePhotos} />
              <Route exact path="/na/archive" component={Archive} />
              <Route path="/na/:traveller" render={(props) => (<Traveller {...props} />)}/>
              <Route exact path="/kontakt" component={Kontakt} />
              <Route exact path="/cookies" component={Cookies} />
              <Route exact path="/ucet" render={(props) => (<Account {...props} />)}/>
              <Route exact path="/ucet/poslatspravu" render={(props) => (<Account {...props} sendMessage/>)}/>
              <Route exact path="/ucet/pridatpoi" render={(props) => (<Account {...props} addPoi />)} />
              <Route exact path="/ucet/pridatclanok" render={(props) => (<Account {...props} addArticle />)} />
              <Route exact path="/ucet/pois" render={(props) => (<Account {...props} pois />)} />
              <Route exact path="/ucet/zmeny" render={(props) => (<Account {...props} changes />)} />
              <Route path="*" component={NotFound} />
            </Switch>
            {!fillContent && <SiteFooter/>}
          </div>
        </div>
      </div>
    </Router>
    </DocumentTitle>
    </LocalSettingsProvider>
  </AuthProvider>
  );
}

export default CestaSNP;
