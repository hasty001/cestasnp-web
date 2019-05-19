import React, { Fragment, useContext, useState } from 'react'

import LoggedIn from './LoggedIn'
import NotLoggedIn from './NotLoggedIn'
import { AuthContext, } from '../AuthContext'

console.log('AuthContext ', AuthContext)

const Account = () => {
    const authData = useContext(AuthContext);
    const [ auth ] = useState(authData)
    console.log('auth!!! ', auth);
    // console.log('authData.user ', authData.user);
    return <Fragment>
        {authData.isAuth ? <LoggedIn userData={authData} /> : <NotLoggedIn />}
    </Fragment>
}

export default Account
