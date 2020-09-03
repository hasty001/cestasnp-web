import React, { Component } from 'react';
import { NavItem } from 'react-bootstrap';
import Loader from './reusable/Loader';
import NotFound from './reusable/NotFound';
import { sortByDateDesc } from '../helpers/helpers';

import history from '../helpers/history';

class Archive extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      fullyCompleted: [],
      partiallyCompleted: []
    };
  }

  componentDidMount() {
    fetch('/api/traveller/finishedTravellers')
      .then(resp => resp.json())
      .then(data => {
        const fully = [];
        const partially = [];
        data.forEach(traveller => {
          // TODO - :)
          if (traveller.end_date !== 'NULL') {
            const travellerData = {};
            travellerData.meno = traveller.meno;
            travellerData.text = traveller.text;
            travellerData.userId = traveller.user_id;
            travellerData.startMiesto = traveller.start_miesto;
            travellerData.startDate = traveller.start_date;
            travellerData.endDate = traveller.end_date;
            travellerData.completed = traveller.completed;
            if (travellerData.completed) {
              fully.push(travellerData);
            } else {
              partially.push(travellerData);
            }
          }
        });

        sortByDateDesc(fully, 'startDate');
        sortByDateDesc(partially, 'startDate');

        this.setState({
          fullyCompleted: fully,
          partiallyCompleted: partially,
          loading: false
        });
      })
      .catch(e => {
        this.setState({
          error: true
        });
        throw e;
      });
  }

  getArchiveCard(traveller, i)
  {
    return (
      <div key={i} className="archived-traveller">
        <p className="archived-traveller-field name">{traveller.meno}</p>
        <p className="archived-traveller-field">Začiatok: {traveller.startMiesto + " "} {traveller.startDate.substring(0, 11)}</p>
        <p className="archived-traveller-field">Koniec: {traveller.endDate.substring(0, 11)}</p>
        <div className="archived-traveller-text">
          <p dangerouslySetInnerHTML={{ __html: traveller.text }} />
        </div>
        <NavItem
          onClick={() => {
            history.push(`/na/${traveller.userId}#from-old`);
          }}
        >
          Sleduj celé putovanie...
        </NavItem>
      </div>
    );
  }

  render() {
    return (
      <div id="NaCesteArchive">
        {this.state.loading && !this.state.error && <Loader />}

        {!this.state.loading && !this.state.error && this.state.fullyCompleted && (
          <div>
            <h2>Cestu prešli celú:</h2>
            <div className="archived-travellers">
              {
                this.state.fullyCompleted.map((traveller, i) => {
                  return this.getArchiveCard(traveller, i);
                })
              }
            </div>
          </div>
        )}

        {!this.state.loading &&
          !this.state.error &&
          this.state.partiallyCompleted && (
            <div>
              <h2>Cestu prešli čiastočne:</h2>
              <div className="archived-travellers">
                {
                  this.state.partiallyCompleted.map((traveller, i) => {
                    return this.getArchiveCard(traveller, i);
                  })
                }
              </div>
            </div>
          )}

        {this.state.error && <NotFound />}
      </div>
    );
  }
}

export default Archive;
