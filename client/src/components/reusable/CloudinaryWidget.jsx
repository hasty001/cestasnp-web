import React, { useEffect, useState } from 'react';
import { fetchPostJson } from '../../helpers/fetchUtils';
import * as Constants from '../Constants';

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

const CloudinaryWidget = ({ uid, imageId, updateImageDetails, btnTxt, type }) => {
  const [widget, setWidget] = useState();

  useEffect(() => {
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
        public_id: `${uid}_${imageId || Date.now()}`,
        clientAllowedFormats: ['png', 'jpg', 'jpeg']
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          updateImageDetails(result.info);
        } else if (error) {
          updateImageDetails('');
        }
      }
    );

    setWidget(myWidget);
  }, [imageId]);

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
    <button
      type="button"
      id="upload_widget"
      className="snpBtnWhite"
      onClick={openWidget}
    >
      {' '}
      {btnTxt}
    </button>
  );
}

export default CloudinaryWidget;
