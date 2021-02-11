import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import PoiForm from '../Account/PoiForm';
import * as Texts from '../Texts';

const EditPoiBox = ({ uid, user, poi, onUpdate, onHide, show }) => {
  
  const [changed, setChanged] = useState(false);

  return (
    <Modal
    id="EditPoiBox"
    show={show}
    onHide={() => changed ? (window.confirm(Texts.LeaveNotSavedWarning) ? onHide() : false) : onHide()}
    dialogClassName="edit-poi-box"
  >
    <Modal.Header closeButton>
    </Modal.Header>
    <Modal.Body>
      <PoiForm edit uid={uid} user={user} poi={poi} onChanged={setChanged} onUpdate={(poi) => { onUpdate(poi); onHide(); }}/>
    </Modal.Body>
  </Modal>
  )
}

export default EditPoiBox;