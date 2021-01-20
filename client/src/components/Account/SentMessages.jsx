import React, { Component, Fragment, useContext } from 'react';
import { dateTimeToStr } from '../../helpers/helpers';
import { AuthContext } from '../AuthContext';
import ConfirmBox from '../reusable/ConfirmBox';
import { A } from '../reusable/Navigate';
import DOMPurify from 'dompurify';

const SentMessages = (props) => {
  const authData = useContext(AuthContext);
  return (
    <SentMessagesWithAuth {...props} userData={authData.authProviderMounted && authData.isAuth ? authData : null} />
  );
};

class SentMessagesWithAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: this.props.userId,
      msgs: this.props.msgs.sort((a, b) => {
        if (new Date(b.pub_date) < new Date(a.pub_date)) return -1;
        if (new Date(b.pub_date) > new Date(a.pub_date)) return 1;

        return 0;
      }),
      deleteMessageId: null,
      showConfirmDeleteMessage: false,
    };

    this.handleDeleteMessageClick = this.handleDeleteMessageClick.bind(this);
    this.handleDeleteMessage = this.handleDeleteMessage.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.msgs !== prevProps.msgs) {
      this.setState({
        userId: this.props.userId,
        msgs: this.props.msgs
      });
    }
  }

  handleDeleteMessageClick(event) {
    event.preventDefault();

    this.setState({ deleteMessageId: event.currentTarget.dataset.msgid, showConfirmDeleteMessage: !!event.currentTarget.dataset.msgid });
  }

  handleDeleteMessage(confirmed) {
    if (confirmed) {
      const updatedMessages = this.state.msgs;

      var error = "";
      var success = "";

      this.props.userData.user.getIdToken().then(token => 
        fetch('/api/traveller/deleteMessage', {
          method: 'POST',
          body: JSON.stringify({ 
            id: this.state.deleteMessageId, 
            uid: this.props.userData.userDetails.uid }),
          headers: new Headers({
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          })
        })
      .then(res => res.json())
      .then(msg => {
        if (msg.error) {
          console.error(msg.error);
          error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
        } else {
          success = 'Správa bola uspešne zmazaná.';
        }
      }))
      .catch(err => {
        console.error(err);
        error = 'Ups, niekde sa stala chyba. Skús neskôr prosím';
      }).then(() =>
      {
        updatedMessages.forEach(msg => {
            msg.error = msg._id === this.state.deleteMessageId ? error : "";
            msg.success = msg._id === this.state.deleteMessageId ? success : "";
            msg.deleted = msg.deleted || (msg._id === this.state.deleteMessageId && success);
          });
        
        this.setState({
          msgs: updatedMessages,
          showConfirmDeleteMessage: false 
        });
      });
    } else {
      this.setState({
        showConfirmDeleteMessage: false 
      });
    }
  }

  render() {
    return (
      <div id="SentMessages" className="thinRedWrap">
        <h2>Moje správy</h2>
        {this.state.msgs.map((message, i) => {

          const error = <Fragment>{!!message.error && (<p className="errorMsg">{message.error}</p>)}</Fragment>;
          const success = <Fragment>{!!message.success && (<p className="successMsg">{message.success}</p>)}</Fragment>;

          if (message.deleted) {
            return (<div key={i} className={"traveller-message-deleted"}>
                {error}
                {success}
              </div>);
          }

          return (<div key={i} className="traveller-message">
            {error}
            {success}
            <p>
              <span className="red-stripe" />
              {dateTimeToStr(message.pub_date)} 
              <span className="traveller-message-actions">
                {(this.props.userData && this.props.userData.userDetails.uid) && 
                  (<a href="#" data-msgid={message._id} onClick={this.handleDeleteMessageClick} className="traveller-message-delete" title="zmazať správu"><i className="fas fa-trash-alt"/></a>)}
                <A href={`/na/${this.state.userId}#${message._id}`} className="traveller-message-link" title="odkaz na správu"><i className="fas fa-link"/></A>
              </span>
            </p>     
            {message.img && message.img !== 'None' && message.img !== null && (
              <img
                src={message.img.eager[0].secure_url}
                style={{
                  display: 'block',
                  margin: '0px auto 15px',
                  minWidth: '80px',
                  maxWidth: '100%',
                  maxHeight: '80vh'
                }}
                alt="fotka z putovania"
                // onClick={() => {
                // this.handleImageBox(
                //     true,
                //     message.img.secure_url,
                // );
                // }}
              />
            )}      
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
          </div>);}
        )}

        <ConfirmBox
          title="Zmazať správu"
          text="Naozaj chcete zmazať túto správu?"
          confirmText="Zmazať"
          show={this.state.showConfirmDeleteMessage}
          onConfirm={() => this.handleDeleteMessage(true)}
          onHide={() => this.handleDeleteMessage(false)}
        />
      </div>
    );
  }
}

export default SentMessages;
