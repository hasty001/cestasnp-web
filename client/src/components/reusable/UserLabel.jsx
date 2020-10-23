import React from 'react';
import { A } from './Navigate';

/**
 * Label with user name and link to user journey, if uid is passed.
 */
const UserLabel = ({ name, uid }) => {
  
  return (
    <>
      {uid ?
       <A href={`/na/${uid}`}>{name}</A>
       : <span>{name}</span>}
    </>
  )
}

export default UserLabel;