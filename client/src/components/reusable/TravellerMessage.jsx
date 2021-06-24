import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { dateTimeToStr, htmlSimpleSanitize } from '../../helpers/helpers';
import Image from './Image';
import { A } from './Navigate';
import UserLabel from './UserLabel';

const TravellerMessage = ({ message, travellerName, userData, deleteMessage, inTraveller, travellerUserId,
  travellerUrlName }) => {

  const error = <>{!!message.error && (<p className="errorMsg">{message.error}</p>)}</>;
  const success = <>{!!message.success && (<p className="successMsg">{message.success}</p>)}</>;

  const className = message.isComment ? "traveller-comment" : "traveller-message";

  if (message.deleted) {
    return (<div className={`${className}-deleted`}>
        <div id={message._id} className={`${className}-scrolllink`} />
        {error}
        {success}
      </div>);
  }

  const Link = inTraveller ? `a` : A;

  return (
    <div className={`${className} ${window.location.hash === "#" + message._id ? "highlighted" : ''}`.trim()}>
      <div id={message._id} className={`${className}-scrolllink`} />
      {error}
      {success}

      <div className={`${className}-header`}> 
        {message.isComment && (!travellerUserId || message.uid != travellerUserId) ? 
        <UserLabel className="traveller-comment-name" uid={message.uid || message.sql_user_id} 
          name={message.name} />
        : <Link className="traveller-message-name" href={inTraveller ? `#${message._id}` : `/na/${travellerUrlName}#${message._id}`}>
             {travellerName}                          
          </Link>}

        {message.isComment ?
          <span className="traveller-comment-actions">
            {(!!userData.isAuth
              && (message.uid == userData.userDetails.uid 
                || (message.travellerDetails && message.travellerDetails.id == userData.travellerDetails._id))) && 
              (<a href="#" data-msgid={message._id} onClick={deleteMessage} className="traveller-comment-delete" title="zmazať komentár"><i className="fas fa-trash-alt"/></a>)}
            <CopyToClipboard text={`${window.location.host}/na/${travellerUrlName}#${message._id}`}>
              <a href={`#${message._id}`} className="traveller-comment-link" title="kopírovať odkaz na komentár"><i className="fas fa-link"/></a>
            </CopyToClipboard>
          </span>
          :
          <span className="traveller-message-actions">
            {(!!userData.isAuth && userData.userDetails.uid == message.user_id) && 
              (<a href="#" data-msgid={message._id} onClick={deleteMessage} className="traveller-message-delete" title="zmazať správu"><i className="fas fa-trash-alt"/></a>)}
            <CopyToClipboard text={`${window.location.host}/na/${travellerUrlName}#${message._id}`}>
              <Link href={inTraveller ? `#${message._id}` : "#"} className="traveller-message-link" title="kopírovať odkaz na správu"><i className="fas fa-link"/></Link>
            </CopyToClipboard>
          </span>}

        <span className="traveller-date">              
          {dateTimeToStr(message.date || message.pub_date)}
        </span>
      </div>

      {!!message.img && message.img != 'None' && <Image value={message.img} alt={`Fotka z putovanie - ${travellerName}`} itemClassName="traveller-message-image" small/>}
      <div className={"traveller-text" + ((message.img && message.img != 'None') ? ' with-photo' : '')} dangerouslySetInnerHTML={{ __html: htmlSimpleSanitize(message.text || message.comment) }} />
    </div> 
  )
}
export default TravellerMessage;