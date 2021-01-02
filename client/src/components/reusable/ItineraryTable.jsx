import React, { Fragment } from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import PoiIcon from './PoiIcon';
import { A } from './Navigate';
import { escapeHtml } from '../../helpers/helpers';
import DOMPurify from 'dompurify';

const ItineraryTable = (props) => {

  const [insertNear, setInsertNear] = useStateProp(props.insertNear);
  const [insertAfter, setInsertAfter] = useStateProp(props.insertAfter);
  
  var itinerary = [];
  var insertInfo = '';
  var startIndex = 0;
  var endIndex = props.itinerary ? props.itinerary.length - 1 : 0;
  if (props.itinerary && props.itinerary.length > 0) {
    startIndex = props.itinerary.findIndex(n => n.id === props.start);
    endIndex = props.itinerary.findIndex(n => n.id === props.end);

    if (startIndex < 0) startIndex = 0;
    if (endIndex < 0) endIndex = props.itinerary.length - 1;

    const reverse = startIndex > endIndex;
    if (reverse) {
      const t = startIndex;
      startIndex = endIndex;
      endIndex = t;
    }

    const getPoiInfo = (poi, index, reverse, info = null) => {
      const getInfo = () => (info || (poi.itinerary &&  poi.itinerary.info)) ? 
        escapeHtml(((info || poi.itinerary.info)
          .replaceAll("[pred]", reverse ? "za" : "pred")
          .replaceAll("[za]", reverse ? "pred" : "za")
          .replaceAll("[vľavo]", reverse ? "vpravo" : "vľavo")
          .replaceAll("[vpravo]", reverse ? "vľavo" : "vpravo")) 
          .replaceAll(/\[(.+?)\|(.+?)\]/gms, reverse ? "$2" : "$1"))
        : [escapeHtml(poi.name), DOMPurify.sanitize(poi.text)].filter(s => s && s.trim().length > 0).join(" - ");

      return (
        <div key={index}>
          <A id={`p${poi._id}`} 
            href={`/pred/pois${poi._id ? `/${poi._id}` : `#lat=${poi.coordinates[1]}&lon=${poi.coordinates[0]}&zoom=13`}`}>
              <PoiIcon value={poi} />{` `}<span dangerouslySetInnerHTML={{ __html: getInfo() }}></span>
          </A>
        </div>);
    };

    insertInfo = props.insert ? getPoiInfo(props.insert, -1, reverse, props.insertInfo) : '';

    var filtered = props.itinerary.slice(startIndex, endIndex + 1);
    itinerary = filtered.map((f, i, items) => { return {
        id: f.id,
        km: f.km - (props.fullKm ? 0 : filtered[0].km),
        kmTo: f.kmTo - (props.fullKm ? 0 : filtered[filtered.length - 1].kmTo),
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

  return (
    <div data-nosnippet>
      <table className="itinerary-table">
      <thead>
        <tr>
          <th className="itinerary-value">Km od</th>
          <th className="itinerary-value">Km do</th>
          <th>Razcestie</th>
          {!props.noDetails && (
          <>
          <th className="itinerary-value">Vzdialenosť (km)</th>
          <th className="itinerary-value">Asfalt (km)</th>
          <th className="itinerary-value">Stúpanie (m)</th>
          <th className="itinerary-value">Klesanie (m)</th>
          <th className="itinerary-value">Čas (h)</th>
          </>)}
          <th>Poznámky</th>
        </tr>
      </thead>
      <tbody>
        {!!itinerary && itinerary.map((item, i, items) => {
          const guidepostName = item.name + (item.ele ? (` ${formatNumber(item.ele)}\u00A0m`): "");
          return (
          <Fragment key={i}>
            <tr className="itinerary-row-guidepost">
              <td className="itinerary-value">{formatNumber(item.km, 1)}</td>
              <td className="itinerary-value">{formatNumber(item.kmTo, 1)}</td>
              <td colSpan={props.noDetails ? 1 : 6}>
                <A id={`g${item.id}`} href={`/pred/pois#poi=${item.id}&lat=${item.lat}&lon=${item.lon}&zoom=13`}>
                  <b>{guidepostName}</b>
                </A>
              </td>
              <td>{item.info}{insertNear == item.id ? 
                insertInfo : (props.select ? <div><a href="#" onClick={e => { e.preventDefault(); setInsertNear(item.id); setInsertAfter(null); }}>vložiť tu</a></div> : "")}</td>
            </tr>
            {i < items.length - 1 ? (
              <tr>
                <td colSpan={3}>{"\u00A0"}</td>
                {!props.noDetails && (
                <>
                <td className="itinerary-value">{formatNumber(item.dist, 1)}</td>
                <td className="itinerary-value">{formatNumber(item.asphalt, 1)}</td>
                <td className="itinerary-value">{formatNumber(item.altUp)}</td>
                <td className="itinerary-value">{formatNumber(item.altDown)}</td>
                <td className="itinerary-value">{formatHours(item.time)}</td>
                </>)}
                <td>{item.infoAfter}{insertAfter == item.id ? 
                  insertInfo : (props.select ? <div><a href="#" onClick={e => { e.preventDefault(); setInsertAfter(item.id); setInsertNear(null); }}>vložiť tu</a></div> : "")}</td>
              </tr>
            ) : null}
          </Fragment>);
        })}
      </tbody>
      {!props.noTotals && (
      <tfoot>
        <tr>
          <td colSpan={3}></td>
          {!props.noDetails && (
          <>
          <td className="itinerary-value"><b>{formatNumber(itinerary ? itinerary.reduce((r, t) => r + t.dist, 0) : 0, 1)}</b></td>
          <td className="itinerary-value"><b>{formatNumber(itinerary ? itinerary.reduce((r, t) => r + t.asphalt, 0) : 0, 1)}</b></td>
          <td className="itinerary-value"><b>{formatNumber(itinerary ? itinerary.reduce((r, t) => r + t.altUp, 0) : 0)}</b></td>
          <td className="itinerary-value"><b>{formatNumber(itinerary ? itinerary.reduce((r, t) => r + t.altDown, 0) : 0)}</b></td>
          <td className="itinerary-value"><b>{formatHours(itinerary ? itinerary.reduce((r, t) => r + t.time, 0) : 0)}</b></td>
          </>)}
        </tr>
      </tfoot>)} 
      </table>
      <p className="itinerary-attribution">Dáta: © Prispievatelia <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></p>
    </div>
  )
}
export default ItineraryTable;