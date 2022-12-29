import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { navigate } from './reusable/Navigate';
import InfiniteScroll from 'react-infinite-scroll-component';

const PoisInTable = (props) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [pois, setPois] = useState(null);
  const [count, setCount] = useState(0);
  const [scrollThreshold, setScrollThreshold] = useState('100px');
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useStateWithLocalStorage("PoisTableShowDetails", false);
  const [showDeleted, setShowDeleted] = useStateWithLocalStorage("PoisTableShowDeleted", false);
  const [filter, setFilter] = useStateWithLocalStorage("PoisTableFilter", {});
  const [sort, setSort] = useStateWithLocalStorage("PoisTableSort");

  const authData = useContext(AuthContext);

  const url = (from, count) => `/api/pois?from=${from}&count=${count}&detail=${showDetails ? 1 : 0}&deleted=${showDeleted ? 1 : 0}&by=${sort ? sort.by : ''}&asc=${sort ? (sort.asc ? 1 : 0) : 1}&ignore=${Object.keys(filter).join(',')}`;

  const fetchData = () => {
    setLoading(true);
    setError('');
    setLoadingMore(false);
    setErrorMore('');

    fetchJson(url(0, 40))
      .then(value => {
        setPois(value.items);
        setCount(value.count);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Pois loading error: " + e);
      });
  };

  const loadMore = (limit = 40) => {
    if ((pois || []).length >= count) {
      return;
    }

    setLoadingMore(true);
    setErrorMore('');

    fetchJson(url((pois || []).length, limit))
      .then(value => {
        setLoadingMore(false);
        setPois((pois || []).concat(value.items));
        setCount(value.count);
      })
      .catch(e => {
        setLoadingMore(false);
        setErrorMore(Texts.GenericError);
        
        console.error("Pois loading more error: " + e);
      });
  }

  useEffect(() => { fetchData(); }, [showDetails, showDeleted, sort, filter]);

  const updateScrollThreshold = (event) => {
    const v = document.getElementsByClassName("site-footer")[0].offsetHeight + 
    document.getElementsByClassName("app-body")[0].offsetHeight;
    if (v) {
      setScrollThreshold(`${v + 100}px`);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateScrollThreshold);
    updateScrollThreshold();

    return () => window.removeEventListener("resize", updateScrollThreshold);
  })

  const changeFilter = (category, value) => {

    if (((filter || {})[category] || false) == !value) {
      return;
    }

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

  const Sort = (props) => <a href="#" onClick={e => { 
      e.preventDefault();
      if (sort && sort.by == props.col) {
        setSort({ by: sort.by, asc: !sort.asc }); 
      } else {
        setSort({ by: props.col, asc: true }); 
      }
    }}>{props.children}{` `}{!!sort && (sort.by == props.col) && (sort.asc ? "▲" : "▼")}</a>;

  return (
    <PageWithLoader pageId="PoisInTable"
      pageTitle={`Dôležité miesta v tabulke${Constants.WebTitleSuffix}`} title="Dôležité miesta v tabulke">
      <>
        <button data-nosnippet className="snpBtn pois-map-itinerary-link no-print" title="V itineráry" onClick={() => navigate('/pred/itinerar')}><i className="fas fa-list-ol"></i></button>
        <button data-nosnippet className="snpBtn no-print" onClick={e => { e.preventDefault(); setShowSettings(true); }}>Nastavenie</button>

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
        <InfiniteScroll hasMore={pois && pois.length < count} next={loadMore}
          dataLength={pois ? pois.length : 0} scrollThreshold={scrollThreshold} scrollableTarget="app-body">
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
              {(loading || !!error) && <tr><td colSpan={10}><PageWithLoader loading={loading} error={error} retry={fetchData}/></td></tr>}
                {!!pois && pois.map(poi => 
                  <PoiItem key={poi._id} value={poi} tableRow hidden={loading}
                    showLastChange={showDetails} showCreated={showDetails} showItinerary={showDetails} showImage={showDetails} />)}
              {(loadingMore || !!errorMore) && <tr><td colSpan={10}><PageWithLoader loading={loadingMore} error={errorMore} retry={loadMore}/></td></tr>}
            </tbody>
          </table>
        </InfiniteScroll>
      </>
    </PageWithLoader>);
}

export default PoisInTable;
