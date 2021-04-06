import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import Map from './Map';
import { sortByDateAsc, dateToStr } from '../helpers/helpers';
import * as Constants from './Constants';
import { A, navigate } from './reusable/Navigate';
import { fetchJson, fetchPostJson } from '../helpers/fetchUtils';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import DivWithLoader from './reusable/DivWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';

const colors = [
  '#ff0000',
  '#000',
  '#153fca',
  '#7807ed',
  '#a45311',
  '#ff9c00',
  '#d509ed',
  '#ea34af',
  '#30ff00',
  '#923333',
  '#158ccb',
  '#ffe401'
];

const grey = '#b19494';

const Active = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/traveller/activeTravellers')
      .then(data => {
        const activeTravellers = [];
        const travellerIds = [];
        const now = format(new Date(), 'YYYY-MM-DD');
        data.forEach(traveller => {
          const travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = format(traveller.start_date, 'YYYY-MM-DD');
          travellerData.endDate = traveller.end_date;
          activeTravellers.push(travellerData);
          travellerIds.push(traveller.user_id);
        });
        
        sortByDateAsc(activeTravellers, 'startDate');

        if (activeTravellers.length === 0) {
          setTravellers([]);
          setError(Texts.NoTravellersError);
          setLoading(false);
        } else {
          let colorCount = 0;
          
          activeTravellers.forEach(trvlr => {
            trvlr.started = trvlr.startDate <= now;
            trvlr.color = trvlr.started ? colors[colorCount % colors.length] : grey;
            colorCount++;
          });
        }
        return { activeTravellers, travellerIds };
      })
      .then(({ activeTravellers, travellerIds }) => {

        if (travellerIds.length > 0) {
          return fetchPostJson('/api/traveller/lastMessages', { travellerIds })
            .then(messages => {
              const ids = [];
              const lastMessages = [];

              messages.forEach(msg => {
                if (ids.length === 0) {
                  ids.push(msg.user_id);
                  lastMessages.push(msg);
                } else {
                  let idCounter = 0;
                  ids.forEach(id => {
                    if (id === msg.user_id) {
                      idCounter += 1;
                    }
                  });
                  if (idCounter === 0) {
                    ids.push(msg.user_id);
                    lastMessages.push(msg);
                  }
                }
              });

              const activeTravellersWithMessage = activeTravellers.map(trvlr => {
                lastMessages.forEach(msg => {
                  if (msg.user_id === trvlr.userId) {
                    // eslint-disable-next-line no-param-reassign
                    trvlr.lastMessage = msg;
                  }
                });

                return trvlr;
              });

              setTravellers(activeTravellersWithMessage);
              setLoading(false);
            });
        }
      })
      .catch(e => {
        console.error(e);
        setError(Texts.GenericError);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const settingsData = useContext(LocalSettingsContext);
  
  return (
    <PageWithLoader pageId="NaCesteActive" pageTitle={`LIVE sledovanie${Constants.WebTitleSuffix}`} >
      <Map use="na-ceste-map-active" travellers={travellers} canScroll/>
      <button className="snpBtn active-kind-link no-print" title="Textovo" 
        onClick={() => { settingsData.setActiveLink("light"); navigate('/na/ceste/light'); }}><i className="fas fa-align-justify"></i></button>
      <DivWithLoader absolute className="active-travellers" 
        loading={loading} error={error}>
        {!loading && !error && !!travellers && travellers.map((traveller, i) => (
          <A key={i} href={`/na/${traveller.userId}`}>
            <div className={`active-traveller ${traveller.started ? 'started' : ''}`.trim()} style={{backgroundColor: traveller.color}}>
              <div className="active-traveller-name">               
                {traveller.started && <div className="active-traveller-marker">
                  <i className="fas fa-map-marker marker-border" style={{ width: `${Constants.PoiMarkerSize + 6}px`, height: `${Constants.PoiMarkerSize + 6}px` }}></i>
                  <i className="fas fa-map-marker-alt marker-image" style={{ color: traveller.color, width: `${Constants.PoiMarkerSize}px`, height: `${Constants.PoiMarkerSize}px` }} title="vzor ukazovatela"></i>
                </div>}
                {' '}{traveller.meno} 
              </div>
              {!traveller.started && <div className="active-traveller-start">vyráža {dateToStr(traveller.startDate, "kdoviekdy")}</div>}
            </div>
          </A>
        ))}
      </DivWithLoader>
    </PageWithLoader>
  );
}

export default Active;
