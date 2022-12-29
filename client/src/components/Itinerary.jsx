import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { fetchJson } from '../helpers/fetchUtils';
import FormSelect from './reusable/FormSelect';
import ItineraryTable from './reusable/ItineraryTable';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { navigate } from './reusable/Navigate';
import { useStateResize } from '../helpers/reactUtils';
import InfiniteScroll from 'react-infinite-scroll-component';

const Itinerary = (props) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMore, setErrorMore] = useState(false);
  const [scrollThreshold, setScrollThreshold] = useState('100px');
  const [startEnd, setStartEnd] = useState(null);
  const [dataStartEnd, setDataStartEnd] = useState(null);
  const [dialogStartEnd, setDialogStartEnd] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [sum, setSum] = useState({});
  const [count, setCount] = useState(0);
  
  const [reverse, setReverse] = useState(false);
  const [mainGuideposts, setMainGudeposts] = useState([]);
  const [compact, setCompact] = useStateResize(() => window.innerWidth <= Constants.ItineraryCompactMaxWidth);

  const url = (from, count) => `/api/itinerary?start=${startEnd ? startEnd[0] : 0}&end=${startEnd ? startEnd[1] : -1}&from=${from}&count=${count}`;

  const fetchData = (limit = 30) => {

    if (dataStartEnd && JSON.stringify(dataStartEnd) == JSON.stringify(startEnd)) {
      return Promise.resolve();
    }

    setLoading(true);
    setError('');
    setLoadingMore(false);
    setErrorMore('');

    return fetchJson(url(0, limit))
    .then(data => {
      setDataStartEnd([data.start, data.end]);
      setStartEnd(startEnd || (data.mainGuideposts.length > 0 ? [data.mainGuideposts[0].id, data.mainGuideposts[data.mainGuideposts.length - 1].id] : null));
      setItinerary(data.items);
      setSum(data.sum);
      setCount(data.count);
      setReverse(data.reverse);
      setMainGudeposts(data.mainGuideposts);
      setLoading(false);
    })
    .catch(e => {
      setLoading(false);
      setError(Texts.GenericError);

      console.error("Itinerary loading error: " + e);
    })
  };

  const loadMore = (limit = 30) => {
    if ((itinerary || []).length >= count) {
      return;
    }

    setLoadingMore(true);
    setErrorMore('');

    fetchJson(url((itinerary || []).length, limit))
      .then(data => {
        setLoadingMore(false);
        setDataStartEnd([data.start, data.end]);
        setItinerary((itinerary || []).concat(data.items));
        setSum(data.sum);
        setCount(data.count);
        setReverse(data.reverse);
        setMainGudeposts(data.mainGuideposts);
      })
      .catch(e => {
        setLoadingMore(false);
        setErrorMore(Texts.GenericError);
        
        console.error("Itinerary loading more error: " + e);
      });
  }

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

  const hasHash = () => window.location.hash && window.location.hash != "#";

  useEffect(() => { 
    fetchData(hasHash() ? 100000 : 30)
      .then(() => { 
        if (hasHash()) {
          const elem = window.document.getElementById(window.location.hash.replace('#', ''));
          if (elem) {
            elem.scrollIntoView();
          }
        };
      });
  }, [startEnd]);

  const showDialog = (e) => {
    e.preventDefault();

    setDialogStartEnd(startEnd);
    setDialogVisible(true);
  }

  const handleDialog = (apply) => {
    if (apply) {
      setStartEnd(dialogStartEnd);
    }
    
    setDialogVisible(false);
  }

  return (
    <PageWithLoader pageId="Itinerary" 
      pageTitle={`Itinerár${Constants.WebTitleSuffix}`} title={"Itinerár"} >
      <>
        <div className="no-print" data-nosnippet>
          <button className="snpBtn pois-map-link" title="Na mape" onClick={() => navigate('/pred/pois')}><i className="fas fa-map"></i></button>
          <button className="snpBtn pois-settings" onClick={showDialog} type="button">Nastavenie</button>
          <a href={`/api/itinerary/gpx?start=${startEnd ? startEnd[0] : ""}&end=${startEnd ? startEnd[1] : ""}`} download="snp.gpx" target='_blank'>
            <button className="snpBtn" type="button">Stiahnuť gpx</button>
          </a>
        </div>
        
        <Modal show={dialogVisible}
          onHide={() => handleDialog(false)}
          dialogClassName="itinerary-dialog" >
          <Modal.Header closeButton>
            <Modal.Title>
              Nastavenie
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormSelect value={[dialogStartEnd ? dialogStartEnd[0] : null, (value) => setDialogStartEnd([parseInt(value), dialogStartEnd[1]])]}
              valueLabel="Začiatok:" valueName="start" itemClassName="form" 
              options={mainGuideposts ? mainGuideposts.map(item => { 
                return { value: item.id, label: item.name + (item.ele ? (` ${item.ele} m`) : '') }; }) : null}>
            </FormSelect>

            <FormSelect value={[dialogStartEnd ? dialogStartEnd[1] : null, (value) => setDialogStartEnd([dialogStartEnd[0], parseInt(value)])]}
              valueLabel="Koniec:" valueName="end" itemClassName="form" 
              options={mainGuideposts ? mainGuideposts.map(item => { 
                return { value: item.id, label: item.name + (item.ele ? (` ${item.ele} m`) : '') }; }) : null}>
            </FormSelect>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setDialogStartEnd([dialogStartEnd[1], dialogStartEnd[0]])}>Otoč</Button>
            <Button variant="primary" onClick={() => handleDialog(true)}>Použij</Button>
          </Modal.Footer>
        </Modal>

        <InfiniteScroll hasMore={itinerary && itinerary.length < count} next={loadMore}
          dataLength={itinerary ? itinerary.length : 0} scrollThreshold={scrollThreshold} scrollableTarget="app-body">
          <ItineraryTable compact={compact} itinerary={itinerary}
            sum={sum} reverse={reverse} fullKm
            loading={loading} loadingMore={loadingMore}
            error={error} errorMore={errorMore}
            fetchData={fetchData} loadMore={loadMore}
            />
        </InfiniteScroll>
      </>
    </PageWithLoader>
  );
}

export default Itinerary;
