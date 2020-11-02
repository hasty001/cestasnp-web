import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';

const FormSelect = (props) => {

  const [value, setValue] = useStateProp(props.value);
  
  return (
    <FormItem {...props} value={value} >
      <select
        className={props.itemClassName}
        id={props.valueName}
        name={props.valueName}
        onChange={e => setValue(e.target.value)}
        value={value}>
        {props.children}
        {!!props.options && props.options.map((option, i) => <option key={i} value={option.value} label={option.label}/>)}
      </select>
    </FormItem>
  )
}
export default FormSelect;