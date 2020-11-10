import React from 'react';
import { Modal } from 'react-bootstrap';
import PoiForm from '../Account/PoiForm';

const EditPoiBox = ({ uid, user, poi, onUpdate, onHide, show }) => {
  return (
    <Modal
    id="EditPoiBox"
    show={show}
    onHide={onHide}
    dialogClassName="edit-poi-box"
  >
    <Modal.Header closeButton>
    </Modal.Header>
    <Modal.Body>
      <PoiForm edit uid={uid} user={user} poi={poi} onUpdate={(poi) => { onUpdate(poi); onHide(); }}/>
    </Modal.Body>
  </Modal>
  )
}

export default EditPoiBox;