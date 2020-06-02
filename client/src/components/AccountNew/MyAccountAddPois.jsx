import React from 'react';
import Header from '../reusable/Header';
import Button from '../reusable/Button';
import useGeoPosition from '../../hooks/useGeo';

// const initialState = { geo: null };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'increment':
//       return { count: state.count + 1 };
//     case 'decrement':
//       return { count: state.count - 1 };
//     default:
//       throw new Error();
//   }
// };
// TODO - add notification about error/ success of getGEO
const MyAccountAddPois = () => {
  const { position, error, loading } = useGeoPosition();
  console.log(error);

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
    </div>
  );
};

export default MyAccountAddPois;
