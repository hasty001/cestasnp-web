import React from 'react';

const Loader = () => (
  <div>
    <i style={{ margin: '20px auto' }} className="fas fa-spinner fa-spin fa-2x" />
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
