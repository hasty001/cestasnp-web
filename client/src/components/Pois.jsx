import React, { useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import Map from './Map';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';

const Pois = (props) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [pois, setPois] = useState(null);

    const [view, setView] = useState([null, null, null, null]);
    const [prevHash, setPrevHash] = useState();

    useEffect(() => {
      if (window.location.hash == prevHash) {
        return;
      }
      setPrevHash(window.location.hash);
     
      const params = new URLSearchParams((window.location.hash || '').replace("#", "?"));

      const lat = params.get('lat') || view[0];
      const lon = params.get('lon') || view[1];
      const zoom = params.get('zoom') || view[2];
      const poi = params.get('poi') || view[3];
      if (lat != view[0] || lon != view[1] || zoom != view[2] || poi != view[3]) {
        setView([lat, lon, zoom, poi]);
      }
    }, [window.location.hash]);

  useEffect(() => {
    const hash = [["poi", view[3]], ["lat", view[0]], ["lon", view[1]], ["zoom", view[2]]].filter(i => i[1]).map(i => i.join("=")).join("&");

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
          view={[view, setView]} showLayers />)}
      </>
    </PageWithLoader>);
}

export default Pois;
