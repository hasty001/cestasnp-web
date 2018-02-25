import React, { Component } from 'react';
import Map from './Map';
import Loader from './Loader';

class Na extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      travellerId: parseInt(this.props.match.params.traveller),
      travellerData: {
        meno: '',
        text: '',
        articleID: '',
        start_miesto: '',
        start_date: '',
        end_date: '',
        completed: ''
      }
    };
  }

  componentDidMount() {
    fetch('/api/traveller/' + this.state.travellerId)
      .then(resp => resp.json())
      .then(data => {
        let travellerData = {};
        travellerData.meno = data[0].meno;
        travellerData.text = data[0].text;
        travellerData.articleID = data[0].articleID;
        travellerData.start_miesto = data[0].start_miesto;
        travellerData.start_date = data[0].start_date;
        travellerData.end_date = data[0].end_date;
        travellerData.completed = data[0].completed;
        this.setState({
          travellerData
        });
      })
      .then(() => {
        this.setState({
          loading: false
        });
      })
      .catch(e => {
        throw e;
      });
  }

  render() {
    return (
      <div className="na-container">
        {/* <p>
        Na sekcii "Na ceste" momentálne pracujeme. Ale keď ju dokončíme, toto bude to miesto kde
        budeš môcť sledovať a povzbudiť svojich kamarátov, ktorí sa vydajú na cestu a zapoja do LIVE
        sledovania. Tí čo sa pripravujete na cestu v sezóne 2018, svoje prípravy môžete začať v
        sekcii <a href="/pred/articles/1">Články</a> kde nájdete kopec užitočných informácií, ktoré
        sme doteraz zozbierali. Prípadne ti s plánovaním môže pomôcť naša zbierka{' '}
        <a href="/pred/pois">dôležitých miest</a>. Čím skôr si nahlás dovolenku. Máj sa blíži! ;)
      </p> */}
        <div className="na-details-container">
          <ul>
            <li>bla</li>
            <li>bla</li>
            <li>bla</li>
          </ul>
        </div>
        <div className="na-map-container">
          <Map use="na-ceste" />
        </div>
        <div className="na-data-container">
          {this.state.loading && <Loader />}
          {!this.state.loading &&
            Object.keys(this.state.travellerData).map((key, i) => {
              return (
                <p key={i}>
                  {key}
                  {': '}
                  {this.state.travellerData[key]}
                </p>
              );
            })}
        </div>
      </div>
    );
  }
}

export default Na;
