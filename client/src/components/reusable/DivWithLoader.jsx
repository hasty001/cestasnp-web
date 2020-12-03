import React from 'react';
import FloatingLoader from './FloatingLoader';

const DivWithLoader = (props) => {
  
  return (
    <div id={props.divId} className={`${props.className || ''} ${props.absolute ? "" : "for-floating-loader"}`.trim()}>    
      {!!props.loading && <FloatingLoader />}    
      <div className={props.loading ? "invisible" : null}>
        {props.children}
      </div>
    </div>
  )
}
export default DivWithLoader;