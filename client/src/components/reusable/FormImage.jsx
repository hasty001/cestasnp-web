import React, { useState } from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import CloudinaryWidget from './CloudinaryWidget';
import ImageBox from './ImageBox';

const FormImage = (props) => {

  const [imageVisible, setImageVisible] = useState(false);
  const [value, setValue] = useStateProp(props.value);
  
  var image = null;
  var imagePreview = null;

  if (value && value != "None") {
    if (typeof value == "string") {
      
      image = value.indexOf('res.cloudinary.com') === -1 
        ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${value}`
        : value;

      imagePreview = image;

    } else {
      if (value.eager && value.eager.length > 0) {
        imagePreview = value.eager[0].secure_url;
        image = value.secure_url;
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
        updateImageDetails={setValue}
        btnTxt={value ? "Nahraj inú fotku" : "Nahraj fotku"}
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