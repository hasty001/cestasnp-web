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
        <>{dateTimeToStr(props.value.deleted)} smazal <UserLabel uid={props.value.deleted_by} name={props.value.deleted_by_name}/>{' '}</>
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
        {!!authData.authProviderMounted && !!authData.isAuth && !props.value.deleted && !!props.onDelete && 
          (<a href="#" onClick={e => { e.preventDefault(); props.onDelete(props.value); }} className="poi-delete" title="zmazať dôležité miesto"><i className="fas fa-trash-alt"/></a>)}
      </span>
    </div>
  )
}

export default PoiItem;