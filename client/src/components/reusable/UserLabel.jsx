import React from 'react';

/**
 * Label with user name and link to user journey, if uid is passed.
 */
const UserLabel = ({ name, uid }) => {
  
  return (
    <>
      {uid ?
       <a href={`/na/${uid}`}>{name}</a>
       : <span>{name}</span>}
    </>
  )
}

export default UserLabel;