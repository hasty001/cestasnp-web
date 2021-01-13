export const ShowCommentBoxScrollOffset = 200; // in pixels
export const MaxAllowedGPSAccuracy = 100; // in meters
export const DateTimeViewFormat = "D. M. YYYY H:mm";
export const DateViewFormat = "D. M. YYYY";

export const FromOldQuery = "?from-old";

export const PoiCategoryOther = "ostatne";
export const PoiCategoryGuidepost = "razcestnik";
export const PoiCategoryWater = "pramen";
export const PoiCategoryFood = "krcma_jedlo";
export const NearByMarkersDistance = 10; // in map pixels

export const PoiMarkerSize = 32; // in pixels
export const PoiIconSize = 15; // in pixels
export const PoiMarkerIconProps = {
  iconSize: [PoiMarkerSize, PoiMarkerSize],
  iconAnchor: [PoiMarkerSize / 2, PoiMarkerSize]
};
export const WebTitle = "CestaSNP";
export const WebTitleSuffix = " - CestaSNP";

export const ImageType = {
  LiveSledovanie: 0,
  DolezitaMiesta: 1,
  Clanky: 2
}
export const ArticleCategories = [
  { tag: 'vsetky', text: 'Všetky' },
  // { tag: 'faqs', text: 'FAQs' },
  // { tag: 'novinky', text: 'Novinky' },
  { tag: 'ostatne', text: 'Ostatné' },
  { tag: 'vybavenie', text: 'Vybavenie' },
  // { tag: 'odkazy', text: 'Odkazy' },
  // { tag: 'mapy', text: 'Mapy' },
  { tag: 'dolezite_miesta', text: 'Dôležité miesta' },
  { tag: 'stravovanie', text: 'Stravovanie' },
  { tag: 'cestopisy', text: 'Cestopisy' },
  // { tag: 'spravy_z_terenu', text: 'Správy z terénu' },
  { tag: 'zaujimavosti', text: 'Zaujímavosti' },
  // { tag: 'akcie', text: 'Akcie' },
  // { tag: 'obmedzenia', text: 'Obmedzenia' },
  // { tag: 'oznamy', text: 'Oznamy' },
  { tag: 'cesta-hrdinov-snp', text: 'Cesta hrdinov SNP' },
  // { tag: 'akcie-snp', text: 'Akcie Cesta hrdinov SNP' },
  // { tag: 'akcie-ostatne', text: 'Ostatné akcie' },
  // { tag: 'oblecenie', text: 'Oblečenie' },
  // { tag: 'obuv', text: 'Obuv' },
  { tag: 'o-cestesnpsk', text: 'O CesteSNP.sk' },
  // { tag: 'cela-trasa', text: 'Celá trasa' },
  // { tag: 'vku', text: 'VKU' },
  // { tag: 'shocart', text: 'Shocart' },
  // { tag: 'gps', text: 'GPS' },
  // { tag: 'batoh', text: 'Batoh' },
  {
    tag: 'dukla-cergov-sarisska-vrchovina',
    text: 'Dukla, Čergov, Šarišská vrchovina'
  },
  { tag: 'cierna-hora-volovske-vrchy', text: 'Čierna hora, Volovské vrchy' },
  { tag: 'nizke-tatry', text: 'Nízke Tatry' },
  { tag: 'velka-fatra-kremnicke-vrchy', text: 'Veľká Fatra, Kremnické vrchy' },
  {
    tag: 'strazovske-vrchy-biele-karpaty',
    text: 'Strážovske vrchy, Biele Karpaty'
  },
  { tag: 'male-karpaty', text: 'Malé Karpaty' },
  //{ tag: 'recepty', text: 'Recepty' },
  //{ tag: 'o-strave', text: 'O strave' },
  // { tag: 'nezaradene', text: 'Nezaradené' },
  // { tag: 'spravy-z-terenu', text: 'Správy z terénu' },
  //{ tag: 'live-sledovanie-clanky', text: 'Články o LIVE Sledovaní' },
  { tag: 'rozhovory', text: 'Rozhovory' }
];
