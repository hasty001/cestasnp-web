import React, { useState } from 'react';
import FormWithLoader from '../reusable/FormWithLoader';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import FormLatLon from '../reusable/FormLatLon';
import FormText from '../reusable/FormText';
import FormSelect from '../reusable/FormSelect';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';
import { PoiCategories } from '../PoiCategories';
import Map from '../Map';
import PoiTable from '../reusable/PoiTable';
import ItineraryTable from '../reusable/ItineraryTable';
import { useStateEx } from '../../helpers/reactUtils';

const PoiForm = (props) => {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMsg = () => {
    setErrorMsg('');
    setWarningMsg('');
    setSuccessMsg('');
  }
  
  const [gps, setGps] = useStateEx({ latlon: '', accuracy: 0 }, clearMsg);
  const [gpsEdit, setGpsEdit] = useStateEx(false, clearMsg);
  const [category, setCategory] = useStateEx('', clearMsg);
  const [name, setName] = useStateEx('', clearMsg);
  const [text, setText] = useStateEx('', clearMsg);
  const [image, setImage] = useStateEx('', clearMsg);

  const [itineraryNear, setItineraryNear] = useState(null);
  const [itineraryAfter, setItineraryAfter] = useState(null);
  const [itineraryInfo, setItineraryInfo] = useState('');

  const addPoi = () => {
    if ((!name || name.trim().length === 0) 
      && (!text || text.trim().length === 0)) {
      setErrorMsg('Vyplň meno alebo text.');
      return;
    }

    if (!category || category.trim().length === 0) {
      setErrorMsg('Kategória nemôže ostať prázdna.');
      return;
    }

    var latlon = parseGPSPos(gps.latlon);

    if (
      !gps.latlon ||
      gps.latlon.trim().length === 0 ||      
      !latlon
    ) {
      setErrorMsg('GPS súradnice majú nesprávny formát.');
      return;
    }
     
    const confirmed = !!warningMsg;
    setLoading(true);
    clearMsg();

    const data = {};
    data.coordinates = [latlon[1].toFixed(6), latlon[0].toFixed(6)];
    data.accuracy = gps.accuracy;
    data.category = category;
    data.name = name;
    data.text = text;
    data.user_id = props.userId;
    data.img_url = image;
    data.confirmed = confirmed;
    data.itineraryNear = itineraryNear;
    data.itineraryAfter = itineraryAfter;
    data.itineraryInfo = itineraryInfo;

    fetchPostJsonWithToken(props.user, '/api/pois/add', data)
      .then(msgRes => {
        setLoading(false);
        
        if (msgRes.confirm) {
          if (msgRes.confirm.itinerary) {
            setItineraryNear(msgRes.confirm.itinerary.nearId);
            setItineraryAfter(msgRes.confirm.itinerary.afterId);
            setItineraryInfo(msgRes.confirm.itinerary.info || '');
          }
          setWarningMsg(msgRes.confirm); 
          return; 
        }
         
        setGpsEdit(false);
        setGps({ latlon: '', accuracy: 0 });
        setCategory('');
        setName('');
        setText('');
        setImage(''); 
        setItineraryNear(null);
        setItineraryAfter(null);
        setItineraryInfo('');

        setSuccessMsg('Dôležité miesto úspešne pridané!');

        props.onUpdate(msgRes);
      })
      .catch(e => {
        console.error('Add POI error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  const guideposts = warningMsg && warningMsg.itinerary ?
  [warningMsg.itinerary.prev, warningMsg.itinerary.nearest, warningMsg.itinerary.next].filter((t, i, a) => a.findIndex(o => o.id == t.id) == i)
  : [];

  return (
    <FormWithLoader formId="add-poi" title="Pridať dôležité miesto" 
      submitText={warningMsg ? "Naozaj pridať" : "Pridať"}
      onSubmit={addPoi} loading={loading} errorMsg={errorMsg} successMsg={successMsg} >

      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsg}/>

      <FormSelect value={[category, setCategory]} valueName="category" valueLabel="Kategória" 
        options={PoiCategories.filter(c => !c.hidden)} >
        <option value=" " />
      </FormSelect>
      <FormText value={[name, setName]} valueName="name" valueLabel="Meno" />
      <FormTextArea value={[text, setText]} valueName="text" valueLabel="Popis" />

      <FormImage value={[image, setImage]} imageAlt="nahrana fotka miesta" />
    
      {!!warningMsg && (
        <div className="warningMsg">
          <Map use="add-poi-map" view={[warningMsg.lat, warningMsg.lon, warningMsg.zoom, null]}
            marker={{ lat: warningMsg.lat, lon: warningMsg.lon, name: "nové miesto"}} 
            pois={warningMsg.pois} guideposts={guideposts} />
          {!!warningMsg.distance && <h3>Miesto je príliš ďaleko od cesty SNP: {(warningMsg.distance/1000).toFixed(1)} km</h3>}
          {!!warningMsg.pois && (
            <>
              <h3>Skontroluj blízke dôležité miesta kvôli možnej duplicite:</h3>  
              <PoiTable pois={warningMsg.pois} />
            </>
          )}
          {!!warningMsg.itinerary && (
            <>
              <h3>Skontroluj a prípadne uprav umiestnení a popis v itinerári:</h3> 
              <FormText value={[itineraryInfo, setItineraryInfo]}
                valueName="itineraryInfo" valueLabel="Popis v itineráry:"/> 
              <ItineraryTable noTotals noDetails fullKm select 
                insert={warningMsg.poi} insertInfo={itineraryInfo} 
                insertNear={[itineraryNear, setItineraryNear]} 
                insertAfter={[itineraryAfter, setItineraryAfter]}
                itinerary={guideposts} />              
            </>
          )}
        </div>
      )}
    </FormWithLoader>
  )
}
export default PoiForm;