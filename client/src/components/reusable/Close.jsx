import React from 'react';

/**
 * Close button.
 */
const Close = (props) => {
  return (
    <a href="#" className="close" onClick={e => { e.preventDefault(); props.onClose(); }} {...props}>
      <i className="fas fa-times"/>
    </a>
  )
}
export default Close;