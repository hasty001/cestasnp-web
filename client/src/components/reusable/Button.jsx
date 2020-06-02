import React from 'react';
import PropTypes from 'prop-types';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = ({ label, variant }) => {
  return <BootstrapButton bsStyle={variant}>{label}</BootstrapButton>;
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf('primary').isRequired
};

export default Button;
