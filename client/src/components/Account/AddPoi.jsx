import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import PageWithLoader from '../reusable/PageWithLoader';
import { fetchJson, fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import PoiForm from './PoiForm';
import PoiList from '../reusable/PoiList';
import * as Texts from '../Texts';
import { compareDesc } from 'date-fns';

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

        const maxDate = poi => {
          if (poi.deleted >= poi.modified) {
            return poi.deleted;
          } else {
            return poi.modified ? poi.modified : poi.created;
          }
        };

        pois.sort((a, b) => compareDesc(maxDate(a), maxDate(b)));

        setPois(pois);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Pois loading error: " + e);
      });
  };

  const updatePois = (poi) => {
    const list = pois.map(p => p);
    pois.forEach(p => { p.errorMsg = ''; p.successMsg = ''; });

    if (poi) {
      const index = list.findIndex(p => poi._id === p._id);
      if (index >= 0) {
        list.splice(index, 1, poi);
      } else {
        list.splice(0, 0, poi);
      } 
    }

    setPois(list);
  }

  useEffect(() => { fetchData(); }, []);

  const toggleIsMy = (poi) => {
    fetchPostJsonWithToken(authData.user, "/api/pois/toggleMy", { id: poi._id, uid: authData.userDetails.uid })
    .then(res => {
      authData.updateUserDetails(res);
    })
    .catch(error => { console.error(error); updatePois(Object.assign({ errorMsg: Texts.GenericError }, poi)) });
  };

  return (
    <PageWithLoader pageId="AddPoi" loading={!authData || !authData.authProviderMounted} 
      error={authData && authData.authProviderMounted && !authData.isAuth ? 'Pridať dôležité miesto môže len prihlásený užívateľ.' : ''}>
      
      <PoiForm uid={authData.userDetails.uid} user={authData.user} onUpdate={updatePois}/>

      <PageWithLoader pageId="MyPois" loading={loading} error={error} title="Moje dôležité miesta" className="thinRedWrap">
        <PoiList my showDeleted showLastChange pois={pois} userDetails={authData.userDetails} onMyRemove={toggleIsMy}/>
      </PageWithLoader>
    </PageWithLoader>
  )
}

export default AddPoi;