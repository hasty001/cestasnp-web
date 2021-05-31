import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import { getTravellersImages, sortActiveTravellers } from '../helpers/helpers';
import { fetchJson } from '../helpers/fetchUtils';
import { A, navigate } from './reusable/Navigate'
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';

const ActivePhotos = (props) => {
  const now = format(new Date(), 'YYYY-MM-DD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/traveller/activeTravellersWithLastMessage' + window.location.search)
      .then(data => {     
        const activeTravellers = sortActiveTravellers(data, now);
        
        if (activeTravellers.length === 0) {
          setError(Texts.NoTravellersError);
        }
        
        setTravellers(activeTravellers);  
      })
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
      }).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  const images = getTravellersImages(travellers);

  const settingsData = useContext(LocalSettingsContext);

  return (
    <PageWithLoader pageId="NaCesteFotky" 
      pageTitle={props.box ? null : `LIVE sledovanie${Constants.WebTitleSuffix}`}
      loading={loading} error={error}>

      <button className="snpBtn active-kind-link no-print" title="Na mape"
        onClick={() => { settingsData.setActiveLink(""); navigate('/na/ceste'); }}><i className="fas fa-map"></i></button>

      {!!images && images.length > 0 && 
              (<SimpleMasonry images={images} targetHeight={Math.max((window.innerHeight - 110) || 1024, 600)} />)}
    </PageWithLoader>);
}

export default ActivePhotos;
