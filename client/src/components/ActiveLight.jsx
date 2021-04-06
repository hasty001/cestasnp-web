import React, { useContext, useEffect, useState } from 'react';
import { fetchJson } from '../helpers/fetchUtils';
import { navigate } from './reusable/Navigate'
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';
import ButtonReadMore from './reusable/ButtonReadMore';
import { addDays } from 'date-fns';
import TravellerItem from './reusable/TravellerItem';
import { parseDate } from '../helpers/helpers';

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
        const activeTravellers = data;

        const getSortValue = t => (t.finishedTracking ? "11_" + parseDate(t.start_date).valueOf() 
          : ("0" + (parseDate(t.start_date) <= now && t.lastMessage ? 
            ("0_" + (addDays(now, 1) - parseDate(t.lastMessage.pub_date))) 
            : ("1_" + parseDate(t.start_date).valueOf()))));

        activeTravellers.sort((a, b) => getSortValue(a).localeCompare(getSortValue(b)));
        
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

  const images = travellers ? 
    travellers.filter(t => t.lastImg).map(t => {
      const url = `/na/${t.user_id}${t.finishedTracking ? Constants.FromOldQuery : ''}#${t.lastImgMsgId}`;
      const title = t.meno;

      if (t.lastImg.eager && t.lastImg.eager.length > 0) {
        return { url: url, title: title, src: t.lastImg.secure_url, eager: t.lastImg.eager, aspect: t.lastImg.height / t.lastImg.width };
      } else {
        return { url: url, title: title, src: t.lastImg.indexOf('res.cloudinary.com') === -1
            ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${t.lastImg}`
            : t.lastImg, aspect: 1}
      }
    }) : [];

  const hasActive = travellers ? 
    travellers.reduce((r, t) => r || !t.finishedTracking && parseDate(t.start_date) <= now, false) : false;

  const hasPlanning =  travellers ? 
    travellers.reduce((r, t) => r || !t.finishedTracking && parseDate(t.start_date) > now, false) : false;

  const settingsData = useContext(LocalSettingsContext);

  return (
    <PageWithLoader pageId="NaCesteActiveLight" 
      pageTitle={props.box ? null : `LIVE sledovanie${Constants.WebTitleSuffix}`}
      loading={loading} error={error}>

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
