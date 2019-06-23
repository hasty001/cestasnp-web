import React from 'react';

const generateSignature = (callback, params_to_sign) => {
    console.log('params to sign ', params_to_sign)
    
    fetch('/api/cloudinary/generateSignature', {
        method: 'POST',
        body: JSON.stringify(params_to_sign),
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
    })
    .then(res => res.json())
    .then(signature => {
        callback(signature)
    })
    .catch(err => {
        console.error('cloudinary err ', err)
    })
}

const myWidget = cloudinary.createUploadWidget({
  cloudName: 'cestasnp-sk', 
  apiKey: '186532245374812',
  uploadSignature: generateSignature,
  sources: ['local', 'camera'],
  multiple: false,
  resourceType: "image",
  cropping: false,
  folder: "testovanie",
  public_id: "hola" + Date.now(),
  clientAllowedFormats: ["png","jpg","jpeg"]
}, (error, result) => { 
    if (!error && result && result.event === "success") { 
        console.log('Done! Here is the image info: ', result.info); 
    } else {
        console.log('Error ', error);
    }
  }
)

const openWidget = () => {
    console.log(process.env.CLOUD_NAME)
    console.log(process.env.CLOUDIN_PUB)
    myWidget.open()
}

export default () => <button id="upload_widget" className="cloudinary-button" onClick={openWidget}>Nahraj fotku</button>



