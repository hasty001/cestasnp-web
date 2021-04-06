import React, { useState } from 'react';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import ConfirmBox from '../reusable/ConfirmBox';
import TravellerMessage from '../reusable/TravellerMessage';
import * as Texts from '../Texts';

const Messages = ({ messages, updateMessages, userData }) => {

  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [showConfirmDeleteMessage, setShowConfirmDeleteMessage] = useState(false);

  const handleDeleteMessageClick = (event) => {
    event.preventDefault();

    setDeleteMessageId(event.currentTarget.dataset.msgid);
    setShowConfirmDeleteMessage(!!event.currentTarget.dataset.msgid);
  }

  const handleDeleteMessage = (confirmed) => {
    if (!confirmed) {
      setShowConfirmDeleteMessage(false);
      return;
    }

    const updatedMessages = messages;

    var error = "";
    var success = "";

    fetchPostJsonWithToken(userData.user, '/api/traveller/deleteMessage', { 
      id: deleteMessageId, 
      uid: userData.userDetails.uid })
    .then(msg => {
      if (msg.error) {
        throw msg.error;
      } else {
        success = 'Správa bola uspešne zmazaná.';
      }
    })
    .catch(err => {
      console.error(err);
      error = Texts.GenericError;
    }).then(() =>
    {
      updatedMessages.forEach(msg => {
          msg.error = msg._id === deleteMessageId ? error : "";
          msg.success = msg._id === deleteMessageId ? success : "";
          msg.deleted = msg.deleted || (msg._id === deleteMessageId && success);
        });
      
      updateMessages(updatedMessages);
      setShowConfirmDeleteMessage(false);
    });
  }

  return (
    <div id="Messages" className="thinRedWrap">
      <h2>Moje správy</h2>
      {(messages || []).map(message =>
        <TravellerMessage key={message._id} message={message} travellerName={userData.travellerDetails.meno}
          userData={userData} travellerUserId={userData.userDetails.uid} deleteMessage={handleDeleteMessageClick} />)}

      <ConfirmBox
        title="Zmazať správu"
        text="Naozaj chcete zmazať túto správu?"
        confirmText="Zmazať"
        show={showConfirmDeleteMessage}
        onConfirm={() => handleDeleteMessage(true)}
        onHide={() => handleDeleteMessage(false)}
      />
    </div>
  );
}

export default Messages;
