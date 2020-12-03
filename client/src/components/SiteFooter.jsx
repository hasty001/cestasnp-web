import React, { useContext } from 'react';
import logoFooter from '../../public/img/logo-footer.svg';
import { LocalSettingsContext } from './LocalSettingsContext';
import { A } from './reusable/Navigate';

const SiteFooter = (props) => {

  const settingsData = useContext(LocalSettingsContext);
  
  return (
    <div className="site-footer no-print">
      <div className="col1">
        <A href="/ucet/pridatpoi" className="red-button x2" >Registruj sa</A>
      </div>
      <div className="col2">
        <A href="/pred/articles/article/10003" className="red-button x2" >Daruj 2%</A>

        <A href="/"><img src={logoFooter} className="logo-footer"/></A>
        <A className="footer-link" href="/kontakt">O nás</A>
        <A className="footer-link" href="/pred/articles/1">Články</A>
        <A className="footer-link" href="/pred/pois">Dôležité miesta</A>
        <A className="footer-link" href="/pred/itinerar">Itinerár</A>
        <A className="footer-link" href={settingsData.activeLink.href}>LIVE sledovanie</A>
        <A className="footer-link" href="/na/archive">Archív</A>
        <A className="footer-link" href="/pred/articles/article/379">Zoznam darcov</A>
      </div>
      <div className="col3">
        <A href="/pred/articles/article/10003" className="red-button x2" >Podpor nás</A>
        <h2>Kontakt</h2>
        <p>
          Občianske združenie<br/>
          CestaSNP.sk<br/>
          <br/>
          Gaštanová 4<br/>
          974 01 Banská Bystrica<br/>
          <br/>
          info@cestasnp.sk
        </p>
        <p>
          <br/>
          Ďakujeme,<br/>
          že podporujete našu prácu,<br/>
          čo nás posúva vpred.
        </p>
      </div>
    </div>
  )
}

export default SiteFooter;