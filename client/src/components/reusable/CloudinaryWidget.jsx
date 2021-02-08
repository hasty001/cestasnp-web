import React, { useEffect, useState } from 'react';
import { fetchPostJson } from '../../helpers/fetchUtils';
import * as Constants from '../Constants';
import loadScriptOnce from 'load-script-once';
import Loader from './Loader';

const getPreset = (type) => {
  switch (type) {
    case Constants.ImageType.LiveSledovanie:
      return 'eo9nitmv';
    case Constants.ImageType.DolezitaMiesta:
      return 'dgdqau2u';
    case Constants.ImageType.Clanky:
      return 'khokhgj9';
  }

  return 'eo9nitmv';
}

const getTags = (type) => {
  switch (type) {
    case Constants.ImageType.LiveSledovanie:
      return ['live_sledovanie'];
    case Constants.ImageType.DolezitaMiesta:
      return ['dolezita_miesta'];
    case Constants.ImageType.Clanky:
      return ['clanky'];
  }
  return [];
}

const CloudinaryWidget = ({ uid, imageId, updateImageDetails, btnTxt, type, show }) => {
  const [widget, setWidget] = useState();
  const [showing, setShowing] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    if (uid && imageId && !error) {
      setLoading(true);
      loadScriptOnce('https://widget.cloudinary.com/v2.0/global/all.js').then(() => {
        const myWidget = cloudinary.createUploadWidget({
            cloudName: 'cestasnp-sk',
            apiKey: '186532245374812',
            uploadSignature: generateSignature,
            uploadPreset: getPreset(type),
            sources: ['local', 'camera'],
            multiple: false,
            maxImageWidth: 1600,
            maxImageHeight: 1600,
            resourceType: 'image',
            cropping: false,
            tags: getTags(type),
            public_id: `${uid}_${Date.now()}`,
            clientAllowedFormats: ['png', 'jpg', 'jpeg']
          },
          (e, result) => {
            if (!e && result && result.event === 'success') {
              updateImageDetails(result.info);
            } else if (e) {
              console.error(e);
              updateImageDetails('');
            }
          }
        );

        setWidget(myWidget);
        setLoading(false);
      }).catch(error => {
        setLoading(false);
        console.error(error);

        setError(<>Nepodarilo sa nahrať doplnok na nahrávanie fotiek - <a href="#" onClick={() => setError(null)}>skúsiť znova</a>.</>);
      });
    }
  }, [uid, imageId, error]);

  useEffect(() => {
    if (widget) {
      if (!show) {
        widget.close(true);
      } else {
        if (show && showing != imageId) {
          setShowing(imageId);
          widget.open();
        }
      }
    }
  }, [widget, show, imageId]);

  const generateSignature = (callback, params_to_sign) => {
    fetchPostJson('/api/cloudinary/generateSignature', params_to_sign)
      .then(signature => {
        callback(signature);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const openWidget = () => {
    widget.open();
  };

  return (
    <>
      {error ? <div className="errorMsg">{error}</div> 
      : loading ? <Loader/>
        : btnTxt ? (
        <button
          type="button"
          id="upload_widget"
          className="snpBtnWhite"
          onClick={openWidget}
        >
          {' '}
          {btnTxt}
        </button>) : null}
    </>
  );
}

export default CloudinaryWidget;
