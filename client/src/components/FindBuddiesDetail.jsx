import React, { useContext, useEffect, useState } from 'react';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { AuthContext } from './AuthContext';
import { fetchJson, fetchPostJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import PageWithLoader from './reusable/PageWithLoader';
import TravellerItem from './reusable/TravellerItem';
import { A, navigate } from './reusable/Navigate';
import CommentBox from './reusable/CommentBox';
import ConfirmBox from './reusable/ConfirmBox';
import { sortByDate } from '../helpers/helpers';
import TravellerMessage from './reusable/TravellerMessage';

const FindBuddiesDetail = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [messagesData, setMessagesData] = useState([]);
  const [messages, setMessages] = useState([]);

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [showConfirmDeleteComment, setShowConfirmDeleteComment] = useState(false);
  const [orderFromOld, setOrderFromOld] = useState(window.location.search === Constants.FromOldQuery);

  const [traveller, setTraveller] = useState();

  const travellerId = props.match.params.traveller;

  const authData = useContext(AuthContext);

  const fetchData = () => {
    if (!authData.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetchPostJsonWithToken(authData.user, `/api/traveller/findBuddies/${travellerId}`, { uid: authData.userDetails.uid})
    .then((data) => {
      if (!data || !data.user_id) {
        setError("Momentálne partákov nehľadá.");
        return;
      }

      setTraveller(Object.assign({ meno: data.name, user_id: data.user_id, email: data.email }, data));

      return fetchPostJsonWithToken(authData.user, '/api/traveller/comments',
        { uid: authData.userDetails.uid, findBuddiesId: data._id });
    })
    .then(comments => {
      const msgs = comments.map(c => Object.assign({ isComment: true }, c));
      setMessagesData(msgs);
    })
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, [props.match.params.traveller, authData]);

  useEffect(() => {
    if (window.location.hash.length > 1) {
      var highlighted = document.getElementById(window.location.hash.slice(1));
      if (highlighted)
        highlighted.scrollIntoView();
    }
  }, [messages, window.location.hash]);

  const sortMessages = (msgs, order) => sortByDate(msgs, a => a.date || a.pub_date, order);

  useEffect(() => {
    const msgs = messagesData.map(m => m);
    sortMessages(msgs, orderFromOld);
    setMessages(msgs);
  }, [messagesData, orderFromOld]);

  const handleDeleteCommentClick = (event) => {
    event.preventDefault();

   setDeleteCommentId(event.currentTarget.dataset.msgid);
   setShowConfirmDeleteComment(!!event.currentTarget.dataset.msgid);
  }

  const handleDelete = (confirmed) => {
    setShowConfirmDeleteComment(false);
    
    if (!confirmed) {
      return;
    }

    const updatedMessages = messagesData.map(m => m);

    var error = "";
    var success = "";

    const targetId = deleteCommentId;
    const data = { id: targetId, uid: authData.userDetails.uid, 
      findBuddiesId: traveller._id };

    fetchPostJsonWithToken(authData.user, '/api/traveller/deleteComment', data)
    .then(msg => {
      if (msg.error) {
        throw msg.error;
      } else {
        success = 'Komentár bol uspešne zmazaný.';
      }
    })
    .catch(err => {
      console.error(err);
      error = Texts.GenericError;
    }).then(() =>
    {
      updatedMessages.forEach(msg => {
          msg.error = msg._id === targetId ? error : "";
          msg.success = msg._id === targetId ? success : "";
          msg.deleted = msg.deleted || (msg._id === targetId && success);
        });
      
      setMessagesData(updatedMessages);
    });
  }

  const handleOrderClick = (e) => {
    e.preventDefault();
    var order = !orderFromOld;

    if (!window.history.pushState) {
      history.push((order ? Constants.FromOldQuery : "?"));
    } else {
      window.history.pushState(null, null, (order ? Constants.FromOldQuery : "?"));

      setOrderFromOld(order);
    }
  }

  const updateComments = (comment) => {
    const msgs = messagesData.map(m => m);

    msgs.forEach(msg => {
      msg.error = "";
      msg.success = "";
    });

    msgs.push(Object.assign({ isComment: true }, comment));
    window.location.hash = "#" + comment._id;

    setMessagesData(msgs);
  }

  return (
    <PageWithLoader pageId="FindBuddiesDetail" pageTitle={traveller ? (traveller.meno + Constants.WebTitleSuffix) : null}>
      <DivWithLoader className="traveller" loading={loading} error={!!authData.authProviderMounted && !authData.isAuth ? 
        (<div>Hladanie parťákov môže využiť len prihlásený užívateľ. <A href="/ucet/hladampartakov">Prihlásiť sa</A></div>) : error}>
        <TravellerItem traveller={traveller || {}} now={Date.now()} userData={authData} findBuddies />         

        {!!traveller && !!traveller.showComments && (
          <>
            <div className="na-ceste-traveller-sort" data-nosnippet >
              Zoradiť: <a href="#" onClick={handleOrderClick}>{orderFromOld ? " od najnovšie" : " od najstaršie"} </a>           
            </div>

            <div className="na-ceste-traveller-msgs">
              {messages.map((message, i) => <TravellerMessage key={i} inTraveller 
                travellerUserId={traveller ? traveller.user_id : ''}
                message={message} travellerName={traveller ? traveller.meno : ''}
                userData={authData} deleteMessage={handleDeleteCommentClick}/>)}

                <CommentBox
                  show={showCommentBox}
                  onHide={() => setShowCommentBox(false)}
                  updateTravellerComments={updateComments}
                  articleID={0}
                  findBuddiesId={traveller ? traveller._id : null}
                />

                <ConfirmBox
                  title="Zmazať komentár"
                  text="Naozaj chcete zmazať tento komentár?"
                  confirmText="Zmazať"
                  show={showConfirmDeleteComment}
                  onConfirm={() => handleDelete(true)}
                  onHide={() => handleDelete(false)}
                />
          </div>
        </>)}
      </DivWithLoader>

      <div className="traveller-buttons-panel">
        <div className="traveller-buttons">
          {!!traveller && !!traveller.showComments && (<button
            className="snpBtn"
            onClick={() => setShowCommentBox(true)}
          >
            Komentuj
          </button>)}
        </div>
      </div>
    </PageWithLoader>
  );
}

export default FindBuddiesDetail;
