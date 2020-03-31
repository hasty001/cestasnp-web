import React from 'react';
import { Modal } from 'react-bootstrap';

const ImageBox = ({ url, show, onHide }) => (
  <Modal
    id="ImageBox"
    show={show}
    onHide={onHide}
    dialogClassName="travellerPhotoModal"
  >
    <Modal.Body close>
      <img src={url} width="100%" />
    </Modal.Body>
  </Modal>
);

export default ImageBox;
