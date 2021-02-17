import React from 'react';
import { A } from './Navigate';

/**
 * Label with user name and link to user journey, if uid is passed.
 */
const UserLabel = ({ name, uid, className }) => {
  
  return (
    <>
      {uid ?
       <A className={className} href={`/na/${uid}`}>{name}</A>
       : <span className={className}>{name}</span>}
    </>
  )
}

export default UserLabel;