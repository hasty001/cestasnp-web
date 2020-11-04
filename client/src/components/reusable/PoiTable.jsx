import React from 'react';
import PoiItem from './PoiItem';

const PoiTable = (props) => {
  
  return (
    <>
      {!!props.pois && props.pois.filter(poi => !props.my || (poi.user_id == props.userId))
        .map(poi => <PoiItem key={poi._id} value={poi} />)}
    </>
  )
}

export default PoiTable;