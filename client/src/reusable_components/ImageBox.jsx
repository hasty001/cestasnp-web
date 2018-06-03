import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Loader from '../reusable_components/Loader';

const ImageBox = ({ url, show, onHide }) => (
  <Modal id="ImageBox" show={show} onHide={onHide} dialogClassName="travellerPhotoModal">
    <Modal.Body close>
      <img src={url} width="100%" />
    </Modal.Body>
  </Modal>
);

export default ImageBox;
