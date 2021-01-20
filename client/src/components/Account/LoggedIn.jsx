import React from 'react';
import DocumentTitle from 'react-document-title';
import auth from '../../helpers/firebase';
import history from '../../helpers/history';
import AddPoi from './AddPoi';

import FanAccount from './FanAccount';
import TravellerAccount from './TravellerAccount';
import * as Constants from '../Constants';

const LoggedIn = (props) => {

  if (window.location.pathname == "/ucet/pois") {
    history.replace("/pred/pois");
  }

  return (
    <>
      <DocumentTitle title={`Účet${Constants.WebTitleSuffix}`} />

      {props.addPoi ? 
        <AddPoi />
        : (props.userData.travellerDetails &&
          Object.keys(props.userData.travellerDetails).length > 0 ? (
            <TravellerAccount traveller={props.userData} />
          ) : (props.pois ? <></> : <FanAccount fan={props.userData} />
      ))}
    </>
  );
}

export default LoggedIn;
