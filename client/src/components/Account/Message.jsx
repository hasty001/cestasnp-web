import React, { useState } from 'react';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import FormWithLoader from '../reusable/FormWithLoader';
import FormLatLon from '../reusable/FormLatLon';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';

const Message = (props) => {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [gps, setGps] = useState({ latlon: '', accuracy: 0 });
  const [gpsEdit, setGpsEdit] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');

  const clearMsg = () => {
    setErrorMsg('');
    setSuccessMsg('');
  }

  const sendMessage = () => {
    if (!message || message.trim().length === 0) {
      setErrorMsg('Správa nemôže ostať prázdna.');
      return;
    }

    var latlon = parseGPSPos(gps.latlon);

    if (
      !gps.latlon ||
      gps.latlon.trim().length === 0 ||      
      !latlon
    ) {
      setErrorMsg('GPS súradnice majú nesprávny formát.');
      return;
    }
     
    setLoading(true);
    clearMsg();

    const data = {};
    data.lon = latlon[1].toFixed(6);
    data.lat = latlon[0].toFixed(6);
    data.accuracy = gps.accuracy;
    data.text = message;
    data.user_id = props.userId;
    data.img = image;
    data.details_id = props.travellerId;

    fetchPostJsonWithToken(props.traveller.user, '/api/traveller/sendMessage', data)
      .then(msgRes => {
        setLoading(false);

        if (msgRes.error) { throw msgRes.error; }
         
        clearMsg();
        setSuccessMsg('Správa úspešne poslaná!');

        props.updateTravellerMsgs(msgRes);

        setGpsEdit(false);
        setGps({ latlon: '', accuracy: 0 });
        setMessage('');
        setImage(''); 
      })
      .catch(e => {
        console.error('Send message error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  return (
    <FormWithLoader formId="MessageForm" title="Poslať správu" submitText="Poslať správu"
      onSubmit={sendMessage} loading={loading} errorMsg={errorMsg} successMsg={successMsg}>
      
      <FormLatLon value={gps} edit={gpsEdit} onEdit={setGpsEdit} onChange={value => { setGps(value); clearMsg(); }} onError={setErrorMsg}/>

      <FormTextArea value={message} valueName="message" valueLabel="Text" onChange={value => { setMessage(value); clearMsg(); }}/>

      <FormImage value={image} onChange={value => { setImage(value); clearMsg(); }} imageAlt="nahrana fotka z cesty" />
    </FormWithLoader>
  );
}

export default Message;
