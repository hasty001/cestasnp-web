import React from 'react';
import { Modal } from 'react-bootstrap';
import { fixImageUrl } from '../../helpers/helpers';

const ImageBox = ({ url, show, onHide }) => (
  <Modal
    id="ImageBox"
    show={show}
    onHide={onHide}
    dialogClassName="travellerPhotoModal"
  >
    <Modal.Body>
      <img src={fixImageUrl(url)} width="100%" />
    </Modal.Body>
  </Modal>
);

export default ImageBox;
