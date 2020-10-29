import React from 'react';
import FormItem from './FormItem';

const FormSelect = (props) => {
  
  return (
    <FormItem {...props}>
      <select
        id={props.valueName}
        name={props.valueName}
        onChange={e => (props.onChange|| (() => {}))(e.target.value)}
        value={props.value}>
        {props.children}
        {!!props.options && props.options.map((option, i) => <option key={i} value={option.value} label={option.label}/>)}
      </select>
    </FormItem>
  )
}
export default FormSelect;