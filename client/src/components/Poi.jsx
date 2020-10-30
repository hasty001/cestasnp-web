import React, { useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import Map from './Map';
import { findPoiCategory } from './PoiCategories';
import Image from './reusable/Image';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';

const Poi = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [poi, setPoi] = useState(null);

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
    <PageWithLoader pageId="PoiDetail" loading={loading} error={error} >
      <>
      {!!poi && (
        <>
          <Map use="poi-map" pois={[poi]} lat={poi.coordinates[1]} lon={poi.coordinates[0]} zoom={13}/>
          <h2><i alt="text" className={findPoiCategory(poi.category).icon}/> {poi.name}</h2>
          <p>GPS: {poi.coordinates[1]}, {poi.coordinates[0]}</p>
          <Image value={poi.img_url} alt="fotka miesta" />
          <p>{poi.text}</p>
          <a href={`/pred/pois#poi=${poi._id}&lat=${poi.coordinates[1]}&lon=${poi.coordinates[0]}`}>na celej mape</a>
          {poi.itinerary && (poi.itinerary.near || poi.itinerary.after) && (
            <> | <a href={`/pred/itinerar?#p${poi._id}`}>v itinerári</a></>)}
        </>)}
      </>
    </PageWithLoader>
  )
}

export default Poi;