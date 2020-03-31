import React from 'react';
import { NavItem } from 'react-bootstrap';
import history from '../helpers/history';

const Kontakt = () => {
  return (
    <div id="Kontakt">
      <p>
        <b>CestaSNP.sk pre vás pripravuje a prevádzkuje:</b>
      </p>
      <br />
      <p>
        <b>Občianske združenie CestaSNP.sk</b>
      </p>
      <p>Gaštanová 4</p>
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
        <NavItem
          onClick={() => {
            history.push('/pred/articles/article/379');
          }}
        >
          odkaze
        </NavItem>
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
        <NavItem
          onClick={() => {
            history.push('/pred/articles/article/379');
          }}
        >
          {' '}
          zozname darcov
        </NavItem>
        , kde bude uvedené aj na čo boli prostriedky použité.
      </p>
      <br />
      <p>Ďakujeme, že podporujete našu prácu, čo nás posúva vpred.</p>
    </div>
  );
};

export default Kontakt;
