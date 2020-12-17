import React, { Component } from 'react';
import Loader from './reusable/Loader';
import NotFound from './reusable/NotFound';
import { sortByDateDesc, dateToStr } from '../helpers/helpers';
import { A } from './reusable/Navigate';
import * as Constants from './Constants';
import DocumentTitle from 'react-document-title';
import DOMPurify from 'dompurify';

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
        <p className="archived-traveller-field">Začiatok: {traveller.startMiesto + " "} {dateToStr(traveller.startDate)}</p>
        <p className="archived-traveller-field">Koniec: {dateToStr(traveller.endDate)}</p>
        <div className="archived-traveller-text">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(traveller.text) }} />
        </div>
        <A href={`/na/${traveller.userId}${Constants.FromOldQuery}`} >
          Sleduj celé putovanie...
        </A>
      </div>
    );
  }

  render() {
    return (
      <div id="NaCesteArchive">
        <DocumentTitle title={`Archív${Constants.WebTitleSuffix}`} />
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
