import React, { useContext, useEffect, useState } from 'react';
import CommentBox from './reusable/CommentBox';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { AuthContext } from './AuthContext';
import ConfirmBox from './reusable/ConfirmBox';
import history from '../helpers/history';
import { fetchJson, fetchPostJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import PageWithLoader from './reusable/PageWithLoader';
import TravellerItem from './reusable/TravellerItem';
import TravellerMessage from './reusable/TravellerMessage';
import { sortByDate } from '../helpers/helpers';
import { A, navigate } from './reusable/Navigate';
import MapControl from './MapControl';
import DockPanel from './reusable/DockPanel';

const Traveller = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState('');

  const [traveller, setTraveller] = useState();
  const [messagesData, setMessagesData] = useState([]);
  const [messages, setMessages] = useState([]);

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [showConfirmDeleteComment, setShowConfirmDeleteComment] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [showConfirmDeleteMessage, setShowConfirmDeleteMessage] = useState(false);
  const [orderFromOld, setOrderFromOld] = useState(window.location.search === Constants.FromOldQuery);

  const travellerId = props.match.params.traveller;

  const authData = useContext(AuthContext);

  const fetchData = () => {
    setLoading(true);
    setError('');
    setNotFound('');

    fetchJson(`/api/traveller/details/${travellerId}`)
    .then((data) => {
      if (data.length == 0 || data[0].cancelled) {
        setNotFound("Momentálne nie je na ceste ani cestu neplánuje.");
        return [[], []];
      }

      setTraveller(data[0]);
      const commentData = {
        articleId: data[0].articleID,
        travellerId: data[0]._id
      };

      return Promise.all([
        data[0],
        fetchJson(`/api/traveller/messages/${data[0].user_id}`), 
        fetchPostJson('/api/traveller/comments', commentData)]);
    })
    .then(([details, msgData, comments]) => {
      const msgs = msgData.map(m => Object.assign({ color: details.color, symbol: details.symbol}, m))
        .concat(comments.map(c => Object.assign({ isComment: true }, c)));
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
  }, [props.match.params.traveller]);

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

  useEffect(() => {
    if (authData.userDetails && traveller && authData.userDetails.uid == traveller.user_id &&
      messagesData) {

      const msgs = messagesData.filter(m => m.isComment).map(m => m);
      sortByDate(msgs, a => a.date, false);

      const lastComment = msgs.find(m => !authData.userDetails.lastViewed || m.date > authData.userDetails.lastViewed);

      if (lastComment) {
        fetchPostJsonWithToken(authData.user, '/api/traveller/view', { uid: traveller.user_id, date: lastComment.date })
        .then(details => authData.updateTravellerDetails(details))
        .catch(err => console.error(err));
      }
    }
  }, [messagesData, authData.userDetails, traveller]);

  useEffect(() => {
    setOrderFromOld(window.location.search === Constants.FromOldQuery);
  }, [window.location.search]);

  const handleDeleteMessageClick = (event) => {
    event.preventDefault();

    setDeleteMessageId(event.currentTarget.dataset.msgid);
    setShowConfirmDeleteMessage(!!event.currentTarget.dataset.msgid);
  }

  const handleDeleteCommentClick = (event) => {
    event.preventDefault();

   setDeleteCommentId(event.currentTarget.dataset.msgid);
   setShowConfirmDeleteComment(!!event.currentTarget.dataset.msgid);
  }

  const handleDelete = (comment, confirmed) => {
    if (comment) {
      setShowConfirmDeleteComment(false);
    } else {
      setShowConfirmDeleteMessage(false);
    }

    if (!confirmed) {
      return;
    }

    const updatedMessages = messagesData.map(m => m);

    var error = "";
    var success = "";

    const targetId = comment ? deleteCommentId : deleteMessageId;
    const data = comment ? { id: targetId, uid: authData.userDetails.uid, 
      articleId: traveller.articleID }
    : { id: targetId, uid: authData.userDetails.uid };

    fetchPostJsonWithToken(authData.user,
      comment ? '/api/traveller/deleteComment' : '/api/traveller/deleteMessage', data)
    .then(msg => {
      if (msg.error) {
        throw msg.error;
      } else {
        success = comment ? 'Komentár bol uspešne zmazaný.' : 'Správa bola uspešne zmazaná.';
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
    <PageWithLoader pageId="Traveller" pageTitle={traveller ? (traveller.meno + Constants.WebTitleSuffix) : null}
      notFound={notFound}>
      <MapControl
        id="na-ceste-map-traveller"
        start={traveller ? traveller.start_miesto : null}
        stops={messages || []}
      />

      <DivWithLoader className="traveller" loading={loading} error={error}>
        <TravellerItem traveller={traveller || {}} now={Date.now()} userData={authData} />         

        <div className="na-ceste-traveller-sort" data-nosnippet >
          Zoradiť: <a href="#" onClick={handleOrderClick}>{orderFromOld ? " od najnovšie" : " od najstaršie"} </a>           
        </div>

        <div className="na-ceste-traveller-msgs">
          {messages.map((message, i) => <TravellerMessage key={i} inTraveller 
            travellerUserId={traveller ? traveller.user_id : ''}
            travellerUrlName={traveller ? (traveller.url_name || traveller.user_id) : ''}
            message={message} travellerName={traveller ? traveller.meno : ''}
            userData={authData} deleteMessage={message.isComment ? 
              handleDeleteCommentClick : handleDeleteMessageClick}/>)}

          <CommentBox
            show={showCommentBox}
            onHide={() => setShowCommentBox(false)}
            articleID={traveller ? traveller.articleID : null}
            updateTravellerComments={updateComments}
            travellerId={traveller ? traveller._id : null}
            travellerName={traveller ? traveller.meno : null}
          />

          <ConfirmBox
            title="Zmazať komentár"
            text="Naozaj chcete zmazať tento komentár?"
            confirmText="Zmazať"
            show={showConfirmDeleteComment}
            onConfirm={() => handleDelete(true, true)}
            onHide={() => handleDelete(true, false)}
          />

          <ConfirmBox
            title="Zmazať správu"
            text="Naozaj chcete zmazať túto správu?"
            confirmText="Zmazať"
            show={showConfirmDeleteMessage}
            onConfirm={() => handleDelete(false, true)}
            onHide={() => handleDelete(false, false)}
          />
        </div>
      </DivWithLoader>

      <DockPanel className="traveller-buttons-panel">
        <div className="traveller-buttons">
          {!!authData.userDetails && !!traveller && authData.userDetails.uid == traveller.user_id && 
            <button
              className="snpBtn no-print"
              onClick={() => navigate("/ucet/poslatspravu")}
            >
              Pridaj správu
            </button>}

          <button
            className="snpBtn no-print"
            onClick={() => setShowCommentBox(true)}
          >
            Komentuj
          </button>
        </div>
      </DockPanel>
    </PageWithLoader>
  );
}

export default Traveller;
