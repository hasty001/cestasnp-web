import React from 'react';
import Loader from './Loader';

const PageWithLoader = (props) => {
  
  return (
    <div id={props.pageId} className={props.className || ''} >
      {!!props.loading && !props.error && <Loader />}
      {!props.loading && !props.error && (
        <>
          {!!props.title && <h2>{props.title}</h2>}
          {props.children}
        </>
      )}
      {!!props.error && (typeof props.error != "string" ? props.error : (
        <p style={{ marginTop: '10px' }}>
          {props.error}
        </p>))}
    </div>
  )
}

export default PageWithLoader;