import React from 'react';

export default ({ uid, updateImageDetails }) => {

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
      uploadPreset: 'eo9nitmv',
      sources: ['local', 'camera'],
      multiple: false,
      resourceType: "image",
      cropping: false,
      tags: ['live_sledovanie'],
      public_id: `${uid}_${Date.now()}`,
      clientAllowedFormats: ["png","jpg","jpeg"],
      thumbnailTransformation: [
        { width: 248, height: 140, crop: "fill" }, 
        { width: 800, height: 400, crop: "fill" } ],
    }, (error, result) => { 
        if (!error && result && result.event === "success") { 
            console.log('Done! Here is the image info: ', result.info)
            updateImageDetails(result.info)
        } else {
            console.log('Error ', error)
        }
      }
    )

    const openWidget = (event) => {
        console.log(event)
        console.log(event.target.value)
        myWidget.open()
    } 
    
    return(
        <button id="upload_widget" className="cloudinary-button" onClick={openWidget}>Nahraj fotku</button>
    )
}



