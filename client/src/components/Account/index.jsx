import React, { Fragment, useContext, useState } from 'react'

import LoggedIn from './LoggedIn'
import NotLoggedIn from './NotLoggedIn'
import Loader from '../reusable/Loader'
import { AuthContext, } from '../AuthContext'

const Account = () => {
    const authData = useContext(AuthContext)
    return <Fragment>
        {!authData.authProviderMounted ? <Loader/> : <Fragment>
            {authData.isAuth ? <LoggedIn userData={authData} /> : <NotLoggedIn />}
        </Fragment>}
    </Fragment>
}

export default Account
