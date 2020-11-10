import React, { useState } from 'react';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import { useStateEx } from '../../helpers/reactUtils';
import ConfirmBox from './ConfirmBox';
import FormText from './FormText';
import * as Texts from '../Texts';

const DeletePoiBox = ({ uid, user, poi, onUpdate, onHide, show }) => {
  const [note, setNote] = useStateEx('', () => setErrorMsg(''));
  const [errorMsg, setErrorMsg] = useState('');
  
  const confirm = () => {
    setErrorMsg('')

    if (!note || !note.trim()) {
      setErrorMsg('Poznámka nemôže ostať prázdna.');
      return;
    }

    fetchPostJsonWithToken(user, '/api/pois/delete', { uid, id: poi._id, note })
    .then(res => {
      setNote('');
      onUpdate(Object.assign({ successMsg: "Dôležité miesto bolo uspešne zmazané." }, res));
    })
    .catch(error => { console.error(error); onUpdate(Object.assign({ errorMsg: Texts.GenericError }, poi)) })
    .finally(() => onHide());
  };

  return (
    <ConfirmBox show={show} onHide={onHide} onConfirm={confirm} title="Zmazať dôležité miesto" confirmText="Zmazať"
    text="Naozaj chcete zmazať toto dôležité miesto?">
      {!!errorMsg && <div className="errorMsg">{errorMsg}</div>}
      <FormText value={[note, setNote]} valueName="note" valueLabel="Poznámka"/>
    </ConfirmBox>
  )
}

export default DeletePoiBox;