import React from 'react';

export const GenericError = "Ups, niekde sa stala chyba. Skús neskôr prosím.";
export const NoTravellersError = "Momentálne nie je nikto na ceste.";
export const GpsLowAccuracyError = (lat, lon) => 
  <span>
    Tvoja poloha sa nám zdá byť nepresná.
    Ak máš povelené lokalizačné služby
    (návod <a href="https://cestasnp.sk/pred/articles/article/10004" target="_blank" >tu</a>)
    a máš výhľad na oblohu, je možné že telofón má zapametanú staršiu polohu.
    Skús otvoriť mapovú aplikáciu <a href={`https://mapy.cz/turisticka?x=${lon}&y=${lat}&source=coor&id=${lon}%2C${lat}`} target="_blank">mapy.cz</a>{' '}
    a skontrolovať polohu tam.
    <br/>
    Prípadne súradnice zadaj ručne.               
  </span>;
export const GpsError = 
  <span>
    Vyzerá to, že nemáš povelené získavanie GPS pozície. Povoľ podľa
    návodu{' '}
    <a href="https://cestasnp.sk/pred/articles/article/10004" target="_blank" >
      tu
    </a>{' '}
    alebo zadaj ručne.
  </span>;