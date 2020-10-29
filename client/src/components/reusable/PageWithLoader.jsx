import React from 'react';
import Loader from './Loader';

const PageWithLoader = (props) => {
  
  return (
    <div id={props.pageId}>
      {!!props.loading && !props.error && <Loader />}
      {!props.loading && !props.error && props.children}
      {!!props.error && (typeof props.error != "string" ? props.error : (
        <p style={{ marginTop: '10px' }}>
          {props.error}
        </p>))}
    </div>
  )
}

export default PageWithLoader;