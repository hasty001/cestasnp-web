import React from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 

const PoiIcon = (props) => {
  
  return (
    <>
      <i className={findPoiCategory(props.value.category).icon} title={findPoiCategory(props.value.category).label}/>
      {!!props.value.food && <span><i className={findPoiCategory(Constants.PoiCategoryFood).icon} title={findPoiCategory(Constants.PoiCategoryFood).label}/></span>}
      {!!props.value.water && <span><i className={findPoiCategory(Constants.PoiCategoryWater).icon} title={findPoiCategory(Constants.PoiCategoryWater).label}/></span>}
    </>
  )
}

export default PoiIcon;