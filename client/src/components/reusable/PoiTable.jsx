import React, { useState } from 'react';
import DeletePoiBox from './DeletePoiBox';
import PoiItem from './PoiItem';

const PoiTable = (props) => {
  const [poiToDelete, setPoiToDelete] = useState();
  const [showDelete, setShowDelete] = useState();

  const deletePoi = (poi) => {
    setPoiToDelete(poi);
    setShowDelete(true);
  };

  const updatePoi = (poi) => {
    (props.onUpdate || (() => {}))(poi);
  };

  return (
    <>
      {!!props.pois && props.pois.filter(poi => (!props.my || (poi.user_id == props.userId)) && (!poi.deleted || props.showDeleted))
        .map(poi => <PoiItem key={poi._id} value={poi} showLastChange={props.showLastChange || false} onDelete={deletePoi} />)}

      <DeletePoiBox uid={props.userId} user={props.user} poi={poiToDelete} show={showDelete} onHide={() => setShowDelete(false)} onUpdate={updatePoi}/>
    </>
  )
}

export default PoiTable;