import React from 'react';
import { findPoiCategory } from '../PoiCategories';

const PoiItem = (props) => {
  
  return (
    <div className="poi-item">
      {!!props.value.distance && `${props.value.distance.toFixed(0)} m `}
      <a href={`/pred/pois/${props.value._id}`}>
        <i className={findPoiCategory(props.value.category).icon}/>
        {' '}{props.value.name || findPoiCategory(props.value.category).label}
      </a>
      {' '}{props.value.text}
    </div>
  )
}

export default PoiItem;