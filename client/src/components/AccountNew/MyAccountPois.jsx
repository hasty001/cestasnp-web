import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import Header from '../reusable/Headers/Header';
import history from '../../helpers/history';
import { ROUTES } from '../Navigation';
import Button from '../reusable/Button';
import PoisElement from './PoisElement';

const MyAccountPois = () => {
  const onAddNewClicked = () => {
    history.push(ROUTES.addPois);
  };
  return (
    <div>
      <div className="flex items-center">
        <Header label="Moje body záujmu" />
        <Button onClick={onAddNewClicked} variant="link">
          <Glyphicon glyph="plus" className="mt-6" />
        </Button>
      </div>
      <div>
        <PoisElement
          label="Studnicka"
          addedOn="25.05.2015"
          description="Moj velmi dlhy popis bodu zaujmu. Spolu s dalsimi detailnymi info"
        />
        <PoisElement
          label="Studnicka"
          addedOn="25.05.2015"
          description="Moj velmi dlhy popis bodu zaujmu. Spolu s dalsimi detailnymi info"
        />
        <PoisElement
          label="Studnicka"
          addedOn="25.05.2015"
          description="Moj velmi dlhy popis bodu zaujmu. Spolu s dalsimi detailnymi info"
        />
      </div>
    </div>
  );
};

export default MyAccountPois;
