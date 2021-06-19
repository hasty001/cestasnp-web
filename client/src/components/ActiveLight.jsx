import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import { navigate } from './reusable/Navigate'
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';
import ButtonReadMore from './reusable/ButtonReadMore';
import TravellerItem from './reusable/TravellerItem';
import { A } from './reusable/Navigate';
import { getTravellersImages, parseDate, sortActiveTravellers } from '../helpers/helpers';

const ActiveLight = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const now = Date.now();

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/traveller/activeTravellersWithLastMessage' + window.location.search)
      .then(data => {     
        const activeTravellers = sortActiveTravellers(data, now);
        
        if (activeTravellers.length === 0) {
          setError(Texts.NoTravellersError);
        }
        
        setTravellers(activeTravellers);  
      })
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
      }).finally(() => setLoading(false));
  }

  useEffect(() => { fetchData(); }, []);

  const images = getTravellersImages(travellers);

  const active = travellers ? 
    travellers.reduce((r, t) => r + (!t.finishedTracking && parseDate(t.start_date) <= now ? 1 : 0) , 0) : 0;
  const hasActive = active > 0;

  const hasPlanning =  travellers ? 
    travellers.reduce((r, t) => r || !t.finishedTracking && parseDate(t.start_date) > now, false) : false;

  const settingsData = useContext(LocalSettingsContext);

  return (
    <PageWithLoader pageId="NaCesteActiveLight" className={loading ? "loading" : ""}
      pageTitle={props.box ? null : `LIVE sledovanie${Constants.WebTitleSuffix}`}
      loading={loading} error={error}>

      {!!props.box && (
        <A href={settingsData.activeLink.href} className="no-decoration">
          <h3 className="no-decoration">LIVE sledovanie {active >= 5 && <span className="active-count">({active} aktívnych)</span>}</h3>
        </A>)}

      {!props.box && <button className="snpBtn active-kind-link no-print" title="Fotky"
        onClick={() => { settingsData.setActiveLink("fotky"); navigate('/na/ceste/fotky'); }}><i className="far fa-images"></i></button>}
          
      {!!travellers && travellers.length > 0 && (
          <div className="active-travellers-list">
            {!hasActive && (
              <div className="active-travellers-info">
                {hasPlanning ?
                  "Momentálne nie je nikto na ceste, ale môžeš si pozrieť, kto cestu plánuje, alebo nedávne zaujímavé putovania:"
                  : "Momentálne nie je nikto na ceste ani cestu neplánuje, ale môžeš si pozrieť nedávne zaujímavé putovania:"}
              </div>
            )}

            <div className={"active-travellers-items" + (!images || images.length <= 0 ? " no-photo" : "")}>
            {travellers.map((traveller, i) => <TravellerItem key={i} traveller={traveller} now={now}/>)}
              {!!props.box && <div className="footer"/>}
              <div className="active-travellers-items-more">
                <ButtonReadMore href="/na/ceste/light" text="všetky správy"/>
              </div>
            </div>

            {!!props.box && images && images.length > 0 && 
              (<SimpleMasonry images={images} targetHeight={560} />)}
          </div>
      )}
    </PageWithLoader>
  );
}

export default ActiveLight;
