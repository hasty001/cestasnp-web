import React from 'react';
import { Modal } from 'react-bootstrap';
import { fixImageUrl } from '../../helpers/helpers';

const ImageBox = ({ url, show, onHide }) => {
  var maxSize = Math.max(800, window.innerWidth, window.innerHeight);
  if (maxSize > 800) {
    maxSize = 1200;
  }

  return (<Modal
    id="ImageBox"
    show={show}
    onHide={onHide}
    dialogClassName="travellerPhotoModal"
  >
    <Modal.Body onClick={onHide}>
      <img src={fixImageUrl(url, `c_limit,w_${maxSize},h_${maxSize},f_auto`, `tr=w-${maxSize},h-${maxSize},c-at_max`)} width="100%" />
    </Modal.Body>
  </Modal>
);}

export default ImageBox;
