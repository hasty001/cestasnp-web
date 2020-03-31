import React, { useContext } from 'react';

import LoggedIn from './LoggedIn';
import NotLoggedIn from './NotLoggedIn';
import Loader from '../reusable/Loader';
import { AuthContext } from '../AuthContext';

const Account = () => {
  const authData = useContext(AuthContext);
  return (
    <>
      {!authData.authProviderMounted ? (
        <Loader />
      ) : (
        <>
          {authData.isAuth ? <LoggedIn userData={authData} /> : <NotLoggedIn />}
        </>
      )}
    </>
  );
};

export default Account;
