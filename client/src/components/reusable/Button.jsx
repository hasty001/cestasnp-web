import React from 'react';
import PropTypes from 'prop-types';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = ({ children, variant, onClick }) => {
  return (
    <BootstrapButton bsStyle={variant} onClick={onClick}>
      {children}
    </BootstrapButton>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'link']).isRequired,
  onClick: PropTypes.func.isRequired
};

export default Button;
