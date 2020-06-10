import React from 'react';
import SelectMe from 'react-select-me';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Select = ({ options, onChange, value, label, className, error }) => {
  const targetClassname = classNames('flex flex-column', className);
  return (
    <div className={targetClassname}>
      {label && <span>{label}</span>}
      {error && <span className="errorText">{error}</span>}
      <SelectMe options={options} onChange={onChange} value={value} />
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  className: PropTypes.string
};

Select.defaultProps = {
  value: '',
  label: null,
  className: '',
  error: ''
};

export default Select;
