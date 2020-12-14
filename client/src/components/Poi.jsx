import React, { useContext, useEffect, useState } from 'react';
import { fetchJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import { dateTimeToStr } from '../helpers/helpers';
import { AuthContext } from './AuthContext';
import Map from './Map';
import { findPoiCategory } from './PoiCategories';
import DeletePoiBox from './reusable/DeletePoiBox';
import EditPoiBox from './reusable/EditPoiBox';
import Image from './reusable/Image';
import PageWithLoader from './reusable/PageWithLoader';
import PoiIcon from './reusable/PoiIcon';
import UserLabel from './reusable/UserLabel';
import * as Texts from './Texts';
import * as Constants from './Constants';
import ItineraryTable from './reusable/ItineraryTable';
import { A } from './reusable/Navigate';
import DocumentTitle from 'react-document-title';

const Poi = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [poi, setPoi] = useState(null);
  const [historyPoi, setHistoryPoi] = useState(null);
  const [deleteBox, setDeleteBox] = useState(false);
  const [editBox, setEditBox] = useState(false);

  const authData = useContext(AuthContext);

  const userDetails = authData ? authData.userDetails : null;
      
  const isMyPoi = 
    (authData && authData.isAuth && userDetails && poi) ? 
      (userDetails.poisMy && userDetails.poisMy.indexOf(poi._id) >= 0)
        || (poi.user_id == userDetails.uid && !(userDetails.poisNotMy && userDetails.poisNotMy.indexOf(poi._id) >= 0))
      : false;

  const clearMsg = () => {
    if (poi) {
      const newPoi = Object.assign({}, poi);

      delete poi.successMsg;
      delete poi.errorMsg;

      setPoi(poi);
    }
  };

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

  useEffect(() => { fetchData(); }, [props.match.params.poi]);

  useEffect(() => {
    if (!window.location.hash || window.location.hash == "#" || !poi || !poi.history) {
      setHistoryPoi(null);
    } else {
      const id = window.location.hash.replace('#', '');
      const index = poi.history.findIndex(p => p._id == id);

      setHistoryPoi(index >= 0 ? poi.history[index] : null);
    }
  }, [poi, window.location.hash]);

  const toggleIsMy = () => {
    fetchPostJsonWithToken(authData.user, "/api/pois/toggleMy", { id: poi._id, uid: authData.userDetails.uid })
    .then(res => {
      authData.updateUserDetails(res);
    })
    .catch(error => { console.error(error); setPoi(Object.assign({ errorMsg: Texts.GenericError }, poi)) });
  };

  return (
    <PageWithLoader pageId="PoiDetail" loading={loading} error={error}>
      <>
      {!!poi && (
        <>
          <Map use="poi-map" showDeleted pois={[historyPoi || poi]} view={{ lat: (historyPoi || poi).coordinates[1], lon: (historyPoi || poi).coordinates[0], zoom: 13 }}/>
          <DocumentTitle title={`${(historyPoi || poi).name || findPoiCategory((historyPoi || poi).category).label}${Constants.WebTitleSuffix}`} />
          {!!historyPoi && <div className="warningMsg">
            <>Verzia:{' '}
            {historyPoi.modified ? 
              <>{dateTimeToStr(historyPoi.modified)} upravil <UserLabel uid={historyPoi.modified_by} name={historyPoi.modified_by_name}/>{' Poznámka: '}{historyPoi.modified_note}</>
              : <>{dateTimeToStr(historyPoi.created)} pridal <UserLabel uid={historyPoi.user_id} name={historyPoi.created_by_name}/></>}
            <a className="poi-history-link" href="#">pozrieť akutálnu verziu</a>
            </></div>}
          {!historyPoi && !!poi.errorMsg && <div className="errorMsg">{poi.errorMsg}</div>}
          {!historyPoi && !!poi.successMsg && <div className="successMsg">{poi.successMsg}</div>}

          <h2 className={(historyPoi || poi).deleted ? "deleted" : ""}><PoiIcon value={historyPoi || poi} /> {(historyPoi || poi).name || findPoiCategory((historyPoi || poi).category).label}
            <span className="poi-actions">
              {!historyPoi && !!authData.isAuth && 
                (<a href="#" onClick={e => { e.preventDefault(); toggleIsMy(); clearMsg(); }} 
                   className="poi-my" title={isMyPoi ? "odobrať z mojich miest" :"pridať do mojich miest"}>
                   <span className={isMyPoi ? "" : "hidden"}><i className="fas fa-star" /></span>
                   <span className={isMyPoi ? "hidden" : ""}><i className="far fa-star" /></span>
                 </a>)}

              {!historyPoi && !!authData.isAuth && !poi.deleted && 
                (<a href="#" onClick={e => { e.preventDefault(); setEditBox(true); clearMsg(); }} 
                  className="poi-edit" title="upraviť dôležité miesto"><i className="fas fa-pencil-alt"/></a>)}
              {!historyPoi && !!authData.isAuth && !poi.deleted && userDetails && (poi.user_id == userDetails.uid) &&
                (<a href="#" onClick={e => { e.preventDefault(); setDeleteBox(true); clearMsg(); }} 
                  className="poi-delete" title="zmazať dôležité miesto"><i className="fas fa-trash-alt"/></a>)}
            </span>
          </h2>
          
          <Image value={(historyPoi || poi).img_url} alt="fotka miesta" itemClassName="poi-image" large />

          <p>GPS: {(historyPoi || poi).coordinates[1]}, {(historyPoi || poi).coordinates[0]}</p>
          <p>{(historyPoi || poi).text}</p>

          {!!(historyPoi || poi).guideposts && !!(historyPoi || poi).itinerary && !!((historyPoi || poi).itinerary.near || (historyPoi || poi).itinerary.after) 
            && <ItineraryTable noTotals noDetails fullKm itinerary={(historyPoi || poi).guideposts} insert={historyPoi || poi}
              insertNear={(historyPoi || poi).itinerary.near} insertAfter={(historyPoi || poi).itinerary.after} />}
          
          {!historyPoi && !poi.deleted && <A href={`/pred/pois#poi=${poi._id}&lat=${poi.coordinates[1]}&lon=${poi.coordinates[0]}`}>na celej mape</A>}
          
          {!historyPoi && !poi.deleted && !!poi.itinerary && (poi.itinerary.near || poi.itinerary.after) && (
            <> | <A href={`/pred/itinerar#p${poi._id}`}>v itinerári</A></>)}

          {!!authData.isAuth && (
            <>
              {!historyPoi && !poi.deleted && <EditPoiBox uid={authData.userDetails.uid} user={authData.user} poi={poi} onUpdate={setPoi} show={editBox} onHide={() => setEditBox(false)}/>}
              {!historyPoi && !poi.deleted && <DeletePoiBox uid={authData.userDetails.uid} user={authData.user} poi={poi} onUpdate={setPoi} show={deleteBox} onHide={() => setDeleteBox(false)}/>}
              <h4>História</h4>

              {!!poi.deleted &&
                <p>{dateTimeToStr(poi.deleted)} zmazal <UserLabel uid={poi.deleted_by} name={poi.deleted_by_name}/>{' Poznámka: '}{poi.deleted_note}
                  {historyPoi && <a className="poi-history-link" href="#">pozrieť akutálnu verziu</a>}</p>}
              {!!poi.modified &&
                <p>{dateTimeToStr(poi.modified)} upravil <UserLabel uid={poi.modified_by} name={poi.modified_by_name}/>{' Poznámka: '}{poi.modified_note}
                  {historyPoi && <a className="poi-history-link" href="#">pozrieť akutálnu verziu</a>}</p>}
      
              {(!!poi.history) && poi.history.filter(h => h.modified).map(h => 
                <p key={h._id}>{dateTimeToStr(h.modified)} upravil <UserLabel uid={h.modified_by} name={h.modified_by_name}/>{' Poznámka: '}{h.modified_note} 
                  {(!historyPoi || h._id != historyPoi._id) && <a className="poi-history-link" href={`#${h._id}`}>pozrieť</a>}</p>)}
              {(!!poi.history) && poi.history.filter(h => !h.modified).map(h => 
                <p key={h._id}>{dateTimeToStr(h.created)} pridal <UserLabel uid={h.user_id} name={h.created_by_name}/> 
                  {(!historyPoi || h._id != historyPoi._id) && <a className="poi-history-link" href={`#${h._id}`}>pozrieť</a>}</p>)}

              {(!poi.history || poi.history.length == 0) && <p>{dateTimeToStr(poi.created)} pridal <UserLabel uid={poi.user_id} name={poi.created_by_name}/>
                {historyPoi && <a className="poi-history-link" href="#">pozrieť akutálnu verziu</a>}</p>}
            </>
          )}
        </>)}
      </>
    </PageWithLoader>
  )
}

export default Poi;