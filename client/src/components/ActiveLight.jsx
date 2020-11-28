import React, { Component, Fragment } from 'react';
import format from 'date-fns/format';
import { dateToStr, dateTimeToStr } from '../helpers/helpers';
import { A } from './reusable/Navigate'

import Loader from './reusable/Loader';
import DocumentTitle from 'react-document-title';
import SimpleMasonry from './reusable/SimpleMasonry';
import * as Constants from './Constants';

class ActiveLight extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: null,
      loading: true,
      error: false,
      travellers: [],
      box: props.box
    };
  }

  componentDidMount() {
    const now = format(new Date(), 'YYYY-MM-DD');
        
    fetch('/api/traveller/activeTravellersWithLastMessage' + window.location.search)
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
          travellerData.finishedTracking = traveller.finishedTracking;
          travellerData.lastImg = traveller.lastImg;
          travellerData.lastImgMsgId = traveller.lastImgMsgId;

          travellers.push(travellerData);
          travellerIds.push(traveller.user_id);
        });

        const getSortValue = t => (t.finishedTracking ? "11_" + t.startDate : ("0"
         + (t.startDate <= now && t.lastMessage ? ("0_" + t.lastMessage.pub_date) : ("1_" + t.startDate))));

        travellers.sort((a, b) => getSortValue(a) > getSortValue(b));
        
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
    const images = this.state.travellers ? 
      this.state.travellers.filter(t => t.lastImg).map(t => {
        const url = `/na/${t.userId}${t.finishedTracking ? Constants.FromOldQuery : ''}#${t.lastImgMsgId}`;
        const title = t.meno;

        if (t.lastImg.eager && t.lastImg.eager.length > 1) {
          return { url: url, title: title, src: t.lastImg.eager[1].secure_url, aspect: t.lastImg.height / t.lastImg.width };
        } if (t.lastImg.eager) {
          return { url: url, title: title, src: t.lastImg.eager[0].secure_url, aspect: t.lastImg.height / t.lastImg.width };
        } else {
          return { url: url, title: title, src: t.lastImg.indexOf('res.cloudinary.com') === -1
              ? `https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/${t.lastImg}`
              : t.lastImg, aspect: 2 / 3}
        }
      }) : [];

    const hasActive = this.state.travellers ? 
      this.state.travellers.reduce((r, t) => r || !t.finishedTracking && t.startDate <= this.state.now, false) : false;

    const hasPlanning =  this.state.travellers ? 
      this.state.travellers.reduce((r, t) => r || !t.finishedTracking && t.startDate > this.state.now, false) : false;

    const limit = (text, use) => {
      return use && text && text.length > Constants.LiveBoxMaxTextLength ? 
        text.slice(0, Constants.LiveBoxMaxTextLength) + "…" : text;
    }

    return (
      <div id="NaCesteActiveLight">
        {!this.props.box && <DocumentTitle title={`LIVE sledovanie${Constants.WebTitleSuffix}`} />}
        {this.state.loading && !this.state.error && <Loader />}
        {!this.state.loading && !this.state.error && this.state.travellers && (
            <div className="active-travellers-list">
              {!hasActive && (
                <div className="active-travellers-info">
                  <p>
                    {hasPlanning ?
                      "Momentálne nie je nikto na ceste, ale môžeš si pozrieť, kto cestu plánuje, alebo nedávna zaujímavá putovanie:"
                      : "Momentálne nie je nikto na ceste ani cestu neplánuje, ale môžeš si pozrieť nedávna zaujímavá putovanie:"}</p>
                </div>
              )}

              {this.state.box && images && images.length > 0 && 
                (<SimpleMasonry images={images} targetHeight={250} />)}

              {this.state.travellers.map((traveller, i) => {
                return (    
                      <div className="active-traveller-item" key={i} >
                        <strong>                       
                          {(!traveller.finishedTracking && !!traveller.lastMessage && (traveller.startDate <= this.state.now)) &&  (
                          <span>
                            {dateTimeToStr(traveller.lastMessage.pub_date)}{' '}
                          </span>)} 

                          {((traveller.startDate > this.state.now) || !traveller.lastMessage) && (
                          <span>
                            {dateToStr(traveller.startDate)}                           
                            {' '}{traveller.startMiesto}{' '}
                          </span>)}  
                          {traveller.finishedTracking && (
                          <span>
                            {'- '}{dateToStr(traveller.endDate)}{' '}
                          </span>)}  

                          <A href={`/na/${traveller.userId}${traveller.finishedTracking ? Constants.FromOldQuery : ""}`}>
                            {traveller.meno}                          
                          </A>
                        </strong>

                        <span>
                          <br/>
                          <span dangerouslySetInnerHTML={{ __html: 
                              traveller.finishedTracking || !traveller.lastMessage ? 
                                limit(traveller.text, this.state.box) : limit(traveller.lastMessage.text, this.state.box) }} />
                        </span>                       
                      </div>                          
                );
              })}
            </div>
        )}

        {this.state.error && (
          <div>            
            <p style={{ margin: '10px' }}>
              Momentálne nie je nikto na ceste.
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default ActiveLight;
