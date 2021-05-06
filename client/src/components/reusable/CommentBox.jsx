import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Recaptcha from 'react-recaptcha';
import Loader from './Loader';
import { AuthContext } from '../AuthContext';
import UserLabel from './UserLabel';
import { logDev } from '../../helpers/logDev';
import loadScriptOnce from 'load-script-once';
import * as Texts from '../Texts';
import { useStateEx, useStateWithSessionStorage, useStateWithLocalStorage } from '../../helpers/reactUtils';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';

const CommentBox = (props) => {
  const authData = useContext(AuthContext);

  const [comment, setComment] = useStateWithSessionStorage(
    `comment-draft_${props.travellerId}_${props.articleID}.comment`, '', () => setCommentError(''));
  const [name, setName] = useStateWithLocalStorage('comment-draft.name', '', () => setNameError(''));
  const [captcha, setCaptcha] = useStateEx('', () => setCaptchaError(''));
  
  const [loading, setLoading] = useState(false);
  const [recaptchaWidget, setRecaptchaWidget] = useState(null);

  const [captchaError, setCaptchaError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    var cancelled = false;

    if (!authData.isAuth && props.show) {
      loadScriptOnce('https://www.google.com/recaptcha/api.js')
      .then(() => {
        if (cancelled) {
          return;
        }

        setRecaptchaWidget((
          <Recaptcha
            render="explicit"
            verifyCallback={verifyCallback}
            onloadCallback={onloadCallback}
            expiredCallback={expiredCallback}
            sitekey="6LdmY1UUAAAAAOi_74AYzgrYCp-2fpusucy1lmrK"
            hl="sk"
            size={window.innerWidth <= 390 ? 'compact' : 'normal'}/>));
      })
      .catch(error => {
        console.error(error);

        setRecaptchaWidget(<p className="commentError">{Texts.GenericError}</p>);
      });
    }

    return () => cancelled = true;
  }, [props.show, authData.isAuth]);

  const onloadCallback = () => {
    logDev('captcha loaded');
  };

  const addComment = () => {
    setNameError('');
    setCommentError('');
    setCaptchaError('');
    
    if (!authData.isAuth && !captcha) {
      setCaptchaError('Prosím potvrď, že nie si robot');
      return;
    }

    if (!authData.isAuth && (!name || !name.trim())) {
      setNameError('Prosím vyplň svoje meno');
      return;
    }

    if (!comment || !comment.trim()) {
      setCommentError('Prosím napíš komentár');
      return;
    }

    setLoading(true);

    const data = {};
    data.comment = comment;
    data.name = !authData.isAuth ? name : 
      (authData.travellerDetails && authData.travellerDetails.meno) ?
      authData.travellerDetails.meno : authData.userDetails.name;
    data.articleId = props.articleID;
    data.travellerName = props.travellerName;
    data.travellerId = props.travellerId;
    data.findBuddiesId = props.findBuddiesId;
    data['g-recaptcha-response'] = captcha;
    data.uid = authData.isAuth ? authData.userDetails.uid : null;

    const user = authData.isAuth ? authData.user
      : { getIdToken: () => Promise.resolve("") };

    fetchPostJsonWithToken(user, '/api/traveller/addComment', data)
    .then(comment => {
      if (comment.error) {
        setCaptchaError(Texts.GenericError);
      } else if (comment.responseError) {
        setCaptchaError('Prosím potvrď, že nie si robot');
      } else {
        setComment('');
        setCaptchaError('');

        props.updateTravellerComments(comment);
        props.onHide();
      }
     })
    .catch(err => {
      console.error(err);

      setCaptchaError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  const verifyCallback = (response) => {
    setCaptcha(response);
  }

  const updateName = (e) => {
    e.preventDefault();
    setName(e.target.value);
  }

  const updateComment = (e) => {
    e.preventDefault();
    setComment(e.target.value);
  }

  const expiredCallback = () => {
    setCaptcha('');
  }

  const { userData, articleID, visitorIp, 
    updateTravellerComments, travellerId, travellerName, ...modalProps } = props;

  return (
    <Modal id="CommentBox" {...modalProps} dialogClassName="comment-box">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
          Tvoj komentár
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {!!loading && <Loader />}
      {!loading && (
        <>
          <label className="commentLabel">    
            Meno:            
            {!authData.isAuth ?
              <input value={name} onChange={updateName} className="nameInput"/>
              : (<div>
                    <UserLabel uid={authData.travellerDetails.user_id} 
                      name={(authData.travellerDetails && authData.travellerDetails.meno) ?
                        authData.travellerDetails.meno : authData.userDetails.name} />
                </div>)
            }
          </label>
          {!!nameError && <p className="commentError">{nameError}</p>}
          <label className="commentLabel">
            Komentár:
            <textarea value={comment} onChange={updateComment} className="commentInput"/>
          </label>
          {!!commentError && <p className="commentError">{commentError}</p>}
          {!authData.isAuth &&
            (<div className="recaptchaWrapper">
              <Suspense fallback={<Loader/>}>
                {recaptchaWidget}
              </Suspense>
            </div>)}
          {!!captchaError && <p className="commentError">{captchaError}</p>}
        </>)}
      </Modal.Body>
      <Modal.Footer>
        {!loading && <Button onClick={addComment}>Pridaj komentár</Button>}
      </Modal.Footer>
    </Modal>);
}

export default CommentBox;
