import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import Map from './Map';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';
import { AuthContext } from './AuthContext';
import history from '../helpers/history';

const Pois = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [pois, setPois] = useState(null);

  const [view, setView] = useState({});
  const [prevHash, setPrevHash] = useState();

  const authData = useContext(AuthContext);

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

  useEffect(() => { updateView() }, [window.location.hash]);

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

  return (
    <PageWithLoader pageId="Pois" loading={loading} error={error}>
      <>
        {!!pois && (
          <Map pois={pois} use="pois-map" 
            view={[view, setView]} setView={null} showLayers />)}
        {!!authData && !!authData.authProviderMounted && !!authData.isAuth && 
          <button className="snpBtn no-print" onClick={() => history.push('/ucet/pridatpoi')}>Pridať</button>}
      </>
    </PageWithLoader>);
}

export default Pois;
