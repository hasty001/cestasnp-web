import React from 'react';
import PropTypes from 'prop-types';

const SubHeader = ({ label }) => {
  return <h4>{label}</h4>;
};

SubHeader.propTypes = {
  label: PropTypes.string.isRequired
};

export default SubHeader;
