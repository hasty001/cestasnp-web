import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import Map from './Map';
import PageWithLoader from './reusable/PageWithLoader';
import Close from './reusable/Close';
import * as Texts from './Texts';
import { AuthContext } from './AuthContext';
import { useStateWithLocalStorage } from '../helpers/reactUtils';
import * as Constants from './Constants';
import { navigate } from './reusable/Navigate';

const Pois = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pois, setPois] = useState(null);

  const [view, setView] = useState({});
  const [prevHash, setPrevHash] = useState();

  const [watchGps, setWatchGps] = useStateWithLocalStorage("watchGps", false);
  const [watchGpsId, setWatchGpsId] = useState();
  const [gpsMarker, setGpsMarker] = useState();
  const [gpsError, setGpsError] = useState('');

  const authData = useContext(AuthContext);

  useEffect(() => {
    if (watchGps) {
      var first = true;
      const id = navigator.geolocation.watchPosition(({ coords }) => {
        setGpsMarker({ lat: coords.latitude.toFixed(6), lon: coords.longitude.toFixed(6), accuracy: coords.accuracy });
        setView(prevView => {
          const newView = first && !prevView.poi ? { lat: coords.latitude.toFixed(6), lon: coords.longitude.toFixed(6) } : prevView;
          first = false;
          return newView;
        });
      }, error => {
        console.error(error);
        setGpsError(Texts.GpsError);
        setWatchGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });

      setWatchGpsId(id);

      return () => { if (watchGps) { navigator.geolocation.clearWatch(id); setWatchGpsId(null); } };
    }
  }, [watchGps]);

  useEffect(() => {
    if (!watchGps) {
      if (watchGpsId) {
        navigator.geolocation.clearWatch(watchGpsId);
      }
      setWatchGpsId(null);
      setGpsMarker(null);
    }
  }, [watchGps, watchGpsId]);

  const updateView = () => {
    if (window.location.hash == prevHash) {
      return;
    }
    setPrevHash(window.location.hash);
   
    const params = new URLSearchParams((window.location.hash || '').replace("#", "?"));

    const lat = params.get('lat') || view.lat;
    const lon = params.get('lon') || view.lon;
    const zoom = params.get('zoom') || view.zoom;
    const poi = params.get('poi');
    if (lat != view.lat || lon != view.lon || zoom != view.zoom || poi != view.poi) {
      setView({ lat, lon, zoom, poi });
    }
  };

  useEffect(() => { updateView() }, [window.location.hash, prevHash, view]);

  if (window.location.hash) {
    updateView();
  }

  useEffect(() => {
    const hash = [["poi", view.poi], ["lat", view.lat], ["lon", view.lon], ["zoom", view.zoom]].filter(i => i[1]).map(i => i.join("=")).join("&");

    setPrevHash(hash ? "#" + hash : "");
    window.location.hash = hash;
  }, [view]);

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

  const toggleWatchGps = () => {
    if (!watchGps) { 
      setView(prevView => Object.assign(prevView, { poi: '' })); 
    } 
    setWatchGps(!watchGps); 
  };

  return (
    <PageWithLoader pageId="Pois" loading={loading} error={error} pageTitle={`Dôležité miesta${Constants.WebTitleSuffix}`}>
      <>
        {!!pois && (
          <Map pois={pois} use="pois-map" 
            view={[view, setView]} setView={null} marker={gpsMarker} showLayers />)}
        {!!gpsError && <div className="errorMsg">
            <Close onClose={() => setGpsError('')}/>
            {gpsError}
          </div>}
        <button className="snpBtn pois-map-table-link no-print" onClick={() => navigate('/pred/pois/tabulka')}><i className="fas fa-table"></i></button>
        <button className={"snpBtn pois-map-watch-gps no-print" + (watchGps ? " down" : "")} onClick={() => toggleWatchGps()}><i className="fas fa-map-marked-alt"></i></button>
        {!!authData && !!authData.authProviderMounted && !!authData.isAuth && 
          <button className="snpBtn pois-map-add no-print" onClick={() => navigate('/ucet/pridatpoi' + (gpsMarker ? (`#lat=${gpsMarker.lat}&lon=${gpsMarker.lon}&acc=${gpsMarker.accuracy}`) : ""))}>Pridať</button>}
      </>
    </PageWithLoader>);
}

export default Pois;
