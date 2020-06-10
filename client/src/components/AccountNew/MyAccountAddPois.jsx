import React, { useState } from 'react';
import { Glyphicon } from 'react-bootstrap';
import Button from '../reusable/Button';
import useGeoPosition from '../../hooks/useGeo';
import SubHeader from '../reusable/Headers/SubHeader';
import Header from '../reusable/Headers/Header';
import Select from '../reusable/Select';
import Input from '../reusable/Input';

const createInitialFormValue = () => {
  return {
    type: '',
    description: ''
  };
};

// TODO - add notification about error/ success of getGEO
// TODO - Plug upload photo funcionality
const MyAccountAddPois = () => {
  const { position, error, loading } = useGeoPosition();
  const [values, setValues] = useState([createInitialFormValue()]);
  console.log(error);

  const onAddNewPoisClicked = () => {
    setValues(prevState => {
      return [...prevState, createInitialFormValue(prevState.length)];
    });
  };

  const onRemovePoisClicked = id => () => {
    setValues(prevState => {
      return prevState.filter((_, i) => i !== id);
    });
  };

  const onFormValueChanged = (index, field) => value => {
    setValues(prevState => {
      const newState = [...prevState];
      newState[index][field] = value;
      return newState;
    });
  };
  const onFormSubmit = () => {
    const hasErrors = values.reduce((acc, value) => {
      return acc || !value.type;
    }, false);
    if (hasErrors) {
      window.alert('Please correct form errors');
    } else {
      window.alert('Plug backend call here');
    }
  };
  return (
    <div className="flex flex-column">
      <Header label="Pridaj bod záujmu" />
      <div>
        {loading || !position
          ? 'Position Loading...'
          : `Position : ${position.lat} ${position.lon}`}
      </div>
      <div>
        <Button variant="primary">Nahraj Fotku</Button>
      </div>
      <div className="flex items-center">
        <SubHeader label="Body záujmu v okolí" />
        <Button onClick={onAddNewPoisClicked} variant="link">
          <Glyphicon glyph="plus" className="mt-2" />
        </Button>
      </div>
      {values.map((value, index) => {
        const { description, type } = value;
        const showDelete = values.length !== 1;
        return (
          <div className="flex mt-6 items-end" key={index}>
            <Select
              label="Typ"
              value={type}
              className="w-10"
              options={[
                { value: 'cottage', label: 'Chata' },
                { value: 'well', label: 'Studnicka' }
              ]}
              error={type ? '' : 'Typ musi byt vyplneny'}
              onChange={onFormValueChanged(index, 'type')}
            />
            <Input
              className="ml-2"
              value={description}
              onChange={onFormValueChanged(index, 'description')}
            />
            {showDelete && (
              <Button onClick={onRemovePoisClicked(index)} variant="link">
                <Glyphicon glyph="trash" className="mt-2" />
              </Button>
            )}
          </div>
        );
      })}
      <div>
        <Button variant="primary" onClick={onFormSubmit}>
          Odoslať
        </Button>
      </div>
    </div>
  );
};

export default MyAccountAddPois;
