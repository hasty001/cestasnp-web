import React, { useEffect, useState } from 'react';
import DivWithLoader from './DivWithLoader';
import FormItem from './FormItem';
import * as Constants from '../Constants';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { useStateProp } from '../../helpers/reactUtils';
import * as Texts from '../Texts';
import { logDev } from '../../helpers/logDev';

const FormLatLon = (props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useStateProp(props.value, { latlon: '', accuracy: 0});
  const [edit, setEdit] = useStateProp(props.edit);

  const getMyPosition = () => {

    setLoading(true);
    (props.onError || (() => {}))('');

    const options = {
      timeout: 8000,
      enableHighAccuracy: true,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLoading(false);

        var lat = coords.latitude.toFixed(6);
        var lon = coords.longitude.toFixed(6);

        if (coords.accuracy > Constants.MaxAllowedGPSAccuracy) {
          console.error('low GPS accuracy ', coords.accuracy);
          (props.onError || (() => {}))(Texts.GpsLowAccuracyError(lat, lon));
        } else {
          setEdit(false);
          setValue({ latlon: lat + ", " + lon, accuracy: coords.accuracy });
        }
      },
      err => {
        setLoading(false);
        console.error('err ', err.message);

        (props.onError || (() => {}))(Texts.GpsError);
      },
      options
    );
  }

  const verifyGPSFormat = ({ target }) => {
    const { value } = target;

    if (value === '') {
      return;
    }

    if (!parseGPSPos(value)) {
      (props.onError || (() => {}))('GPS súradnica má nesprávny formát.');
      return;
    }
  }

  return (    
    <DivWithLoader loading={loading}>
      <FormItem valueName="latlon" valueLabel="Zem. šírka, dĺžka (latitude, longitude)" 
        value={value ? value.latlon : ''} useEdit 
        edit={[edit, setEdit]}>
          <input
            className={props.itemClassName}
            id="latlon"
            name="latlon"
            value={value ? value.latlon : ''}
            onBlur={e => {
              e.preventDefault();
              verifyGPSFormat(e);
            }}
            onChange={e => setValue({ latlon: e.target.value, accuracy: 0 })}
            />
      </FormItem>

      <button className="snpBtnWhite" onClick={getMyPosition} type="button">
        Získaj pozíciu
      </button>
    </DivWithLoader>
  )
}
export default FormLatLon;