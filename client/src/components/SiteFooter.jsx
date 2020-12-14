import React, { useContext } from 'react';
import logoFooter from '../../public/img/logo-footer.svg';
import { LocalSettingsContext } from './LocalSettingsContext';
import { A } from './reusable/Navigate';

const SiteFooter = (props) => {

  const settingsData = useContext(LocalSettingsContext);
  
  return (
    <div className="site-footer no-print">
      <div className="row1">
        <div className="col1">
          <A href="/ucet/pridatpoi" className="red-button x2" >Registruj sa</A>
        </div>
        <div className="col2">
          <A href="/pred/articles/article/10003" className="red-button x2" >Daruj 2%</A>
        </div>
        <div className="col3">
          <A href="/pred/articles/article/379" className="red-button x2" >Podpor nás</A>
        </div>
      </div>
      <div>
        <div className="col1">
          <h2>Prečo sa registrovať</h2>
          <div className="list">
            <p>Ako registrovaný úživateľ môžeš</p>
            <p><span className="icon"><i className="fas fa-map-marker icon-stack"></i>
              <i className="fas fa-tint fa-inverse icon-stack icon-small" data-fa-transform="up-3" ></i></span>
              <span>prispievať do databázy<br/><A href="/pred/pois">DÔLEŽITÝCH MIEST</A></span></p>
            <p><span className="icon"><i className="fas fa-comment icon"/></span><span>komentovať LIVE Sledovanie<br/>bez ďalšieho overenia</span></p>
            <p><span className="icon"><i className="fas fa-map-marker-alt icon"/></span><span>vyvoriť si LIVE Sledovanie<br/>a posielať správy</span></p>
          </div>
        </div>
        <div className="col2">
          <A href="/"><img src={logoFooter} className="logo-footer"/></A>
          <A className="footer-link" href="/kontakt">O nás</A>
          <A className="footer-link" href="/pred/articles/1">Články</A>
          <A className="footer-link" href="/pred/pois">Dôležité miesta</A>
          <A className="footer-link" href="/pred/itinerar">Itinerár</A>
          <A className="footer-link" href={settingsData.activeLink.href}>LIVE sledovanie</A>
          <A className="footer-link" href="/na/archive">Archív</A>
          <A className="footer-link" href="/pred/articles/article/379">Zoznam darcov</A>

          <h3>
            <a className="facebook" title="Facebook CestaSNP.sk" href="https://www.facebook.com/cestasnp.sk" target="_blank"><i className="fab fa-facebook-f"/></a>
            <a className="instagram" title="Instagram CestaSNP.sk" href="https://www.instagram.com/cestasnp.sk/" target="_blank"><i className="fab fa-instagram"/></a>
          </h3>
        </div>
        <div className="col3">
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
    </div>
  )
}

export default SiteFooter;