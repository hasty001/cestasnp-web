import React, { Fragment, useContext, useState } from 'react'

import LoggedIn from './LoggedIn'
import NotLoggedIn from './NotLoggedIn'
import { AuthContext, } from '../AuthContext'

const Account = () => {
    const authData = useContext(AuthContext);
    const [ { auth } ] = useState({ auth: authData })
    console.log('authData ', authData);
    console.log('auth ', auth);
    console.log('authData.user ', authData.user);
    return <Fragment>
        {authData.isAuth ? <LoggedIn /> : <NotLoggedIn />}
    </Fragment>
}

export default Account
