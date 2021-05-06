import React, { useContext, useEffect, useState } from 'react';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { AuthContext } from './AuthContext';
import { fetchJson, fetchPostJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import PageWithLoader from './reusable/PageWithLoader';
import TravellerItem from './reusable/TravellerItem';
import { A, navigate } from './reusable/Navigate';

const FindBuddiesDetail = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [traveller, setTraveller] = useState();

  const travellerId = props.match.params.traveller;

  const authData = useContext(AuthContext);

  const fetchData = () => {
    if (!authData.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetchPostJsonWithToken(authData.user, `/api/traveller/findBuddies/${travellerId}`, { uid: authData.userDetails.uid})
    .then((data) => {
      if (!data || !data.uid) {
        setError("Momentálne partákov nehľadá.");
        return;
      }

      setTraveller(Object.assign({ meno: data.name, user_id: data.uid, email: data.email }, data.findBuddies));
    })
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, [props.match.params.traveller, authData]);

  return (
    <PageWithLoader pageId="FindBuddiesDetail" pageTitle={traveller ? (traveller.meno + Constants.WebTitleSuffix) : null}>
      <DivWithLoader className="traveller" loading={loading} error={!!authData.authProviderMounted && !authData.isAuth ? 
        (<div>Hladanie parťákov môže využiť len prihlásený užívateľ. <A href="/ucet/hladampartakov">Prihlásiť sa</A></div>) : error}>
        <TravellerItem traveller={traveller || {}} now={Date.now()} userData={authData} findBuddies />         
      </DivWithLoader>
    </PageWithLoader>
  );
}

export default FindBuddiesDetail;
