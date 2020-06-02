import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '../reusable/Button';

const MyAccountInfo = ({ onTabChange }) => {
  const onButtonClick = useCallback(
    id => () => {
      onTabChange(id);
    },
    [onTabChange]
  );
  return (
    <div>
      <Button variant="primary">Vydaj sa na cestu</Button>
      <Button variant="primary" onClick={onButtonClick(2)}>
        Pridaj bod záujmu
      </Button>
      <Button variant="primary">Odhlásiť</Button>
    </div>
  );
};

MyAccountInfo.propTypes = {
  onTabChange: PropTypes.func.isRequired
};
export default MyAccountInfo;
