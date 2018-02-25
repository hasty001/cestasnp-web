import React, { Component } from 'react';
import Map from './Map';

class Na extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      travellerId: parseInt(this.props.match.params.traveller),
      travellerData: []
    };
  }

  componentDidMount() {
    console.log('hi');
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
          <ul>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
            <li>blablabla</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Na;
