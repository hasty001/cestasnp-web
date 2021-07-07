import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import CloudinaryWidget from './CloudinaryWidget';
import ImageKitUpload from './ImageKitUpload';
import Image from './Image';

const FormImage = (props) => {

  const [value, setValue] = useStateProp(props.value);

  return (
    <>
      <Image value={value} alt={props.imageAlt} itemClassName={props.itemClassName} small forceVisible>
      {!props.imagekit ? (
        <CloudinaryWidget
          uid={props.uid} type={props.type} imageId={props.imageId}
          updateImageDetails={setValue}
          btnTxt={(value && value != 'None') ? "Nahraj inú fotku" : "Nahraj fotku"}
          />
      ) : (
        <ImageKitUpload
          uid={props.uid} type={props.type} imageId={props.imageId}
          updateImageDetails={setValue}
          btnTxt={(value && value != 'None') ? "Nahraj inú fotku" : "Nahraj fotku"}
          />
      )}
      </Image>
    </>
  )
}
export default FormImage;