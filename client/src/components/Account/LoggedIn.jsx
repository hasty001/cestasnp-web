import React from 'react';
import auth from '../../helpers/firebase';
import history from '../../helpers/history';
import AddPoi from './AddPoi';

import FanAccount from './FanAccount';
import TravellerAccount from './TravellerAccount';

const LoggedIn = (props) => {

  if (window.location.pathname == "/ucet/pois") {
    history.replace("/pred/pois");
  }

  return (
    <>
      {props.addPoi ? 
        <AddPoi />
        : (props.userData.travellerDetails &&
          Object.keys(props.userData.travellerDetails).length > 0 ? (
            <TravellerAccount traveller={props.userData} />
          ) : (props.pois ? <></> : <FanAccount fan={props.userData} />
      ))}
      <button
        className="snpBtn"
        style={{
          display: 'block',
          margin: '15px auto'
        }}
        onClick={() => auth.signOut()}
        type="submit"
      >
        Odhlásiť
      </button>
    </>
  );
}

export default LoggedIn;
