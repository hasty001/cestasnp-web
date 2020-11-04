import React from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 

const PoiIcon = (props) => {
  
  return (
    <>
      <i className={findPoiCategory(props.value.category).icon}/>
      {!!props.value.food && <i className={findPoiCategory(Constants.PoiCategoryFood).icon}/>}
      {!!props.value.water && <i className={findPoiCategory(Constants.PoiCategoryWater).icon}/>}
    </>
  )
}

export default PoiIcon;