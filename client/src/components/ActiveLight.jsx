import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import { dateToStr, dateTimeToStr, escapeHtml } from '../helpers/helpers';
import { fetchJson } from '../helpers/fetchUtils';
import { A, navigate } from './reusable/Navigate'
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';
import DOMPurify from 'dompurify';

const ActiveLight = (props) => {
  const now = format(new Date(), 'YYYY-MM-DD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [travellers, setTravellers] = useState([]);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson('/api/traveller/activeTravellersWithLastMessage' + window.location.search)
      .then(data => {
        const activeTravellers = [];
        const travellerIds = [];
        data.forEach(traveller => {
          const travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = format(traveller.start_date, 'YYYY-MM-DD');
          travellerData.endDate = traveller.end_date;
          travellerData.lastMessage = traveller.lastMessage;
          travellerData.finishedTracking = traveller.finishedTracking;
          travellerData.lastImg = traveller.lastImg;
          travellerData.lastImgMsgId = traveller.lastImgMsgId;

          activeTravellers.push(travellerData);
          travellerIds.push(traveller.user_id);
        });

        const getSortValue = t => (t.finishedTracking ? "11_" + t.startDate : ("0"
         + (t.startDate <= now && t.lastMessage ? ("0_" + t.lastMessage.pub_date) : ("1_" + t.startDate))));

         activeTravellers.sort((a, b) => getSortValue(a) > getSortValue(b));
        
        if (activeTravellers.length === 0) {
          setTravellers([]);
          setError(Texts.NoTravellersError);
          setLoading(false);
        } else {            
          setTravellers(activeTravellers);  
          setLoading(false);      
        }
      })
      .catch(e => {
        console.error(e);

        setError(Texts.GenericError);
        setLoading(false);
      });
  }

  useEffect(() => { fetchData(); }, []);

  const images = travellers ? 
    travellers.filter(t => t.lastImg).map(t => {
      const url = `/na/${t.userId}${t.finishedTracking ? Constants.FromOldQuery : ''}#${t.lastImgMsgId}`;
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
    travellers.reduce((r, t) => r || !t.finishedTracking && t.startDate <= now, false) : false;

  const hasPlanning =  travellers ? 
    travellers.reduce((r, t) => r || !t.finishedTracking && t.startDate > now, false) : false;

  const settingsData = useContext(LocalSettingsContext);

  return (
    <PageWithLoader pageId="NaCesteActiveLight" 
      pageTitle={props.box ? null : `LIVE sledovanie${Constants.WebTitleSuffix}`}
      loading={loading} error={error}>

      {!props.box && <button className="snpBtn active-kind-link no-print"
        onClick={() => { settingsData.setActiveLink("fotky"); navigate('/na/ceste/fotky'); }}><i className="far fa-images"></i></button>}
          
      {!!travellers && travellers.length > 0 && (
          <div className="active-travellers-list">
            {!hasActive && (
              <div className="active-travellers-info">
                {hasPlanning ?
                  "Momentálne nie je nikto na ceste, ale môžeš si pozrieť, kto cestu plánuje, alebo nedávna zaujímavá putovanie:"
                  : "Momentálne nie je nikto na ceste ani cestu neplánuje, ale môžeš si pozrieť nedávna zaujímavá putovanie:"}
              </div>
            )}

            {travellers.map((traveller, i) => {
              return (    
                    <div className="active-traveller-item" key={i} >
                      <div className="traveller-item-header"> 
                        <A className="traveller-name" href={`/na/${traveller.userId}${traveller.finishedTracking ? Constants.FromOldQuery : ""}`}>
                          {traveller.meno}                          
                        </A>

                        <span className="traveller-date">              
                          {(!traveller.finishedTracking && !!traveller.lastMessage && (traveller.startDate <= now)) &&  (
                          <span>
                            {dateTimeToStr(traveller.lastMessage.pub_date)}
                          </span>)} 

                          {((traveller.startDate > now) || !traveller.lastMessage) && (
                          <span>
                            {dateToStr(traveller.startDate)}                           
                            {' '}{traveller.startMiesto}
                          </span>)}  

                          {traveller.finishedTracking && (
                          <span>
                            {' - '}{dateToStr(traveller.endDate)}
                          </span>)} 
                        </span>
                      </div>

                      <div className="traveller-text"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(
                            traveller.finishedTracking || !traveller.lastMessage ? 
                              traveller.text : traveller.lastMessage.text) }} />
                    </div>                          
              );
            })}

            {!!props.box && images && images.length > 0 && 
              (<SimpleMasonry images={images} targetHeight={560} />)}
          </div>
      )}
    </PageWithLoader>
  );
}

export default ActiveLight;
