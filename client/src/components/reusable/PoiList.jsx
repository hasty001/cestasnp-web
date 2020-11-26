import { isMonday } from 'date-fns';
import React, { useState } from 'react';
import PoiItem from './PoiItem';

const PoiList = (props) => {

  const isMy = (poi) => {
    const userDetails = props.userDetails;

    return userDetails && (
        (userDetails.poisMy && userDetails.poisMy.indexOf(poi._id) >= 0)
        || (poi.user_id == userDetails.uid && !(userDetails.poisNotMy && userDetails.poisNotMy.indexOf(poi._id) >= 0)));
  };

  return (
    <>
      {!!props.pois && props.pois.filter(poi => (!props.my || isMy(poi)) && (!poi.deleted || props.showDeleted))
        .map(poi => <PoiItem key={poi._id} value={poi} showLastChange={props.showLastChange || false} my={props.my}
          onMyRemove={props.onMyRemove} />)}   
    </>
  )
}

export default PoiList;