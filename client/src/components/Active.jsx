import React, { useContext, useEffect, useState } from 'react';
import { dateToStr, sortActiveTravellers, parseDate } from '../helpers/helpers';
import * as Constants from './Constants';
import { A, navigate } from './reusable/Navigate';
import { fetchJson } from '../helpers/fetchUtils';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import DivWithLoader from './reusable/DivWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';
import MapControl from './MapControl';

const colors = [
  'rgb(255,0,0)',
  'rgb(0,0,0)',
  'rgb(21,63,202)',
  'rgb(120,7,237)',
  'rgb(164,83,17)',
  'rgb(255,156,0)',
  'rgb(213,9,237)',
  'rgb(234,52,175)',
  'rgb(48,255,0)',
  'rgb(146,51,51)',
  'rgb(21,140,203)',
  'rgb(255,228,1)'
];

const grey = '#b19494';

const Active = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const now = Date.now();

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/traveller/activeTravellersWithLastMessage')
      .then(data => {     
        const activeTravellers = sortActiveTravellers(data, now);
        
        if (activeTravellers.length === 0) {
          setError(Texts.NoTravellersError);
        }

        let colorIndex = 0;

        activeTravellers.forEach(trvlr => {
          trvlr.started = parseDate(trvlr.start_date) <= now;

          trvlr.color = trvlr.started ? colors[colorIndex % colors.length] : grey;
          colorIndex += trvlr.started ? 1 : 0;
        });
        
        setTravellers(activeTravellers);  
      })
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
      }).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  const settingsData = useContext(LocalSettingsContext);
  
  return (
    <PageWithLoader pageId="NaCesteActive" pageTitle={`LIVE sledovanie${Constants.WebTitleSuffix}`} >
      <MapControl id="na-ceste-map-active" travellers={travellers} canScroll/>
      <button className="snpBtn active-kind-link no-print" title="Textovo" 
        onClick={() => { settingsData.setActiveLink("light"); navigate('/na/ceste/light'); }}><i className="fas fa-align-justify"></i></button>
      <DivWithLoader absolute className="active-travellers" 
        loading={loading} error={error}>
        {!loading && !error && !!travellers && travellers.map((traveller, i) => (
          <A key={i} href={`/na/${traveller.user_id}`}>
            <div className={`active-traveller ${traveller.started ? 'started' : ''}`.trim()} style={{backgroundColor: traveller.color, borderColor: traveller.color}}>
              <div className="active-traveller-name">               
                {traveller.started && <div className="active-traveller-marker">
                  <i className="fas fa-map-marker marker-border" style={{ width: `${Constants.PoiMarkerSize + 6}px`, height: `${Constants.PoiMarkerSize + 6}px` }}></i>
                  <i className="fas fa-map-marker-alt marker-image" style={{ color: traveller.color, width: `${Constants.PoiMarkerSize}px`, height: `${Constants.PoiMarkerSize}px` }} title="vzor ukazovatela"></i>
                </div>}
                {' '}{traveller.meno} 
              </div>
              {!traveller.started && <div className="active-traveller-start">vyráža {dateToStr(parseDate(traveller.start_date), "kdoviekdy")}</div>}
            </div>
          </A>
        ))}
      </DivWithLoader>
    </PageWithLoader>
  );
}

export default Active;
