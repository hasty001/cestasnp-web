import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import { dateTimeToStr } from '../helpers/helpers';
import { AuthContext } from './AuthContext';
import Map from './Map';
import { findPoiCategory } from './PoiCategories';
import DeletePoiBox from './reusable/DeletePoiBox';
import Image from './reusable/Image';
import PageWithLoader from './reusable/PageWithLoader';
import PoiIcon from './reusable/PoiIcon';
import UserLabel from './reusable/UserLabel';
import * as Texts from './Texts';

const Poi = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [poi, setPoi] = useState(null);
  const [deleteBox, setDeleteBox] = useState(false);

  const authData = useContext(AuthContext);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/pois/' + props.match.params.poi)
      .then(value => {
        setPoi(value);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Poi loading error: " + e);
      });
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <PageWithLoader pageId="PoiDetail" loading={loading} error={error}>
      <>
      {!!poi && (
        <>
          <Map use="poi-map" showDeleted pois={[poi]} view={{ lat: poi.coordinates[1], lon: poi.coordinates[0], zoom: 13 }}/>
          
          {!!poi.errorMsg && <div className="errorMsg">{poi.errorMsg}</div>}
          {!!poi.successMsg && <div className="successMsg">{poi.successMsg}</div>}

          <h2 className={poi.deleted ? "deleted" : ""}><PoiIcon value={poi} /> {poi.name || findPoiCategory(poi.category).label}
            <span className="poi-actions">
              {!!authData.authProviderMounted && !!authData.isAuth && !poi.deleted && 
                (<a href="#" onClick={e => { e.preventDefault(); setDeleteBox(true); }} className="poi-delete" title="zmazať dôležité miesto"><i className="fas fa-trash-alt"/></a>)}
            </span>
          </h2>
          
          <Image value={poi.img_url} alt="fotka miesta" itemClassName="poi-image" />

          <p>GPS: {poi.coordinates[1]}, {poi.coordinates[0]}</p>
          <p>{poi.text}</p>
          
          {!poi.deleted && <a href={`/pred/pois#poi=${poi._id}&lat=${poi.coordinates[1]}&lon=${poi.coordinates[0]}`}>na celej mape</a>}
          
          {!poi.deleted && !!poi.itinerary && (poi.itinerary.near || poi.itinerary.after) && (
            <> | <a href={`/pred/itinerar#p${poi._id}`}>v itinerári</a></>)}

          {!!authData.authProviderMounted && !!authData.isAuth && (
            <>
              {!poi.deleted && <DeletePoiBox uid={authData.userDetails.uid} user={authData.user} poi={poi} onUpdate={setPoi} show={deleteBox} onHide={() => setDeleteBox(false)}/>}
              <h4>História</h4>

              {(!!poi.deleted || !!poi.modified) && (poi.deleted ? 
                <p>{dateTimeToStr(poi.deleted)} smazal <UserLabel uid={poi.deleted_by} name={poi.deleted_by_name}/>{' Poznámka: '}{poi.deleted_note}</p>
                : <p>{dateTimeToStr(poi.modified)} upravil <UserLabel uid={poi.modified_by} name={poi.modified_by_name}/>{' Poznámka: '}{poi.modified_note}</p>
                  )}
      
              {(!!poi.history) && poi.history.filter(h.modified).map(h => 
                <p key={h._id}>{dateTimeToStr(h.modified)} upravil <UserLabel uid={h.modified_by} name={h.modified_by_name}/>{' Poznámka: '}{h.modified_note}</p>)}

              <p>{dateTimeToStr(poi.created)} pridal <UserLabel uid={poi.user_id} name={poi.created_by_name}/></p>
            </>
          )}
        </>)}
      </>
    </PageWithLoader>
  )
}

export default Poi;