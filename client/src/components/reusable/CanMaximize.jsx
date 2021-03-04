import React from 'react';

/**
 * Div with maximize support.
 */
const CanMaximize = ({ children }) => {
  
  return (
    <div className="can-maximize">
      <a className="action" href="#" onClick={e => { e.preventDefault(); e.currentTarget.parentElement.classList.toggle("maximized"); }}>
        <i className="fas fa-external-link-alt not-maximized" title="maximalizovať"></i>
        <i className="far fa-window-restore maximized" title="obnoviť"></i>
      </a>
      {children}
    </div>);
}

export default CanMaximize;