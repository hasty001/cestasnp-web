import React, { Component } from 'react';
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
import Search from './components/Search';
import FindBuddies from './components/FindBuddies';
import FindBuddiesDetail from './components/FindBuddiesDetail';

LogRocket.init('2szgtb/cestasnp-web');

class CestaSNP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fillContent: false
    };

    this.appBodyRef = React.createRef();
    this.prevPath = '';
  }

  removeListener = null;

  pathChanged(path) {
    if (path != this.prevPath && this.appBodyRef.current) {
      if (this.appBodyRef.current.scrollTo) {
        this.appBodyRef.current.scrollTo(0, 0);
      } else {
        this.appBodyRef.current.scrollTop = 0;
        this.appBodyRef.current.scrollLeft = 0;
      }
    }
    this.prevPath = path;

    const newState = 
      (path == "/na/ceste" || path == "/pred/pois" || path == "/na/ceste/fotky") ||
      (path == "/na/ceste/" || path == "/pred/pois/" || path == "/na/ceste/fotky/");
      
    if (this.state.fillContent != newState)
      this.setState({
        fillContent: newState
      });
  }

  componentDidMount() {
    this.pathChanged(window.location.pathname);

    this.removeListener = history.listen((params) => {
      this.pathChanged(params.pathname);
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  render() {
    return (
  <AuthProvider>
    <LocalSettingsProvider>
    <DocumentTitle title={Constants.WebTitle}>
    <Router history={history}>
      <div className="app">
        <div className="app-header" data-nosnippet>
          <Navigation />
        </div>
        <div className="app-body" ref={this.appBodyRef}>
          <div className={this.state.fillContent ? "content-fill" : "content-wrap"}>
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
              <Route exact path="/pred/hladampartakov" component={FindBuddies} />
              <Route exact path="/pred/hladampartakov/:traveller" render={(props) => (<FindBuddiesDetail {...props} />)} />
              <Route exact path="/na/ceste" component={Active} />
              <Route exact path="/na/ceste/light" component={ActiveLight} />
              <Route exact path="/na/ceste/textovo" component={ActiveLight} />
              <Route exact path="/na/ceste/fotky" component={ActivePhotos} />
              <Route exact path="/na/archive" component={Archive} />
              <Route path="/na/:traveller" render={(props) => (<Traveller {...props} />)}/>
              <Route exact path="/kontakt" component={Kontakt} />
              <Route exact path="/hladanie" component={Search} />
              <Route exact path="/cookies" component={Cookies} />
              <Route exact path="/ucet" render={(props) => (<Account {...props} />)}/>
              <Route exact path="/ucet/poslatspravu" render={(props) => (<Account {...props} sendMessage/>)}/>
              <Route exact path="/ucet/pridatpoi" render={(props) => (<Account {...props} addPoi />)} />
              <Route exact path="/ucet/pridatclanok" render={(props) => (<Account {...props} addArticle />)} />
              <Route exact path="/ucet/hladampartakov" render={(props) => (<Account {...props} findBuddies />)} />
              <Route exact path="/ucet/pois" render={(props) => (<Account {...props} pois />)} />
              <Route exact path="/ucet/zmeny" render={(props) => (<Account {...props} changes />)} />
              <Route path="*" component={NotFound} />
            </Switch>
            {!this.state.fillContent && <SiteFooter/>}
          </div>
        </div>
      </div>
    </Router>
    </DocumentTitle>
    </LocalSettingsProvider>
  </AuthProvider>
  );}
}

export default CestaSNP;
