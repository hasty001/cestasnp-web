import React from 'react';
import DocumentTitle from 'react-document-title';
import Loader from './Loader';

const PageWithLoader = (props) => {
  
  return (
    <div id={props.pageId} className={props.className || ''} >
      {!!props.pageTitle && <DocumentTitle title={props.pageTitle} />}
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