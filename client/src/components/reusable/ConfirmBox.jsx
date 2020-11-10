import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const ConfirmBox = ({ title, text, confirmText, show, onConfirm, onHide, children }) => (
  <Modal
    id="ConfirmBox"
    show={show}
    onHide={onHide}
    dialogClassName="confirm-box"
  >
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{text}{children}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Nie
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        {confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmBox;
