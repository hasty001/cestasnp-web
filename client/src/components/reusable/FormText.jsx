import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';

const FormText = (props) => {

  const [value, setValue] = useStateProp(props.value);
  
  return (
    <FormItem {...props} value={value}>
      <input
        type="text"
        id={props.valueName}
        name={props.valueName}
        onBlur={e => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onChange={e => setValue(e.target.value)}
        value={value}
        />
    </FormItem>
  )
}
export default FormText;