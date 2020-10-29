import React from 'react';
import { findPoiCategory } from '../PoiCategories';

const PoiItem = (props) => {
  
  return (
    <div>
      {!!props.value.distance && `${props.value.distance.toFixed(0)} m `}
      <i className={findPoiCategory(props.value.category).icon}/>
      {props.value.name} {props.value.text} 
    </div>
  )
}

export default PoiItem;