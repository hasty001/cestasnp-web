import React from 'react';

const Loader = () => (
  <div style={{
    display: 'block',
    width: '40px',
    margin: '50px auto'
  }}>
    <i className="fa fa-compass fa-spin fa-3x" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
