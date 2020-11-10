import React, { useState } from 'react';
import DeletePoiBox from './DeletePoiBox';
import EditPoiBox from './EditPoiBox';
import PoiItem from './PoiItem';

const PoiTable = (props) => {
  const [poiToDelete, setPoiToDelete] = useState();
  const [showDelete, setShowDelete] = useState();
  const [poiToEdit, setPoiToEdit] = useState();
  const [showEdit, setShowEdit] = useState();

  const deletePoi = (poi) => {
    setPoiToDelete(poi);
    setShowDelete(true);
    updatePoi(null);
  };

  const editPoi = (poi) => {
    setPoiToEdit(poi);
    setShowEdit(true);
    updatePoi(null);
  };

  const updatePoi = (poi) => {
    (props.onUpdate || (() => {}))(poi);
  };

  return (
    <>
      {!!props.pois && props.pois.filter(poi => (!props.my || (poi.user_id == props.uid)) && (!poi.deleted || props.showDeleted))
        .map(poi => <PoiItem key={poi._id} value={poi} showLastChange={props.showLastChange || false} onDelete={deletePoi} onEdit={editPoi} />)}

      <DeletePoiBox uid={props.uid} user={props.user} poi={poiToDelete} show={showDelete} onHide={() => setShowDelete(false)} onUpdate={updatePoi}/>
      <EditPoiBox uid={props.uid} user={props.user} poi={poiToEdit} show={showEdit} onHide={() => setShowEdit(false)} onUpdate={updatePoi}/>
              
    </>
  )
}

export default PoiTable;