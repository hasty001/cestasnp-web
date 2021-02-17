import React, { useEffect, useState } from 'react';
import Message from './Message';
import Messages from './Messages';
import * as Constants from '../Constants';
import * as Texts from '../Texts';
import PageWithLoader from '../reusable/PageWithLoader';
import DivWithLoader from '../reusable/DivWithLoader';
import { fetchJson } from '../../helpers/fetchUtils';

const SendMessage = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    var cancelled = false;

    setLoading(true);
    setError('');

    fetchJson(`/api/traveller/messages/${props.userData.userDetails.uid}`)
    .then(data => {
      if (cancelled) {
        return;
      }

      data.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
      setMessages(data);
    })
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));

    return () => cancelled = true;
  }, []);

  const messageAdded = (msg) => {
    const msgs = messages.map(m => m);

    msgs.splice(0, 0, msg);

    setMessages(msgs);
  }

  return (
    <PageWithLoader pageId="SendMessage" pageTitle={`Poslať správu${Constants.WebTitleSuffix}`}>
      <Message
        userData={props.userData}
        messageAdded={messageAdded}
      />
      <DivWithLoader loading={loading} error={error}>
        <Messages messages={messages} updateMessages={msgs => setMessages(msgs)} userData={props.userData} />
      </DivWithLoader>
    </PageWithLoader>
    );
}

export default SendMessage;
