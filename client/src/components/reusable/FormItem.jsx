import React, { useEffect, useState } from 'react';
import { useStateProp } from '../../helpers/reactUtils';

const FormItem = (props) => {
  const [edit, setEdit] = useStateProp(props.edit, false);
  
  return (
    <label htmlFor={props.valueName} lang="sk" >
      <span onClick={() => setEdit(!edit)} >
        {props.valueLabel} {!!props.useEdit && <i className="fas fa-edit" />}
      </span>
      {!props.useEdit || edit ? 
        (props.children) : (<p className={`${props.valueClass || ''} form-item-value`.trim()}>{props.value}</p>)
      }
    </label>
  )
}
export default FormItem;