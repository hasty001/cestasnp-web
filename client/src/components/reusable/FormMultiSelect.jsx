import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';

const FormMultiSelect = (props) => {

  const [value, setValue] = useStateProp(props.value);

  const getOptionLabel = (v) => {
    const index = props.options ? props.options.findIndex(o => o.value == v) : -1;

    return index >= 0 ? props.options[index].label : v;
  };
  
  return (
    <FormItem {...props} value={(value || []).map(v => getOptionLabel(v)).join(", ")} useEdit>
      <div className="multiselect-options">
        {props.children}
        {!!props.options && props.options.map((option, i) => (
        <button key={i} 
          onClick={() => { 
            const index = value.indexOf(option.value);
            const newValue = value.map(a => a);

            if (index >= 0) {  
              newValue.splice(index, 1);
            } else { 
              newValue.push(option.value); 
            }
          
            setValue(newValue);}}
          className={("multiselect-option " + (props.itemClassName || '') + (value.indexOf(option.value) >= 0 ? " checked" : "")).trim()}> 
          {option.label}
        </button>))}

        {!!props.options && <button onClick={() => setValue([])} className={("multiselect-option " + (props.itemClassName || '')).trim()}>
            <i className="fas fa-times" />
          </button>}
      </div>
    </FormItem>
  )
}
export default FormMultiSelect;