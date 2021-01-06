import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import { dateToStr, dateTimeToStr } from '../helpers/helpers';
import { fetchJson } from '../helpers/fetchUtils';
import { A, navigate } from './reusable/Navigate'
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';
import * as Texts from './Texts';
import PageWithLoader from './reusable/PageWithLoader';
import { LocalSettingsContext } from './LocalSettingsContext';

const ActivePhotos = (props) => {
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

  const settingsData = useContext(LocalSettingsContext);

  return (
    <PageWithLoader pageId="NaCesteFotky" 
      pageTitle={props.box ? null : `LIVE sledovanie${Constants.WebTitleSuffix}`}
      loading={loading} error={error}>

      <button className="snpBtn active-kind-link no-print"
        onClick={() => { settingsData.setActiveLink(""); navigate('/na/ceste'); }}><i className="fas fa-map"></i></button>

      {!!images && images.length > 0 && 
              (<SimpleMasonry images={images} targetHeight={1024} />)}
    </PageWithLoader>);
}

export default ActivePhotos;
