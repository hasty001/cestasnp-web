import React, { useState } from 'react';
import { fixImageUrl } from '../../helpers/helpers';
import ImageBox from './ImageBox';
import { A, isNormalClickEvent } from './Navigate';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

const Image = (props) => {

  const [imageVisible, setImageVisible] = useState(false);
  
  var image = null;
  var imagePreview = null;

  if (props.value && props.value != "None") {
    if (typeof props.value == "string") {  
      image = fixImageUrl(props.value.indexOf('res.cloudinary.com') === -1 
        ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${props.value}`
        : props.value, 'f_auto');
    } else {
      image = fixImageUrl(props.value.secure_url, 'f_auto');
    }

    imagePreview = props.small ? fixImageUrl(image, 'c_fill,f_auto,w_240,h_240') 
      : props.large ? fixImageUrl(image, 'c_limit,f_auto,w_800,h_800')
        : fixImageUrl(image, 'c_limit,f_auto,w_400,h_400');
  }

  return (
    <LazyLoadComponent>
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
    </LazyLoadComponent>
  )
}
export default Image;