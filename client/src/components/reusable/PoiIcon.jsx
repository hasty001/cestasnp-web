import React from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 

const PoiIcon = (props) => {
  
  return (
    <>
      <i className={findPoiCategory(props.value.category).icon}/>
      {!!props.value.food && <span><i className={findPoiCategory(Constants.PoiCategoryFood).icon}/></span>}
      {!!props.value.water && <span><i className={findPoiCategory(Constants.PoiCategoryWater).icon}/></span>}
    </>
  )
}

export default PoiIcon;