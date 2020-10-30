import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import CloudinaryWidget from './CloudinaryWidget';
import Image from './Image';

const FormImage = (props) => {

  const [value, setValue] = useStateProp(props.value);

  return (
    <>
      <Image value={image} alt={props.imageAlt}>
      <CloudinaryWidget
        uid={props.userId}
        updateImageDetails={setValue}
        btnTxt={value ? "Nahraj inú fotku" : "Nahraj fotku"}
        />
      </Image>
    </>
  )
}
export default FormImage;