import React, { useEffect, useState } from 'react';
import * as Constants from '../Constants';
import Loader from './Loader';
import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import Dashboard from '@uppy/dashboard';
import ImageEditor from '@uppy/image-editor';
import skLocale from '@uppy/locales/lib/sk_SK';
import ImageKitUppyPlugin from "../../utils/imagekit-uppy-plugin.esm";
import UppyResizePlugin from './UppyResizePlugin';

const getFolder = (type) => {
  switch (type) {
    case Constants.ImageType.LiveSledovanie:
      return 'sledovanie';
    case Constants.ImageType.DolezitaMiesta:
      return 'mapa';
    case Constants.ImageType.Clanky:
      return 'clanky';
  }

  return 'ostatne';
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

const ImageKitUpload = ({ uid, imageId, updateImageDetails, btnTxt, type, show }) => {
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {

    const uppy = Uppy({ 
      debug: false,
      locale: skLocale,
      allowMultipleUploads: false,
      restrictions: {
        maxFileSize: 20 * 1024 * 1024,
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        allowedFileTypes: ['image/*']
      },
      meta: {
        folder: getFolder(type),
        tags: getTags(type)
      } })
      .use(Dashboard, {
          inline: false,
          trigger: '#upload_widget',
          showProgressDetails: true,
          closeAfterFinish: true,
          animateOpenClose: false,
      })
      .use(ImageKitUppyPlugin, {
          id: 'cestasnp',
          authenticationEndpoint: `/api/imagekit/sign`,
          publicKey: "public_imKvVOuHUpOzrBfP+Inl1QagK/Y="
      })
      .use(ImageEditor, {
        id: 'ImageEditor',
        quality: 0.8,
        target: Dashboard,
        cropperOptions: {
          viewMode: 0,
          background: false,
          responsive: false,
          dragMode: 'none',
          modal: false,
          guides: false,
          center: false,
          highlight: false,
          autoCrop: false,
          movable: false,
          zoomable: false,
        },
        actions: {
          revert: true,
          rotate: true,
          granularRotate: false,
          flip: true,
          zoomIn: false,
          zoomOut: false,
          cropSquare: false,
          cropWidescreen: false,
          cropWidescreenVertical: false
        }
      })
      .use(UppyResizePlugin, { maxSize: 1600, maxFileSize: 2 * 1024 * 1024 });

      uppy.on('complete', result => {
        if (result.successful && result.successful.length == 1) {
          updateImageDetails(result.successful[0].response.body);
          uppy.reset();
          uppy.getPlugin('Dashboard').closeModal();
        } else {
          updateImageDetails('');
        }
      });

      uppy.on('file-added', (file) => {
        file.name = `${uid}_${Date.now()}.${file.extension}`;
        file.meta.name = file.name;
      })
  }, [uid, imageId]);

  return (
    <>
      {error ? <div className="errorMsg">{error}</div> 
      : loading ? <Loader/>
        : btnTxt ? (
        <button
          type="button"
          id="upload_widget"
          className="snpBtnWhite"
        >
          {' '}
          {btnTxt}
        </button>) : null}
    </>
  );
}

export default ImageKitUpload;
