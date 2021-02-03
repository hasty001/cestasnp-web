import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import FormText from './FormText';

const LinkBox = ({ show, url, onConfirm, onDelete, onHide }) => {
  const [value, setValue] = useState(url);

  useEffect(() => {
    setValue(url || "");
  }, [url]);

  return (
    <Modal
      id="LinkBox"
      show={show}
      onHide={onHide}
      dialogClassName="link-box"
    >
      <Modal.Header closeButton>
        <Modal.Title>Odkaz</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormText value={[value, setValue]} valueLabel="Url"/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onDelete}>
          Zmazať
        </Button>
        <Button variant="primary" onClick={() => onConfirm(value)}>
          Použiť
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LinkBox;
