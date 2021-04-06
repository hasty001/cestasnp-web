import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';

const FormText = (props) => {

  const [value, setValue] = useStateProp(props.value, '');
  
  return (
    <FormItem {...props} value={value}>
      <input
        className={props.itemClassName}
        type="text"
        id={props.valueName}
        name={props.valueName}
        autoComplete="off"
        onBlur={e => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onChange={e => setValue(e.target.value)}
        value={value}
        {...props.inputAttrs}
        />
    </FormItem>
  )
}
export default FormText;