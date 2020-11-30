import React, { useState } from 'react';
import ImageBox from './ImageBox';
import { A, isNormalClickEvent } from './Navigate';

const Image = (props) => {

  const [imageVisible, setImageVisible] = useState(false);
  
  var image = null;
  var imagePreview = null;

  if (props.value && props.value != "None") {
    if (typeof props.value == "string") {
      
      image = props.value.indexOf('res.cloudinary.com') === -1 
        ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${props.value}`
        : props.value;

      imagePreview = image;

    } else {
      if (props.value.eager && props.value.eager.length > 0) {
        imagePreview = props.value.eager[0].secure_url;
        image = props.value.secure_url;
      } 
    }
  }

  return (
    <>
      {!!image && (
        <A href={image} onClick={(e) => { if (isNormalClickEvent(e)) { e.preventDefault(); setImageVisible(true); } }}>
          <img
            className={`${props.itemClassName || 'image-preview'}`}
            src={imagePreview}
            alt={props.alt}
        /></A>)}
      {props.children}
      <ImageBox
        show={imageVisible}
        onHide={() => setImageVisible(false)}
        url={image}
      />
    </>
  )
}
export default Image;