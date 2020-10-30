import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { fetchJson } from '../helpers/fetchUtils';
import ItineraryTable from './reusable/ItineraryTable';
import PageWithLoader from './reusable/PageWithLoader';
import * as Texts from './Texts';

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

  useEffect(() => { fetchData(); }, []);

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
    <PageWithLoader pageId="Itinerary" loading={loading} error={error} >
      <>
        <div className="no-print">
          <button
            className="snpBtn"
            onClick={showDialog}
            type="button"
          >
            Nastavenie
          </button>
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
            <label htmlFor="start" className="itinerary-dialog-label" >
              Začiatok:
              <select id="start" value={dialogStartEnd ? dialogStartEnd[0] : null}
                onChange={e => setDialogStartEnd([parseInt(e.target.value), dialogStartEnd[1]])} >
                {!!itinerary && itinerary.filter(item => item.main).map((item, i) => 
                  (<option key={i} value={item.id} label={item.name + (item.ele ? (` ${item.ele} m`) : '')}/>))}
              </select>
            </label>
            <label htmlFor="end" className="itinerary-dialog-label" >
              Koniec:
              <select id="end" value={dialogStartEnd ? dialogStartEnd[1] : null}
              onChange={e => setDialogStartEnd([dialogStartEnd[0], parseInt(e.target.value)])} >
                {!!itinerary && itinerary.filter(item => item.main).map((item, i) => 
                  (<option key={i} value={item.id} label={item.name + (item.ele ? (` ${item.ele} m`) : '')}/>))}
              </select>
            </label>
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
