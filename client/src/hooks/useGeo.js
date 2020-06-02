import { useEffect, useState } from 'react';

const options = {
  timeout: 8000,
  enableHighAccuracy: true
};

const useGeoPosition = () => {
  const [position, setPosition] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: coords.latitude.toFixed(6),
          lon: coords.longitude.toFixed(6),
          accuracy: coords.accuracy
        });
        setLoading(false);
      },
      err => {
        console.error('err ', err.message);
        setError(err.message);
        setLoading(false);
      },
      options
    );
  }, []);

  return { error, position, loading };
};

export default useGeoPosition;
