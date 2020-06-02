import React from 'react';
import Button from '../reusable/Button';
import history from '../../helpers/history';
import { ROUTES } from '../Navigation';

const MyAccountInfo = () => {
  const onAddPoisClick = () => {
    history.push(ROUTES.addPois);
  };
  return (
    <div>
      <Button variant="primary">Vydaj sa na cestu</Button>
      <Button variant="primary" onClick={onAddPoisClick}>
        Pridaj bod záujmu
      </Button>
      <Button variant="primary">Odhlásiť</Button>
    </div>
  );
};

export default MyAccountInfo;
