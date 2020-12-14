import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { AuthContext } from './AuthContext';
import PoiItem from './reusable/PoiItem';
import { Modal } from 'react-bootstrap';
import FormCheckBox from './reusable/FormCheckBox';
import { useStateWithLocalStorage } from '../helpers/reactUtils';
import { PoiCategories } from './PoiCategories';

const PoisInTable = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pois, setPois] = useState(null);
  const [poisSorted, setPoisSorted] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useStateWithLocalStorage("PoisTableShowDetails", false);
  const [showDeleted, setShowDeleted] = useStateWithLocalStorage("PoisTableShowDeleted", false);
  const [filter, setFilter] = useStateWithLocalStorage("PoisTableFilter", {});
  const [sort, setSort] = useStateWithLocalStorage("PoisTableSort");

  const authData = useContext(AuthContext);

  const strCompare = (f, a, b) => f * (a || '').localeCompare(b || '');

  const sortPois = a => {
    const newPois = [...(a || [])];

    newPois.sort((a, b) => {
      const f = sort ? (sort.asc ? 1 : -1) : -1;
      switch (sort ? sort.by : null) {
        case "created":
          return f * (new Date(a.created) - new Date(b.created));
        case "lastModified":
          return f * (new Date(a.deleted || a.modified || 0) - new Date(b.deleted || b.modified || 0));
        case "lastModified_action":
          return f * ((a.deleted ? 2 : (a.modified ? 1 : 0)) - (b.deleted ? 2 : (b.modified ? 1 : 0)));
        case "lastModified_by_name":
          return strCompare(f, a.deleted_by_name || a.modified_by_name, b.deleted_by_name || b.modified_by_name);
        case "name":
        case "text":
        case "created_by_name":
          return strCompare(f, a[sort.by], b[sort.by]);
        case "img":
          return f * (((a.img_url && a.img_url != "None") ? 1 : 0) - 
            ((b.img_url && b.img_url != "None") ? 1 : 0));     
        case "itinerary":
          return f * ((a.itinerary ? (a.itinerary.near || a.itinerary.after ? 1 : 0) : 0) - 
            (b.itinerary ? (b.itinerary.near || b.itinerary.after ? 1 : 0) : 0));
      
        default:
          return f * (a._id || '').localeCompare(b._id || '');
      }
    });

    return newPois;
  }

  useEffect(() => {
    setPoisSorted(sortPois(pois));
  }, [pois, sort]);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/pois')
      .then(value => {
        setPois(value);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Pois loading error: " + e);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const changeFilter = (category, value) => {
    setFilter(prevFilter => { 
      const newFilter = Object.assign({}, prevFilter || {});
      if (!value) {
        newFilter[category] = true;
      } else {
        delete newFilter[category];
      }
      return newFilter; 
    });
  }

  const isEmpty = obj => {
    for (var p in obj) {
      return false;
    }
    return true;
  }

  const Sort = (props) => <a href="#" onClick={e => { 
      e.preventDefault();
      if (sort && sort.by == props.col) {
        setSort({ by: sort.by, asc: !sort.asc }); 
      } else {
        setSort({ by: props.col, asc: true }); 
      }
    }}>{props.children}{` `}{!!sort && (sort.by == props.col) && (sort.asc ? "▲" : "▼")}</a>;

  return (
    <PageWithLoader pageId="PoisInTable" loading={loading} error={error} pageTitle={`Dôležité miesta${Constants.WebTitleSuffix}`} >
      <>
        <button className="snpBtn no-print" onClick={e => { e.preventDefault(); setShowSettings(true); }}>Nastavenie</button>

        <Modal dialogClassName="pois-table-dalog" show={showSettings} onHide={() => setShowSettings(false)}>
          <Modal.Header closeButton>Nastavenie</Modal.Header>
          <Modal.Body>
            <FormCheckBox itemClassName="form-checkbox" value={[showDetails, setShowDetails]} valueName="changes" valueLabel="Zobraziť podrobnosti"/>
            <FormCheckBox itemClassName="form-checkbox" value={[showDeleted, setShowDeleted]} valueName="deleted" valueLabel="Zobraziť zmazané"/>
            <br/>
            {PoiCategories.filter(c => !c.hidden).map(c =>
              <FormCheckBox key={c.value} itemClassName="form-checkbox" 
                value={[!(filter || {})[c.value], (value) => changeFilter(c.value, value)]} valueName={"filter_" + c.value}
                valueLabel={<span><i className={c.icon} style={{ width: Constants.PoiIconSize, height: Constants.PoiIconSize }} alt={c.label}></i> {c.label}</span>}/>
              )}
          </Modal.Body>
        </Modal>
        
        <table className="pois-table">
          <thead>
            <tr>
              {!!showDetails && <th colSpan={2}>Vytvorené</th>}
              {!!showDetails && <th colSpan={3}>Naposledy zmenené</th>}
              <th><Sort col="name">Názov</Sort></th>
              <th><Sort col="text">Popis</Sort></th>
              {!!showDetails && <th><Sort col="itinerary">V itinerári</Sort></th>}
              {!!showDetails && <th><Sort col="img">Fotka</Sort></th>}
            </tr>
            <tr>
              {!!showDetails && <><th><Sort col="created">Čas</Sort></th><th><Sort col="created_by_name">Užívateľ</Sort></th></>}
              {!!showDetails && <><th><Sort col="lastModified">Čas</Sort></th><th><Sort col="lastModified_action">Akcia</Sort></th>
              <th><Sort col="lastModified_by_name">Užívateľ</Sort></th></>}
              <th></th>
              <th></th>
              {!!showDetails && <th></th>}
              {!!showDetails && <th></th>}
            </tr>
          </thead>
          <tbody>
            {!!poisSorted && poisSorted.filter(poi => poi._id && (!poi.deleted || showDeleted) 
              && (isEmpty(filter) || !filter[poi.category] || (poi.food && !filter[Constants.PoiCategoryFood]) || poi.water && !filter[Constants.PoiCategoryWater])).map(poi => 
              <PoiItem key={poi._id} value={poi} tableRow showLastChange={showDetails} showCreated={showDetails} showItinerary={showDetails} showImage={showDetails} />)}
          </tbody>
        </table>
      </>
    </PageWithLoader>);
}

export default PoisInTable;
