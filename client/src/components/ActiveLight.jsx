import React, { Component, Fragment } from 'react';
import format from 'date-fns/format';

import Loader from './reusable/Loader';

class ActiveLight extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: null,
      loading: true,
      error: false,
      travellers: []
    };
  }

  componentDidMount() {
    const now = format(new Date(), 'YYYY-MM-DD');
        
    fetch('/api/traveller/activeTravellersWithLastMessage')
      .then(resp => resp.json())
      .then(data => {
        const travellers = [];
        const travellerIds = [];
        data.forEach(traveller => {
          const travellerData = {};
          travellerData.meno = traveller.meno;
          travellerData.text = traveller.text;
          travellerData.userId = traveller.user_id;
          travellerData.startMiesto = traveller.start_miesto;
          travellerData.startDate = format(traveller.start_date, 'YYYY-MM-DD');
          travellerData.endDate = traveller.end_date;
          travellerData.lastMessage = traveller.lastMessage;

          travellers.push(travellerData);
          travellerIds.push(traveller.user_id);
        });

        travellers.sort((a, b) => 
            ((b.startDate <= now && a.startDate <= now) 
              && ((b.lastMessage && a.lastMessage && b.lastMessage.pub_date > a.lastMessage.pub_date) || (b.lastMessage && !a.lastMessage))) 
              ? 1 : ((b.startDate <= now && a.startDate <= now) && ((b.lastMessage && a.lastMessage && b.lastMessage.pub_date < a.lastMessage.pub_date) || (!b.lastMessage && a.lastMessage))) 
              ? -1 : (a.startDate > b.startDate) ? 1: (a.startDate < b.startDate) ? -1 : 0);
        
        if (travellers.length === 0) {
          this.setState({
            travellers,
            error: true
          });
        } else {          
          this.setState({
            now,
            travellers,
            loading: false
          });
        }
      })
      .catch(e => {
        this.setState({
          error: true
        });
        throw e;
      });
  }

  render() {
    return (
      <div id="NaCesteActiveLight">
        {this.state.loading && !this.state.error && <Loader />}

        {!this.state.loading && !this.state.error && this.state.travellers && (
            <div className="active-travellers-list">
              {this.state.travellers.map((traveller, i) => {
                return (    
                      <div
                        className="active-traveller-item"
                      >
                        {(!!traveller.lastMessage && (traveller.startDate <= this.state.now)) &&  (
                        <span>
                          {traveller.lastMessage.pub_date}{' '}
                        </span>)} 

                        {((traveller.startDate > this.state.now) || !traveller.lastMessage) && (
                        <span>
                          {traveller.startDate.substring(8, 10)}
                          {'.'}
                          {traveller.startDate.substring(5, 7)}
                          {'.'}
                          {traveller.startDate.substring(0, 4)}
                          {' '}{traveller.startMiesto}{' '}
                        </span>)}  

                        <a href={`/na/${traveller.userId}`}>
                          {traveller.meno}
                        </a>

                        {!!traveller.lastMessage && (
                        <span>
                          <br/>
                          <span dangerouslySetInnerHTML={{ __html: traveller.lastMessage.text }} />
                        </span>)}                         
                      </div>                          
                );
              })}
            </div>
        )}

        {this.state.error && (
          <div>            
            <p style={{ marginTop: '10px' }}>
              Momentálne nie je nikto na ceste.
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default ActiveLight;
