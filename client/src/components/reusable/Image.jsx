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
    image = fixImageUrl(props.value);

    imagePreview = props.small ? fixImageUrl(image, 'c_fill,f_auto,g_auto,w_240,h_240') 
      : props.large ? fixImageUrl(image, 'c_limit,f_auto,w_800,h_800')
        : fixImageUrl(image, 'c_limit,f_auto,w_400,h_400');
  }

  return (
    <LazyLoadComponent visibleByDefault={props.forceVisible} placeholder={image ? (<img
      className={`${props.itemClassName || 'image-preview'}`}
      width={props.small ? 240 : ""}
      height={props.small ? 240 : ""}
  />) : <span/>}>
      {!!image && (
        <A href={image} onClick={(e) => { if (isNormalClickEvent(e)) { e.preventDefault(); setImageVisible(true); } }}>
          <img
            className={`${props.itemClassName || 'image-preview'}`}
            src={imagePreview}
            alt={props.alt}
            width={props.small ? 240 : ""}
            height={props.small ? 240 : ""}
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