import React from 'react';
import { dateTimeToStr, dateToStr, htmlSimpleSanitize } from '../../helpers/helpers';
import { A } from './Navigate';
import * as Constants from '../Constants';

const TravellerItem = ({ traveller, now }) => {
  
  return (
    <div className="traveller-item" >
      <div className="traveller-item-header"> 
        <A className="traveller-name" href={`/na/${traveller.user_id}${traveller.finishedTracking ? Constants.FromOldQuery : ""}`}>
          {traveller.meno}                          
        </A>

        <span className="traveller-date">              
          {(!traveller.finishedTracking && !!traveller.lastMessage && (new Date(traveller.start_date) <= now)) &&  (
          <span>
            {dateTimeToStr(traveller.lastMessage.pub_date)}
          </span>)} 

          {((new Date(traveller.start_date) > now) || !traveller.lastMessage) && (
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