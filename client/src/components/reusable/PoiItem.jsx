import React, { useContext } from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 
import PoiIcon from './PoiIcon';
import UserLabel from './UserLabel';
import { dateTimeToStr } from '../../helpers/helpers';
import { AuthContext } from '../AuthContext';

const PoiItem = (props) => {
  const authData = useContext(AuthContext);
  
  return (
    <div className="poi-item">
      {!!props.value.errorMsg && <div className="errorMsg">{props.value.errorMsg}</div>}
      {!!props.value.successMsg && <div className="successMsg">{props.value.successMsg}</div>}

      {!!props.value.distance && `${props.value.distance.toFixed(0)} m `}
      {!!props.showLastChange && (props.value.deleted ? 
        <>{dateTimeToStr(props.value.deleted)} zmazal <UserLabel uid={props.value.deleted_by} name={props.value.deleted_by_name}/>{' '}</>
        : (props.value.modified ? 
          <>{dateTimeToStr(props.value.modified)} upravil <UserLabel uid={props.value.modified_by} name={props.value.modified_by_name}/>{' '}</>
          : <>{dateTimeToStr(props.value.created)} pridal <UserLabel uid={props.value.user_id} name={props.value.created_by_name}/>{' '}</>))}
      <span className={props.value.deleted ? "deleted" : ""}>
        <a href={`/pred/pois/${props.value._id}`}>
          <PoiIcon value={props.value} />
          {' '}{props.value.name || findPoiCategory(props.value.category).label}
        </a>
        {' '}{props.value.text}
      </span>
      <span className="poi-actions">
        {!!authData.isAuth && props.my && props.onMyRemove &&
          (<a href="#" onClick={(e) => { e.preventDefault(); props.onMyRemove(props.value); }} className="poi-my" title="odobrať z mojich miest"><i className="fas fa-star"/></a>)}
      </span>
    </div>
  )
}

export default PoiItem;