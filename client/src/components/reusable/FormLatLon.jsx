import React, { useEffect, useState } from 'react';
import DivWithLoader from './DivWithLoader';
import FormItem from './FormItem';
import * as Constants from '../Constants';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { useStateProp } from '../../helpers/reactUtils';
import * as Texts from '../Texts';
import { logDev } from '../../helpers/logDev';
import Map from '../Map';
import { Button, Modal } from 'react-bootstrap';

const FormLatLon = (props) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useStateProp(props.value, { latlon: '', accuracy: 0});
  const [edit, setEdit] = useStateProp(props.edit);
  const [mapSelect, setMapSelect] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: '', lon: '', accuracy: 0});

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

      <button className="snpBtn" onClick={getMyPosition} type="button">
        Načítať automaticky
      </button>
      <button className="snpBtnWhite" onClick={() => { var latlon = parseGPSPos(value.latlon) || [0, 0]; setMapCenter({ lat: latlon[0], lon: latlon[1], zoom: latlon[0] ? 13 : 0 }); setMapSelect(true); }} type="button">
        Vybrať na mape
      </button>

      <Modal show={mapSelect}
          onHide={() => setMapSelect(false)}
          dialogClassName="map-dialog" >
          <Modal.Header closeButton>
            <Modal.Title>
              Vyber polohu
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Map use="select-pos-map" view={[mapCenter, setMapCenter]} tilesNew>
              <i className="fas fa-map-marker-alt map-pos"/>
            </Map>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => { setValue({ latlon: mapCenter.lat.toFixed(6) + ", " + mapCenter.lon.toFixed(6), accuracy: 0 }); setMapSelect(false); }}>Vybrať</Button>
          </Modal.Footer>
        </Modal>
    </DivWithLoader>
  )
}
export default FormLatLon;