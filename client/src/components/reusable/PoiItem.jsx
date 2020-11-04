import React from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 
import PoiIcon from './PoiIcon';

const PoiItem = (props) => {
  
  return (
    <div className="poi-item">
      {!!props.value.distance && `${props.value.distance.toFixed(0)} m `}
      <a href={`/pred/pois/${props.value._id}`}>
        <PoiIcon value={props.value} />
        {' '}{props.value.name || findPoiCategory(props.value.category).label}
      </a>
      {' '}{props.value.text}
    </div>
  )
}

export default PoiItem;