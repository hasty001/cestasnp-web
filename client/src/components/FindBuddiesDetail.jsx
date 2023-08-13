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
import FindBuddiesWarning from './reusable/FindBuddiesWarning';
import DockPanel from './reusable/DockPanel';

const FindBuddiesDetail = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msgId, setMsgId] = useState(props.match.params.msg);

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

    fetchPostJsonWithToken(authData.user, `/api/traveller/findBuddies/${travellerId}`, { uid: authData.userDetails.uid })
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
      const msgs = (comments || []).map(c => Object.assign({ isComment: true }, c));
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
    setMsgId(props.match.params.msg);
  }, [props.match.params.msg]);

  useEffect(() => {
    if (msgId) {
      var highlighted = document.getElementById(msgId);
      if (highlighted)
        highlighted.scrollIntoView();
    }
  }, [messages, msgId]);

  const sortMessages = (msgs, order) => sortByDate(msgs, a => a.date || a.pub_date, order);

  useEffect(() => {
    const msgs = messagesData.map(m => m);
    sortMessages(msgs, orderFromOld);
    setMessages(msgs);
  }, [messagesData, orderFromOld]);

  useEffect(() => {
    if (authData.findBuddies && authData.findBuddies.user_id == travellerId &&
      messagesData) {

      const msgs = messagesData.filter(m => m.isComment).map(m => m);
      sortByDate(msgs, a => a.date, false);

      const lastComment = msgs.find(m => !authData.findBuddies.lastViewed || m.date > authData.findBuddies.lastViewed);

      if (lastComment) {
        fetchPostJsonWithToken(authData.user, '/api/traveller/viewFindBuddies', { uid: travellerId, date: lastComment.date })
        .then(details => authData.updateFindBuddies(details))
        .catch(err => console.error(err));
      }
    }
  }, [messagesData, authData.findBuddies]);

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
    
    setMessagesData(msgs);
    setMsgId(comment._id);
  }

  const isAuth = !!authData.authProviderMounted && !!authData.isAuth

  return (
    <PageWithLoader pageId="FindBuddiesDetail" pageTitle={traveller ? (traveller.meno + Constants.WebTitleSuffix) : null}>
      <DivWithLoader className="find-buddies-traveller" loading={loading} error={!!authData.authProviderMounted && !authData.isAuth ? 
        (<div className="logged-only">Hladanie parťákov môže využiť len prihlásený užívateľ. <A href="/ucet">Prihlásiť sa</A>.</div>) : error}>
        {!!traveller && isAuth && <TravellerItem traveller={traveller} now={Date.now()} userData={authData} findBuddies />}       

        {!!traveller && isAuth && !!traveller.showComments && (
          <>
          
            <FindBuddiesWarning/>
            <br/>
            <div className="find-buddies-sort" data-nosnippet >
              Zoradiť: <a href="#" onClick={handleOrderClick}>{orderFromOld ? " od najnovšie" : " od najstaršie"} </a>           
            </div>

            <div className="find-buddies-msgs">
              {messages.map((message, i) => <TravellerMessage key={i} inTraveller 
                selectedMessageId={msgId}
                travellerUserId={traveller ? traveller.user_id : ''} findBuddiesId={travellerId}
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

      <DockPanel className="find-buddies-buttons-panel">
        <div className="find-buddies-buttons">
          {!!traveller && isAuth && !!traveller.showComments && (<button
            className="snpBtn"
            onClick={() => setShowCommentBox(true)}
          >
            Odpovedz
          </button>)}
        </div>
      </DockPanel>
    </PageWithLoader>
  );
}

export default FindBuddiesDetail;
