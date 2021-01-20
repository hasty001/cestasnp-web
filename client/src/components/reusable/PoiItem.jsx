import React, { useContext } from 'react';
import { findPoiCategory } from '../PoiCategories';
import * as Constants from '../Constants'; 
import PoiIcon from './PoiIcon';
import UserLabel from './UserLabel';
import { dateTimeToStr } from '../../helpers/helpers';
import { AuthContext } from '../AuthContext';
import { A } from './Navigate';
import DOMPurify from 'dompurify';

const PoiItem = (props) => {
  const authData = useContext(AuthContext);
  
  const ItemElement = props.tableRow ? `tr` : `div`;
  const ItemProp = props.tableRow ? `td` : `span`;
  const space = props.tableRow ? null : ` `;

  const getImgUrl = (image) => {
    if (image && image != "None") {
      return image.secure_url ||
        (image.indexOf('res.cloudinary.com') === -1 
        ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${image}`
        : image);
    } else {
      return "";
    }
  };

  return (
    <ItemElement key={props.value._id} className="poi-item">
      {!!props.value.errorMsg && <div className="errorMsg">{props.value.errorMsg}</div>}
      {!!props.value.successMsg && <div className="successMsg">{props.value.successMsg}</div>}

      {!!props.value.distance && `${props.value.distance.toFixed(0)} m `}
      {!!props.showCreated && <><ItemProp className="poi-created">{dateTimeToStr(props.value.created)}</ItemProp>{space}<ItemProp><UserLabel uid={props.value.user_id} name={props.value.created_by_name}/></ItemProp></>}
      {!!props.showLastChange && (props.value.deleted ? 
        <><ItemProp className="poi-deleted">{dateTimeToStr(props.value.deleted)}</ItemProp>{space}<ItemProp>zmazal</ItemProp>{space}<ItemProp><UserLabel uid={props.value.deleted_by} name={props.value.deleted_by_name}/>{space}</ItemProp></>
        : (props.value.modified ? 
          <><ItemProp className="poi-modified">{dateTimeToStr(props.value.modified)}</ItemProp>{space}<ItemProp>upravil</ItemProp>{space}<ItemProp><UserLabel uid={props.value.modified_by} name={props.value.modified_by_name}/>{space}</ItemProp></>
          : (props.showCreated ? <ItemProp colSpan={3}/> : <><ItemProp className="poi-created">{dateTimeToStr(props.value.created)}</ItemProp>{space}<ItemProp>pridal</ItemProp>{space}<ItemProp><UserLabel uid={props.value.user_id} name={props.value.created_by_name}/>{space}</ItemProp></>)))}
      <ItemProp className={"poi-name" + (props.value.deleted ? " deleted" : "")}>
        <A href={`/pred/pois/${props.value._id}`}>
          <PoiIcon value={props.value} />
          {' '}{props.value.name || findPoiCategory(props.value.category).label}
        </A>
      </ItemProp>
      {space}
      <ItemProp className="poi-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.value.text) }}></ItemProp>
      {!!props.showItinerary && <ItemProp className="poi-itinerary">
        {!props.value.deleted && !!props.value.itinerary && (props.value.itinerary.near || props.value.itinerary.after) && (
              <A href={`/pred/itinerar#p${props.value._id}`}><i className="fas fa-external-link-alt"></i></A>)}
        </ItemProp>}
      {!!props.showImage && <ItemProp className="poi-image">
        {!!props.value.img_url && props.value.img_url != "None" && 
          <A href={getImgUrl(props.value.img_url)}><i className="fas fa-external-link-alt"></i></A>}
        </ItemProp>}
      <ItemProp className="poi-actions">
        {!!authData.isAuth && props.my && props.onMyRemove &&
          (<a href="#" onClick={(e) => { e.preventDefault(); props.onMyRemove(props.value); }} className="poi-my" title="odobrať z mojich miest"><i className="fas fa-star"/></a>)}
      </ItemProp>
    </ItemElement>
  )
}

export default PoiItem;