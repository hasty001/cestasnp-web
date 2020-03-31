import React from 'react';

import Login from './Login';
import Register from './Register';

const NotLoggedIn = () => {
  return (
    <>
      <Login />
      <hr />
      <Register />
    </>
  );
};

export default NotLoggedIn;
