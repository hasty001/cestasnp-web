import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import PageWithLoader from '../reusable/PageWithLoader';
import { fetchJson } from '../../helpers/fetchUtils';
import PoiForm from './PoiForm';
import PoiTable from '../reusable/PoiTable';

const AddPoi = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pois, setPois] = useState([]);
  
  const authData = useContext(AuthContext);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/pois')
      .then(pois => {
        setPois(pois);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(e);

        console.error("Poi loading error: " + e);
      });
  };

  const updatePois = (poi) => {
    const list = pois.map(p => p);

    list.splice(0, 0, poi);

    setPois(list);
  }

  useEffect(() => { fetchData(); }, []);
  
  return (
    <PageWithLoader pageId="AddPoi" loading={!authData || !authData.authProviderMounted} 
      error={authData && authData.authProviderMounted && !authData.isAuth ? 'Pridať dôležité miesto môže len prihlásený užívateľ.' : ''}>
      
      <PoiForm userId={authData.userDetails.uid} user={authData.user} onUpdate={updatePois}/>

      <PageWithLoader loading={loading} error={error} title="Moje dôležité miesta" className="thinRedWrap">
        <PoiTable my pois={pois} userId={authData.userDetails.uid} user={authData.user} />
      </PageWithLoader>
    </PageWithLoader>
  )
}

export default AddPoi;