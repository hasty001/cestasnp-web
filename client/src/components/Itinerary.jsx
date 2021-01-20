import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { fetchJson } from '../helpers/fetchUtils';
import FormSelect from './reusable/FormSelect';
import ItineraryTable from './reusable/ItineraryTable';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { navigate } from './reusable/Navigate';

const Itinerary = (props) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startEnd, setStartEnd] = useState(null);
  const [dialogStartEnd, setDialogStartEnd] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);

  const fetchData = () => fetchJson('/api/itinerary')
    .then(data => {
      setStartEnd(startEnd || (data.length > 0 ? [data[0].id, data[data.length - 1].id] : null));
      setItinerary(data);
      setLoading(false);
    })
    .catch(e => {
      console.error(e);

      setLoading(false);
      setError(Texts.GenericError);
    });

  useEffect(() => { 
    fetchData()
      .then(() => { 
        if (window.location.hash && window.location.hash != "#") {
          const elem = window.document.getElementById(window.location.hash.replace('#', ''));
          if (elem) {
            elem.scrollIntoView();
          }
        };
      });
  }, []);

  const showDialog = (e) => {
    e.preventDefault();

    setDialogStartEnd(startEnd);
    setDialogVisible(true);
  }

  const handleDialog = (apply) => {
    if (apply) {
      setStartEnd(dialogStartEnd);
    }
    
    setDialogVisible(false);
  }

  return (
    <PageWithLoader pageId="Itinerary" loading={loading} error={error} pageTitle={`Itinerár${Constants.WebTitleSuffix}`} >
      <>
        <div className="no-print">
          <button className="snpBtn pois-map-link no-print" title="Na mape" onClick={() => navigate('/pred/pois')}><i className="fas fa-map"></i></button>
          <button className="snpBtn" onClick={showDialog} type="button">Nastavenie</button>
        </div>
        
        <Modal show={dialogVisible}
          onHide={() => handleDialog(false)}
          dialogClassName="itinerary-dialog" >
          <Modal.Header closeButton>
            <Modal.Title>
              Nastavenie
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormSelect value={[dialogStartEnd ? dialogStartEnd[0] : null, (value) => setDialogStartEnd([parseInt(value), dialogStartEnd[1]])]}
              valueLabel="Začiatok:" valueName="start" itemClassName="form" 
              options={itinerary ? itinerary.filter(item => item.main).map(item => { 
                return { value: item.id, label: item.name + (item.ele ? (` ${item.ele} m`) : '') }; }) : null}>
            </FormSelect>

            <FormSelect value={[dialogStartEnd ? dialogStartEnd[1] : null, (value) => setDialogStartEnd([dialogStartEnd[0], parseInt(value)])]}
              valueLabel="Koniec:" valueName="end" itemClassName="form" 
              options={itinerary ? itinerary.filter(item => item.main).map(item => { 
                return { value: item.id, label: item.name + (item.ele ? (` ${item.ele} m`) : '') }; }) : null}>
            </FormSelect>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setDialogStartEnd([dialogStartEnd[1], dialogStartEnd[0]])}>Otoč</Button>
            <Button variant="primary" onClick={() => handleDialog(true)}>Použij</Button>
          </Modal.Footer>
        </Modal>

        <ItineraryTable itinerary={itinerary} start={startEnd ? startEnd[0] : null} end={startEnd ? startEnd[1] : null}/>
      </>
    </PageWithLoader>
  );
}

export default Itinerary;
