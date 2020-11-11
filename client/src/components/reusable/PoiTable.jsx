import React, { useState } from 'react';
import DeletePoiBox from './DeletePoiBox';
import EditPoiBox from './EditPoiBox';
import PoiItem from './PoiItem';

const PoiTable = (props) => {

  return (
    <>
      {!!props.pois && props.pois.filter(poi => (!props.my || (poi.user_id == props.uid)) && (!poi.deleted || props.showDeleted))
        .map(poi => <PoiItem key={poi._id} value={poi} showLastChange={props.showLastChange || false} />)}   
    </>
  )
}

export default PoiTable;