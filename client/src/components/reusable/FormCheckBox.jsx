import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';

const FormCheckBox = (props) => {

  const [value, setValue] = useStateProp(props.value, '');
  
  return (
    <label htmlFor={props.valueName} className={props.labelClassName || ''} >
      <input
        className={props.itemClassName}
        type="checkbox"
        id={props.valueName}
        name={props.valueName}
        onBlur={e => {
          e.preventDefault();
          setValue(!!e.target.checked);
        }}
        onChange={e => setValue(!!e.target.checked)}
        value="1"
        checked={!!value}
        />
      <span>
        {props.valueLabel}
      </span>
    </label>
  )
}
export default FormCheckBox;