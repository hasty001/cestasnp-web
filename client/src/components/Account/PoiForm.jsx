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

    fetchPostJsonWithToken(props.user, '/api/pois/add', data)
      .then(msgRes => {
        setLoading(false);

        if (msgRes.error) { throw msgRes.error; }
        if (msgRes.confirm) {
          setWarningMsg(msgRes.confirm); 
          return; 
        }
         
        setGpsEdit(false);
        setGps({ latlon: '', accuracy: 0 });
        setCategory('');
        setName('');
        setText('');
        setImage(''); 

        setSuccessMsg('Dôležité miesto úspešne pridané!');

        props.onUpdate(msgRes);
      })
      .catch(e => {
        console.error('Add POI error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }
  
  return (
    <FormWithLoader formId="add-poi" title="Pridať dôležité miesto" 
      submitText={warningMsg ? "Naozaj pridať" : "Pridať"}
      onSubmit={addPoi} loading={loading} errorMsg={errorMsg} successMsg={successMsg} >

      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsg}/>

      <FormSelect value={[category, setCategory]} valueName="category" valueLabel="Kategória" 
        options={PoiCategories} >
        <option value=" " />
      </FormSelect>
      <FormText value={[name, setName]} valueName="name" valueLabel="Meno" />
      <FormTextArea value={[text, setText]} valueName="text" valueLabel="Popis" />

      <FormImage value={[image, setImage]} imageAlt="nahrana fotka miesta" />
    
      {!!warningMsg && (
        <div className="warningMsg">
          <Map use="add-poi-map" lat={warningMsg.lat} lon={warningMsg.lon} zoom={warningMsg.zoom} marker=" " pois={warningMsg.pois}/>
          {!!warningMsg.distance && <p>Miesto je príliš ďaleko od cesty SNP: {(warningMsg.distance/1000).toFixed(1)} km</p>}
          {!!warningMsg.pois && (
            <>
              <p>Skontroluj blízke dôležité miesta kvôli možnej duplicite:</p>  
              <PoiTable pois={warningMsg.pois} />
            </>
          )}
          {!!warningMsg.itinerary && (
            <>
              <p>Skontroluj umiestnení v itinerári:</p>  
              <ItineraryTable noTotals noDetails fullKm select 
                insertPoi={warningMsg.poi} insert={warningMsg.itinerary.near} insertAfter={warningMsg.itinerary.after}
                itinerary={[warningMsg.itinerary.prev, warningMsg.itinerary.nearest, warningMsg.itinerary.next].filter((t, i, a) => a.indexOf(t) == i)} />
            </>
          )}
        </div>
      )}
    </FormWithLoader>
  )
}
export default PoiForm;