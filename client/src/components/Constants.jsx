export const ShowCommentBoxScrollOffset = 200; // in pixels
export const MaxAllowedGPSAccuracy = 100; // in meters
export const DateTimeViewFormat = "D. M. YYYY H:mm";
export const DateViewFormat = "D. M. YYYY";

export const FromOldQuery = "?from-old";
export const ArticlesPageSize = 8;
export const MaxActivePhotos = 20;

export const NewCommentsNotificationAfter = "2021-05-20";
export const NewCommentsNotificationPeriod = 5 * 60 * 1000; //in ms = 5min

export const PoiCategoryOther = "ostatne";
export const PoiCategoryGuidepost = "razcestnik";
export const PoiCategoryArticle = "clanok";
export const PoiCategoryWater = "pramen";
export const PoiCategoryFood = "krcma_jedlo";
export const PoiCategoryUncertain = "neiste";
export const NearByMarkersDistance = 10; // in map pixels
export const MaxFullscreenPopupWidth = 600;
export const ItineraryCompactMaxWidth = 900;

export const PoiMarkerSize = 32; // in pixels
export const PoiIconSize = 15; // in pixels
export const PoiMarkerIconProps = {
  iconSize: [PoiMarkerSize, PoiMarkerSize],
  iconAnchor: [PoiMarkerSize / 2, PoiMarkerSize]
};
export const WebTitle = "CestaSNP";
export const WebTitleSuffix = " - CestaSNP";

export const CloudinaryPath = 'https://res.cloudinary.com/cestasnp-sk/image/upload/v1520586674/img/sledovanie/';
export const CloudinaryPathNoCodePrefix = 'https://res.cloudinary.com/cestasnp-sk/image/upload/v';
export const DefaultArticleImageFormat = 'c_limit,w_800,h_800,f_auto';
export const DefaultArticleImageKitFormat = 'tr=w-800,h-800,c-at_max';

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
  { tag: 'rozhovory', text: 'Rozhovory' },
  { tag: 'no-home', text: 'Nezobrazovať na home', hidden: true },
];
