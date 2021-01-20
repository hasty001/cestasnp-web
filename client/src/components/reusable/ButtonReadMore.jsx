import React from 'react';
import { A } from './Navigate';

/**
 * Button with link.
 */
const ButtonReadMore = ({ href, white }) => {
  
  return <A href={href} className={"read-more" + (white ? " white-button" : " red-button")}>čítaj viac</A>;
}

export default ButtonReadMore;