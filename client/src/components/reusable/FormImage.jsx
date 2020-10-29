import React, { useState } from 'react';
import CloudinaryWidget from './CloudinaryWidget';
import ImageBox from './ImageBox';

const FormImage = (props) => {

  const [imageVisible, setImageVisible] = useState(false);
  
  var image = null;
  var imagePreview = null;

  if (props.image && props.image != "None") {
    if (typeof props.image == "string") {
      
      image = props.image.indexOf('res.cloudinary.com') === -1 
        ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${props.image}`
        : props.image;

      imagePreview = image;

    } else {
      if (props.image.eager && props.image.eager.length > 0) {
        imagePreview = props.image.eager[0].secure_url;
        image = props.image.secure_url;
      } 
    }
  }

  return (
    <>
      {!!image && (
        <img
            src={imagePreview}
            alt={props.imageAlt}
            onClick={() => setImageVisible(true)}
        />)}
      <CloudinaryWidget
        uid={props.userId}
        updateImageDetails={props.onChange}
        btnTxt={props.image ? "Nahraj inú fotku" : "Nahraj fotku"}
        />
      <ImageBox
        show={imageVisible}
        onHide={() => setImageVisible(false)}
        url={image}
      />
    </>
  )
}
export default FormImage;