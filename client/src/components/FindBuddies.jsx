import React, { useContext, useEffect, useState } from 'react';
import * as Constants from './Constants';
import * as Texts from './Texts';
import { fetchJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import TravellerItem from './reusable/TravellerItem';
import { AuthContext } from './AuthContext';
import { A, navigate } from './reusable/Navigate';

const FindBuddies = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const authData = useContext(AuthContext);

  useEffect(() => {
    if (!authData.user) {
      setLoading(false);
      return;
    }

    fetchPostJsonWithToken(authData.user, '/api/traveller/listFindBuddies', { uid: authData.userDetails.uid })
      .then(data => setTravellers(data.map(t => Object.assign({ meno: t.name, user_id: t.user_id }, t))))
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
      }).finally(() => setLoading(false));
    }, [authData]);

  const now = Date.now();

  return (
    <PageWithLoader pageId="FindBuddies" pageTitle={`Hľadám parťákov${Constants.WebTitleSuffix}`} 
      loading={loading} error={!!authData.authProviderMounted && !authData.isAuth ? 
        (<div>Hladanie parťákov môže využiť len prihlásený užívateľ. <A href="/ucet">Prihlásiť sa</A></div>) : error} >
      <>
        {!!authData.isAuth &&
        <div className="travellers">
          {travellers.length == 0 && !authData.authProviderMounted &&
            <div>Momentálne parťákov nikto nehľadá. {` `}<A href="/ucet/hladampartakov">Pridaj svoj inzerát.</A></div>}
          {travellers.map((traveller, i) => <TravellerItem traveller={traveller} key={i} now={now} findBuddies/>)}
        </div>}

        <button className="snpBtn add" onClick={() => navigate("/ucet/hladampartakov")}>
          {!authData.isAuth || !authData.findBuddies || !authData.findBuddies.enabled ? "Pridaj svoj inzerát" : "Uprav svoj inzerát"}
        </button>
      </>
    </PageWithLoader>
  );
}

export default FindBuddies;
