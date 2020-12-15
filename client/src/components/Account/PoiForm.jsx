import React, { useEffect, useState } from 'react';
import FormWithLoader from '../reusable/FormWithLoader';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import FormLatLon from '../reusable/FormLatLon';
import FormText from '../reusable/FormText';
import FormSelect from '../reusable/FormSelect';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';
import { findPoiCategory, PoiCategories } from '../PoiCategories';
import Map from '../Map';
import PoiList from '../reusable/PoiList';
import ItineraryTable from '../reusable/ItineraryTable';
import { useStateEx } from '../../helpers/reactUtils';
import FormCheckBox from '../reusable/FormCheckBox';

const PoiForm = (props) => {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorMsgFirst, setErrorMsgFirst] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [newPoi, setNewPoi] = useState();

  const clearMsg = () => {
    setErrorMsg('');
    setErrorMsgFirst('');
    setWarningMsg('');
    setSuccessMsg('');
  }
  
  const [gps, setGps] = useStateEx({ latlon: '', accuracy: 0 }, clearMsg);
  const [gpsEdit, setGpsEdit] = useStateEx(false, clearMsg);
  const [category, setCategory] = useStateEx('', clearMsg);
  const [name, setName] = useStateEx('', clearMsg);
  const [text, setText] = useStateEx('', clearMsg);
  const [image, setImage] = useStateEx('', clearMsg);
  const [water, setWater] = useStateEx('', clearMsg);
  const [food, setFood] = useStateEx('', clearMsg);

  const [itineraryNear, setItineraryNear] = useState(null);
  const [itineraryAfter, setItineraryAfter] = useState(null);
  const [itineraryInfo, setItineraryInfo] = useState('');

  const [note, setNote] = useStateEx('', clearMsg);

  useEffect(() => {
    if (window.location.hash && window.location.hash.replace('#', '')) {
      const params = new URLSearchParams(window.location.hash.replace("#", "?"));

      const lat = params.get('lat');
      const lon = params.get('lon');
      const acc = params.get('acc') || '0';

      if (lat && lon) {
        if (acc > Constants.MaxAllowedGPSAccuracy) {
          console.error('low GPS accuracy ', acc);

          setErrorMsgFirst(Texts.GpsLowAccuracyError(lat, lon));
        } else {
          setGps({ latlon: lat + ", " + lon ,accuracy: acc });
        }
        window.location.hash = "";
      }
    }
  }, [window.location.hash]);

  useEffect(() => {
    if (props.poi && props.edit) {
      const p = props.poi;
      setGps({ latlon: p.coordinates && p.coordinates.length > 1 ? `${p.coordinates[1]}, ${p.coordinates[0]}` : '', accuracy: p.accuracy });
      setCategory(p.category);
      setName(p.name);
      setText(p.text);
      setImage(p.img_url);
      setWater(p.water);
      setFood(p.food);
      setItineraryNear(p.itinerary ? p.itinerary.near : null);
      setItineraryAfter(p.itinerary ? p.itinerary.after : null);
      setItineraryInfo(p.itinerary ? p.itinerary.info : '');
    }
  }, [props.poi, props.edit]);

  useEffect(() => {
    if (props.poi && props.edit) {
      setNewPoi({ _id: props.poi._id, category, name, text, water, food, guideposts: props.poi.guideposts });
    }
  }, [props.poi, props.edit, category, name, text, water, food]);

  const addPoi = () => {
    if ((!name || name.trim().length === 0) 
      && (!text || text.trim().length === 0)) {
      setErrorMsg('Vyplň meno alebo popis.');
      return;
    }

    if (!category || category.trim().length === 0) {
      setErrorMsg('Kategória nemôže ostať prázdna.');
      return;
    }

    if (props.edit && (!note || note.trim().length === 0)) {
      setErrorMsg('Poznámka nemôže ostať prázdna.');
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

    if (!gps.accuracy && !props.edit && !image) {
      setErrorMsg('Pre GPS súradnice zadané ručne alebo vybrané na mape je nutné pridať fotku miesta.');
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
    if (props.edit) {
      data.id = props.poi._id;
      data.uid = props.uid;
      data.note = note;
    } else {
      data.user_id = props.uid;
    }
    data.img_url = image;

    if (category != "krcma_jedlo" && food == "1") {
      data.food = true;
    }
    if (category != "pramen" && water == "1") {
      data.water = true;
    }
    data.confirmed = confirmed;
    data.itineraryNear = itineraryNear;
    data.itineraryAfter = itineraryAfter;
    data.itineraryInfo = itineraryInfo;

    fetchPostJsonWithToken(props.user, props.edit ? '/api/pois/update' : '/api/pois/add', data)
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
        setFood(''); 
        setWater(''); 
        setItineraryNear(null);
        setItineraryAfter(null);
        setItineraryInfo('');
        setNote('');

        msgRes.successMsg = props.edit ? 'Dôležité miesto úspešne upravené!': 
          'Dôležité miesto úspešne pridané!';
        setSuccessMsg(msgRes.successMsg);

        props.onUpdate(msgRes);
      })
      .catch(e => {
        console.error('Add POI error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  useEffect(() => {
    setCategoryDescription(findPoiCategory(category).description);
  }, [category]);

  const guideposts = warningMsg && warningMsg.itinerary ?
    warningMsg.itinerary.guideposts : [];

  const addItineraryItems = (insertPoi, itinerary) => (
    <>
      <ItineraryTable noTotals noDetails fullKm select 
        insert={insertPoi} insertInfo={itineraryInfo} 
        insertNear={[itineraryNear, setItineraryNear]} 
        insertAfter={[itineraryAfter, setItineraryAfter]}
        itinerary={itinerary} />

      <FormText value={[itineraryInfo, setItineraryInfo]} itemClassName="form"
        valueName="itineraryInfo" valueLabel={
          <span>Voliteľný popis v itineráry 
            {" "}<span data-tooltip="Popis by mal byť stručný. Ak sa líši podľa smeru putovanie, použij formát: [vľavo smerom od Dukly | vpravo smerom od Devína], prípadne [pred], [za], [vľavo], [vpravo] smerom od Dukly.">
              <i className="fas fa-info-circle"/>
            </span>:</span>}/>
    </> 
  );

  return (
    <FormWithLoader formId="add-poi" title={props.edit ? "Upraviť dôležité miesto" : "Pridať dôležité miesto" }
      submitText={props.edit ? "Upraviť" : (warningMsg ? "Naozaj pridať" : "Pridať")}
      onSubmit={addPoi} loading={loading} errorMsg={errorMsg} errorMsgFirst={errorMsgFirst} successMsg={successMsg} description={!props.edit && (
      <>
        <p>Pomôž nám vytvoriť databázu dôležitých miest a zberaj body z terénu. Vďaka dôležitým miestam,
          ktoré spolu vytvoríme budú pútnici vedieť kde je na Ceste voda či útulňa a teda kde môžu doplniť energiu.
        </p>

        <p>A pozor taktiež prvým štyrom, ktorí pridajú 7 bodov pošleme <a target="_blank" href="https://www.martinus.sk/?uItem=732609&z=RM0I28&utm_source=z%3DRM0I28&utm_medium=url&utm_campaign=partner">knihu Moje Cesta hrdinů SNP</a> od Václava Kerbera.
        Knihu je možné zakúpiť aj v bežných kníhkupectvách ako <a target="_blank" href="https://www.martinus.sk/?uItem=732609&z=RM0I28&utm_source=z%3DRM0I28&utm_medium=url&utm_campaign=partner">martinus.sk</a> a iné.</p>
      </>
      )}>

      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsgFirst} itemClassName="form"/>

      <FormSelect value={[category, setCategory]} valueName="category" valueLabel="Kategória" 
        options={PoiCategories.filter(c => !c.hidden)} itemClassName="form">
        <option value=" " label="-- vyber --" />
      </FormSelect>
      <p>{categoryDescription || <>&nbsp;</>}</p>
      
      {category != "krcma_jedlo" && <FormCheckBox value={[food, setFood]} valueName="food" valueLabel="jedlo" itemClassName="form-checkbox" labelClassName="form-checkbox"/>}
      {category != "pramen" && <FormCheckBox value={[water, setWater]} valueName="water" valueLabel="voda" itemClassName="form-checkbox" labelClassName="form-checkbox"/>}

      <FormText value={[name, setName]} valueName="name" valueLabel="Meno" itemClassName="form"/>
      <FormTextArea value={[text, setText]} valueName="text" valueLabel="Popis" itemClassName="form"/>

      <FormImage value={[image, setImage]} imageAlt="nahrana fotka miesta" />

      {!!props.edit && newPoi && addItineraryItems(newPoi, newPoi.guideposts)}
      {!!props.edit && <FormText value={[note, setNote]} valueName="note" valueLabel="Poznámka" itemClassName="form"/>}
    
      {!!warningMsg && (
        <div className="warningMsg">
          {!!warningMsg.distance && <h4>Miesto je príliš ďaleko od cesty SNP: {(warningMsg.distance/1000).toFixed(1)} km</h4>}
          {!!warningMsg.pois && <h4>Skontroluj blízke dôležité miesta kvôli možnej duplicite:</h4>  }
          
          <Map use="add-poi-map" view={{ lat: warningMsg.lat, lon: warningMsg.lon, zoom: warningMsg.zoom }}
            marker={{ lat: warningMsg.lat, lon: warningMsg.lon, name: "nové miesto", accuracy: warningMsg.poi.accuracy }} 
            pois={warningMsg.pois} guideposts={guideposts} showDeleted />

          {!!warningMsg.pois && <PoiList pois={warningMsg.pois} showDeleted />}
          
          {!!warningMsg.itinerary && (
            <>
              <h4>Skontroluj a prípadne uprav umiestnení a popis v itinerári:</h4> 

              {addItineraryItems(warningMsg.poi, guideposts)}                     
            </>
          )}
        </div>
      )}
    </FormWithLoader>
  )
}
export default PoiForm;