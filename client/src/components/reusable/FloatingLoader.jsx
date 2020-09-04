import React from 'react';

const FloatingLoader = () => (
  <div
    style={{
      display: 'block',
      width: '40px',
      position: 'absolute',
      marginBottom: '30px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}
  >
    <i className="fa fa-compass fa-spin fa-3x" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default FloatingLoader;
