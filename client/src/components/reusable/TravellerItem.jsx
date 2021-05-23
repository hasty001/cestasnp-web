import React from 'react';
import { dateTimeToStr, dateToStr, htmlSimpleSanitize, parseDate } from '../../helpers/helpers';
import { A } from './Navigate';
import * as Constants from '../Constants';
import { DivIcon } from 'leaflet';

const TravellerItem = ({ traveller, now, userData, findBuddies }) => {
  
  return (
    <div className="traveller-item" >
      <div className="traveller-item-header"> 
        <A className="traveller-name" href={
          findBuddies ? `/pred/hladampartakov/${traveller.user_id}` : `/na/${traveller.user_id}${traveller.finishedTracking ? Constants.FromOldQuery : ""}`}>
          {traveller.meno}                          
        </A>

        {!!traveller.email &&
          <div className="traveller-item-email"><a className="traveller-email" href={`mailto:${traveller.email}`}>
            <i class="far fa-envelope"></i>{` `}
            {traveller.email}                          
          </a></div>}

        {!!userData && !!userData.isAuth && userData.userDetails.uid == traveller.user_id && (<span className="traveller-item-actions">
            <A href={findBuddies ? "/ucet/hladampartakov" : "/ucet"} className="traveller-edit" title={findBuddies ? "upraviť môj inzerát" : "upraviť moju cestu"}><i className="fas fa-pencil-alt"/></A>
        </span>)}

        <span className="traveller-date">              
          {(!traveller.finishedTracking && !!traveller.lastMessage && (parseDate(traveller.start_date) <= now)) &&  (
          <span>
            {dateTimeToStr(traveller.lastMessage.pub_date)}
          </span>)} 

          {((parseDate(traveller.start_date) > now) || !traveller.lastMessage) && (
          <span>
            {traveller.start_miesto}{' '}
            {!!findBuddies && <>±{' '}</>}
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