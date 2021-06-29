import React from 'react';
import DocumentTitle from 'react-document-title';
import { A } from './reusable/Navigate';
import * as Constants from './Constants';

const Kontakt = () => {
  return (
    <div id="Kontakt">
      <DocumentTitle title={`Kontakt${Constants.WebTitleSuffix}`} />
      <p>
        <b>CestaSNP.sk pre vás pripravuje a prevádzkuje:</b>
      </p>
      <br />
      <p>
        <b>Občianske združenie CestaSNP.sk</b>
      </p>
      <p>IČO: 51192039</p>
      <p>Gaštanová 6464/4</p>
      <p>974 01 Banská Bystrica</p>
      <br />
      <p>
        Email:{' '}
        <a target="_blank" href="mailto:info@cestasnp.sk">
          info@cestasnp.sk
        </a>
      </p>
      <br />
      <p>
        Všetok vývoj a prevádzku portálu robíme vo svojom voľnom čase. Nakoľko
        na samotnú každomesačnú prevádzku portálu potrebujeme aj finančné
        prostriedky, budeme veľmi radi ak našu prácu podporíte aj finančne.
        Pravidelne aktualizovaný zoznam darcov nájdete na tomto{' '}
        <A href={'/pred/articles/article/379'} >
          odkaze
        </A>
        .
      </p>
      <br />
      <p>Môžete tak urobiť ľubovoľnou čiastkou na účet OZ CestaSNP.sk:</p>
      <br />
      <p>Zasielanie zo Slovenska v EUR: SK3483300000002501407836</p>
      <p>Zasielanie z Česka v CZK: CZ2320100000002501407836</p>
      <br />
      <p>
        Do správy pre príjemcu uveďte prosím svoje meno, ktoré zverejníme v{' '}
        <A href={'/pred/articles/article/379'} >
          {' '}
          zozname darcov
        </A>
        , kde bude uvedené aj na čo boli prostriedky použité.
      </p>
      <br />
      <p>Ďakujeme, že podporujete našu prácu, čo nás posúva vpred.</p>
    </div>
  );
};

export default Kontakt;
