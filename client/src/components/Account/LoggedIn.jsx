import React from 'react';
import DocumentTitle from 'react-document-title';
import history from '../../helpers/history';
import * as Constants from '../Constants';

import AddPoi from './AddPoi';
import TravellerAccount from './TravellerAccount';
import AddArticle from './AddArticle';
import Changes from './Changes';
import SendMessage from './SendMessage';

const LoggedIn = (props) => {

  if (window.location.pathname == "/ucet/pois") {
    history.replace("/pred/pois");
  }

  return (
    <>
      <DocumentTitle title={`Účet${Constants.WebTitleSuffix}`} />

      {props.addArticle ? 
        <AddArticle /> : (props.addPoi ? 
        <AddPoi />
        : (props.changes ? <Changes /> 
          : (props.userData.travellerDetails &&
            Object.keys(props.userData.travellerDetails).length > 0 ? (
              props.sendMessage ? <SendMessage userData={props.userData} /> : <TravellerAccount userData={props.userData} edit />
            ) : (props.pois ? <></> : <TravellerAccount userData={props.userData} />
      ))))}
    </>
  );
}

export default LoggedIn;
