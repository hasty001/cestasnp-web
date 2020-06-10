import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Input = ({ type, value, onChange, placeholder, className }) => {
  const targetClassname = classNames('Input', className);
  const onChangeHandler = e => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      className={targetClassname}
      type={type}
      value={value}
      onChange={onChangeHandler}
      placeholder={placeholder}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf(['text', 'number']).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

Input.defaultProps = {
  value: '',
  placeholder: '',
  className: ''
};

export default Input;
