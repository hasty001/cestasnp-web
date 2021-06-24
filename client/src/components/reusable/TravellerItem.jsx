import React from 'react';
import { dateTimeToStr, dateToStr, htmlSimpleSanitize, parseDate } from '../../helpers/helpers';
import { A } from './Navigate';
import * as Constants from '../Constants';

const TravellerItem = ({ traveller, now, userData }) => {
  
  return (
    <div className="traveller-item" >
      <div className="traveller-item-header"> 
        <A className="traveller-name" 
          href={`/na/${traveller.url_name || traveller.user_id}${traveller.finishedTracking ? 
            Constants.FromOldQuery : (traveller.lastMessage ? (`#${traveller.lastMessage._id}`) : "")}`}>
          {traveller.meno}                          
        </A>

        {!!userData && !!userData.isAuth && userData.userDetails.uid == traveller.user_id && (<span className="traveller-item-actions">
            <A href="/ucet" className="traveller-edit" title="upraviť moju cestu"><i className="fas fa-pencil-alt"/></A>
        </span>)}

        <span className="traveller-date">              
          {(!traveller.finishedTracking && !!traveller.lastMessage && (parseDate(traveller.start_date) <= now)) ? (
          <span>
            {dateTimeToStr(traveller.lastMessage.pub_date)}
          </span>
          ) : (
          <span>
            {traveller.start_miesto}{' '}
            {dateToStr(traveller.start_date)}                           
          </span>)}  

          {traveller.finishedTracking && traveller.end_date && (
          <span>
            {' - '}{dateToStr(traveller.end_date)}{' '}{traveller.completed ? "celú" : "časť"}
          </span>)} 
        </span>
      </div>

      <div className="traveller-text"
        dangerouslySetInnerHTML={{ __html: htmlSimpleSanitize(
            traveller.finishedTracking || !traveller.lastMessage ? 
              traveller.text : traveller.lastMessage.text) }} />
    </div> 
  )
}
export default TravellerItem;