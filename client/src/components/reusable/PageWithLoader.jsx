import React from 'react';
import DocumentTitle from 'react-document-title';
import Loader from './Loader';
import NotFound from './NotFound';

const PageWithLoader = (props) => {
  
  return props.notFound ? 
    <NotFound text={props.notFound}/> 
    : (
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
        <p style={{ marginTop: '10px' }} data-nosnippet>
          {props.error}
          {!!props.retry && (<><br/><a href="#" onClick={props.retry}>Opakovať</a></>)}
        </p>))}
    </div>
  )
}

export default PageWithLoader;