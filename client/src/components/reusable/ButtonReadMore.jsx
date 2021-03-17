import React from 'react';
import { A } from './Navigate';

/**
 * Button with link.
 */
const ButtonReadMore = ({ href, white, text, className }) => {
  
  return <A href={href} className={((className || '') + " read-more" + (white ? " white-button" : " red-button")).trim()}>{text ||'čítaj viac'}</A>;
}

export default ButtonReadMore;