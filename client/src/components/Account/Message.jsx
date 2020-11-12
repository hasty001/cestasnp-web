import React, { useState } from 'react';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import FormWithLoader from '../reusable/FormWithLoader';
import FormLatLon from '../reusable/FormLatLon';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';
import { useStateEx } from '../../helpers/reactUtils';

const Message = (props) => {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorMsgFirst, setErrorMsgFirst] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMsg = () => {
    setErrorMsg('');
    setErrorMsgFirst('');
    setSuccessMsg('');
  }
  
  const [gps, setGps] = useStateEx({ latlon: '', accuracy: 0 }, clearMsg);
  const [gpsEdit, setGpsEdit] = useStateEx(false, clearMsg);
  const [message, setMessage] = useStateEx('', clearMsg);
  const [image, setImage] = useStateEx('', clearMsg);

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

        setGpsEdit(false);
        setGps({ latlon: '', accuracy: 0 });
        setMessage('');
        setImage(''); 

        setSuccessMsg('Správa úspešne poslaná!');

        props.updateTravellerMsgs(msgRes);
      })
      .catch(e => {
        console.error('Send message error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  return (
    <FormWithLoader formId="MessageForm" title="Poslať správu" submitText="Poslať správu"
      onSubmit={sendMessage} loading={loading} errorMsg={errorMsg} successMsg={successMsg} errorMsgFirst={errorMsgFirst}>
      
      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsgFirst}/>

      <FormTextArea value={[message, setMessage]} valueName="message" valueLabel="Text" />
      
      <FormImage value={[image, setImage]} imageAlt="nahrana fotka z cesty" />
    </FormWithLoader>
  );
}

export default Message;
