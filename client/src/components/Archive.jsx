import React, { useEffect, useState } from 'react';
import * as Constants from './Constants';
import * as Texts from './Texts';
import { fetchJson } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import TravellerItem from './reusable/TravellerItem';

const Archive = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  useEffect(() => {
    fetchJson('/api/traveller/finishedTravellers')
      .then(data => setTravellers(data))
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
      }).finally(() => setLoading(false));
    }, []);

  const now = Date.now();
  return (
    <PageWithLoader pageId="NaCesteArchive" pageTitle={`Archív${Constants.WebTitleSuffix}`} 
      loading={loading} error={error}>
      <div className="travellers">
        {travellers.map((traveller, i) => <TravellerItem traveller={traveller} key={i} now={now}/>)}
      </div>
    </PageWithLoader>
  );
}

export default Archive;
