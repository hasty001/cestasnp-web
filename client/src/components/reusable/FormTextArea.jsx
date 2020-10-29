import React from 'react';
import FormItem from './FormItem';

const FormTextArea = (props) => {
  
  return (
    <FormItem {...props}>
      <textarea
        type="text"
        id={props.valueName}
        name={props.valueName}
        onBlur={e => {
          e.preventDefault();
          (props.onChange|| (() => {}))(e.target.value);
        }}
        onChange={e => (props.onChange|| (() => {}))(e.target.value)}
        value={props.value}
        />
    </FormItem>
  )
}
export default FormTextArea;