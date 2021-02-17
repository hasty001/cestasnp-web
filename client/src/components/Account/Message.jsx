import React, { useState } from 'react';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import FormWithLoader from '../reusable/FormWithLoader';
import FormLatLon from '../reusable/FormLatLon';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';
import { useStateEx, useStateWithSessionStorage } from '../../helpers/reactUtils';
import * as Constants from '../Constants';

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
  
  const [gps, setGps] = useStateWithSessionStorage('message-draft.gps', { latlon: '', accuracy: 0 }, clearMsg);
  const [gpsEdit, setGpsEdit] = useStateEx(false, clearMsg);
  const [message, setMessage] = useStateWithSessionStorage('message-draft.message', '', clearMsg);
  const [image, setImage] = useStateWithSessionStorage('message-draft.image', '', clearMsg);
  const [imageId, setImageId] = useState(Date.now());

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
    data.user_id = props.userData.userDetails.uid;
    data.img = image;
    data.details_id = props.userData.travellerDetails._id;

    fetchPostJsonWithToken(props.userData.user, '/api/traveller/sendMessage', data)
      .then(msgRes => {
        setLoading(false);

        setGpsEdit(false);
        setGps({ latlon: '', accuracy: 0 });
        setMessage('');
        setImage('');
        setImageId(Date.now());

        setSuccessMsg('Správa úspešne poslaná!');

        props.messageAdded(msgRes);
      })
      .catch(e => {
        console.error('Send message error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  return (
    <FormWithLoader formId="MessageForm" title="Poslať správu" submitText="Poslať správu"
      onSubmit={sendMessage} loading={loading} error={errorMsg} success={successMsg} errorFirst={errorMsgFirst}>
      
      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsgFirst}/>

      <FormTextArea value={[message, setMessage]} valueName="message" valueLabel="Text" />
      
      <FormImage value={[image, setImage]} imageAlt="nahrana fotka z cesty" uid={props.userData.userDetails.uid} 
        type={Constants.ImageType.LiveSledovanie} imageId={imageId}/>
    </FormWithLoader>
  );
}

export default Message;
