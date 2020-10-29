import React, { useEffect, useState } from 'react';

const FormItem = (props) => {
  const [edit, setEdit] = useState(props.edit || false);

  useEffect(() => {
    if (edit != props.edit) {
      setEdit(props.edit);
    }
  }, [props.edit]);
  
  return (
    <label htmlFor={props.valueName} >
      <span onClick={() => { const val = !edit; setEdit(val); (props.onEdit || (() => {}))(val) } } >
        {props.valueLabel} {!!props.useEdit && <i className="fas fa-edit" />}
      </span>
      {!props.useEdit || edit ? 
        (props.children) : (<p className={props.valueClass}>{props.value}</p>)
      }
    </label>
  )
}
export default FormItem;