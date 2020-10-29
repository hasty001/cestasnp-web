import React from 'react';
import DivWithLoader from './DivWithLoader';

const FormWithLoader = (props) => {
  
  return (
    <DivWithLoader divId={props.formId} loading={props.loading} 
      className={`${props.className} thinRedWrap`.trim()} >
      {!!props.title && 
        <h2>{props.title}</h2>
      }
      {!!props.errorMsg && 
        <p className="errorMsg">{props.errorMsg}</p>
      }
      {!!props.successMsg && 
        <p className="successMsg">{props.successMsg}</p>
      }
      
      {props.children}

      {!!props.submitText && (
        <button className="snpBtn" onClick={props.onSubmit} type="submit">
          {props.submitText}
        </button>
      )}
    </DivWithLoader>
  )
}
export default FormWithLoader;