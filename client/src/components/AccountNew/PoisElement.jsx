import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const PoisElement = ({ header, description, addedOn, className }) => {
  const targetClassname = classNames('', className);
  return (
    <div className={targetClassname}>
      <div>
        <span>{header}</span>
        <span>{addedOn}</span>
      </div>
      <div>{description}</div>
    </div>
  );
};

PoisElement.defaultProps = {
  className: ''
};

PoisElement.propTypes = {
  className: PropTypes.string,
  header: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  addedOn: PropTypes.string.isRequired
};

export default PoisElement;
