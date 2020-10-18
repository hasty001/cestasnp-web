import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Loader from './reusable/Loader';

class Itinerary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showDialog: false,
      start: null,
      emd: null,
      itinerary: [],
      dialog: { start: null, end: null }
    };

    this.dialog = this.dialog.bind(this);
    this.handleDialog = this.handleDialog.bind(this);
  }

  componentDidMount() {
    fetch('/api/itinerary')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          itinerary: data,
          loading: false
        });
      });
  }

  dialog(e) {
    e.preventDefault();

    this.setState({ dialog: { 
      start: this.state.start || this.state.itinerary[0].id, 
      end: this.state.end || this.state.itinerary[this.state.itinerary.length - 1].id}, showDialog: true });
  }

  handleDialog(apply) {
    if (apply) {
      this.setState({ start: this.state.dialog.start, end: this.state.dialog.end });
    }
    
    this.setState({ showDialog: false });
  }

  render() {
    const formatNumber = (value, digits) => {
      if (Number && !isNaN(value)) {
        if (digits && !!(typeof Intl == 'object' && Intl && typeof Intl.NumberFormat == 'function')) {
          return value.toLocaleString("sk-SK", {minimumFractionDigits: digits, maximumFractionDigits: digits});
        } else {        
          return value.toLocaleString("sk-SK");
        }
      }

      return value;
    }

    const formatHours = (value) => { // ceil to 5 minutes
      const hours = parseInt(Math.ceil(value * 12) / 12);
      const minutes =  value > hours ? parseInt(Math.ceil((value - hours) * 12) * 5).toString() : '00';

      return `${hours}:${minutes.length == 2 ? minutes : '0' + minutes}`;
    }

    var itinerary = [];
    var startIndex = 0;
    var endIndex = this.state.itinerary ? this.state.itinerary.length - 1 : 0;
    if (!this.state.loading && this.state.itinerary) {
      startIndex = this.state.itinerary.findIndex(n => n.id === this.state.start);
      endIndex = this.state.itinerary.findIndex(n => n.id === this.state.end);

      if (startIndex < 0) startIndex = 0;
      if (endIndex < 0) endIndex = this.state.itinerary.length - 1;

      const reverse = startIndex > endIndex;
      if (reverse) {
        const t = startIndex;
        startIndex = endIndex;
        endIndex = t;
      }

      const getPoiInfo = (poi, index, reverse) => {
        const getInfo = () => poi.itinerary.info ? (poi.itinerary.info
          .replace("[pred]", reverse ? "za" : "pred")
          .replace("[za]", reverse ? "pred" : "za")
          .replace("[vľavo]", reverse ? "vpravo" : "vľavo")
          .replace("[vpravo]", reverse ? "vľavo" : "vpravo")) 
          : (poi.name + (poi.text ? (" - " + poi.text) : ""));

        const getIcon = () => {
          if (poi.category === "pramen") return (<i className="fas fa-tint"/>);
          if (poi.category === "pristresok") return (<i className="fas fa-umbrella"/>);
          if (poi.category === "chata") return (<i className="fas fa-bed"/>);
          if (poi.category === "utulna") return (<i className="fas fa-home"/>);
          if (poi.category === "krcma_jedlo") return (<i className="fas fa-utensils"/>);
          if (poi.category === "potraviny") return (<i className="fas fa-shopping-basket"/>);

          return null;
        }

        return (<div key={index}><a id={`P${poi._id}`} href={`/pred/pois?poi=${poi._id}&lat=${poi.coordinates[1]}&lon=${poi.coordinates[0]}`}>
          {getIcon()}{" " + getInfo()}</a></div>);
      };

      var filtered = this.state.itinerary.slice(startIndex, endIndex + 1);
      itinerary = filtered.map((f, i, items) => { return {
          id: f.id,
          km: f.km - filtered[0].km,
          kmTo: f.kmTo - filtered[filtered.length - 1].kmTo,
          name: f.name,
          ele:  f.ele,
          lat: f.lat,
          lon: f.lon,
          dist: i < items.length - 1 ? f.dist : 0,
          asphalt: i < items.length - 1 ? f.asphalt : 0,
          altUp: i < items.length - 1 ? f.altUp : 0,
          altDown: i < items.length - 1 ? f.altDown : 0,
          time: i < items.length - 1 ? f.time : 0,
          info: f.info ? f.info.map((p, i) => getPoiInfo(p, i, reverse)) : null,
          infoAfter: f.infoAfter ? f.infoAfter.map((p, i) => getPoiInfo(p, i, reverse)) : null,
        };});

        if (reverse) {
          itinerary.reverse();
          // switch alt up <> down, km <> kmTo
          for (var i = 0; i < itinerary.length; i++) {
            var notLast = i < itinerary.length - 1;

            const t = itinerary[i].km;
            itinerary[i].km = itinerary[i].kmTo;
            itinerary[i].kmTo = t;
            itinerary[i].dist = notLast ? itinerary[i + 1].dist : 0;
            itinerary[i].asphalt = notLast ? itinerary[i + 1].asphalt : 0;
            itinerary[i].altUp = notLast ? itinerary[i + 1].altDown : 0;
            itinerary[i].altDown = notLast ?  itinerary[i + 1].altUp : 0;
            itinerary[i].time = notLast ?  itinerary[i + 1].time : 0;
            itinerary[i].infoAfter = notLast ?  itinerary[i + 1].infoAfter : null;
          }
        }
    }

    return (
      <div id="Itinerary">
        {this.state.loading && <Loader />}
        {!this.state.loading && this.state.itinerary && (
          <>
          <div className="no-print">
            <button
              className="snpBtn"
              onClick={this.dialog}
              type="button"
            >
              Nastavenie
            </button>
          </div>
          <Modal show={this.state.showDialog}
            onHide={() => this.handleDialog(false)}
            dialogClassName="itinerary-dialog" >
            <Modal.Header closeButton>
              <Modal.Title>
                Nastavenie
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label htmlFor="start" className="itinerary-dialog-label" >
                Začiatok:
                <select id="start" value={this.state.dialog.start}
                  onChange={e => this.setState({ dialog: { start: parseInt(e.target.value), end: this.state.dialog.end } })} >
                  {this.state.itinerary.filter(item => item.main).map((item, i) => 
                    (<option key={i} value={item.id} label={item.name + (item.ele ? (` ${item.ele} m`) : '')}/>))}
                </select>
              </label>
              <label htmlFor="end" className="itinerary-dialog-label" >
                Koniec:
                <select id="end" value={this.state.dialog.end}
                onChange={e => this.setState({ dialog: { start: this.state.dialog.start, end: parseInt(e.target.value) } })} >
                  {this.state.itinerary.filter(item => item.main).map((item, i) => 
                    (<option key={i} value={item.id} label={item.name + (item.ele ? (` ${item.ele} m`) : '')}/>))}
                </select>
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => this.handleDialog(true)}>Použij</Button>
            </Modal.Footer>
          </Modal>

          <table className="table-itinerary">
          <thead>
            <tr>
              <th className="itinerary-value">Km</th>
              <th className="itinerary-value">Km</th>
              <th>Razcestie</th>
              <th className="itinerary-value">Vzdialenosť (km)</th>
              <th className="itinerary-value">Asfalt (km)</th>
              <th className="itinerary-value">Stúpanie (m)</th>
              <th className="itinerary-value">Klesanie (m)</th>
              <th className="itinerary-value">Čas (h)</th>
              <th>Poznámky</th>
            </tr>
          </thead>
          <tbody>
            {itinerary.map((item, i, items) => {
              const guidepostName = item.name + (item.ele ? (` ${formatNumber(item.ele)} m`): "");
              return (
              <Fragment key={i}>
                <tr className="itinerary-row-guidepost">
                  <td className="itinerary-value">{formatNumber(item.km, 1)}</td>
                  <td className="itinerary-value">{formatNumber(item.kmTo, 1)}</td>
                  <td colSpan={6}>
                    <a id={`G${item.id}`} href={`/pred/pois?guidepost=${encodeURIComponent(guidepostName)}&lat=${item.lat}&lon=${item.lon}`}>
                      <b>{guidepostName}</b>
                    </a>
                  </td>
                  <td>{item.info}</td>
                </tr>
                {i < items.length - 1 ? (
                  <tr>
                    <td colSpan={3}></td>
                    <td className="itinerary-value">{formatNumber(item.dist, 1)}</td>
                    <td className="itinerary-value">{formatNumber(item.asphalt, 1)}</td>
                    <td className="itinerary-value">{formatNumber(item.altUp)}</td>
                    <td className="itinerary-value">{formatNumber(item.altDown)}</td>
                    <td className="itinerary-value">{formatHours(item.time)}</td>
                    <td>{item.infoAfter}</td>
                  </tr>
                ) : null}
              </Fragment>);
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}></td>
              <td className="itinerary-value"><b>{formatNumber(itinerary.reduce((r, t) => r + t.dist, 0), 1)}</b></td>
              <td className="itinerary-value"><b>{formatNumber(itinerary.reduce((r, t) => r + t.asphalt, 0), 1)}</b></td>
              <td className="itinerary-value"><b>{formatNumber(itinerary.reduce((r, t) => r + t.altUp, 0))}</b></td>
              <td className="itinerary-value"><b>{formatNumber(itinerary.reduce((r, t) => r + t.altDown, 0))}</b></td>
              <td className="itinerary-value"><b>{formatHours(itinerary.reduce((r, t) => r + t.time, 0))}</b></td>
            </tr>
          </tfoot>  
          </table>
          <p style={{textAlign: "right"}}><br/><br/>Data: © Prispievatelia <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></p>
          </>
        )}
      </div>
    );
  }
}

export default Itinerary;
