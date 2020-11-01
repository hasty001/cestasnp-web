import * as Constants from './Constants';
import chata from '../../public/img/chata.png';
import potraviny from '../../public/img/potraviny.png';
import pristresok from '../../public/img/pristresok.png';
import utulna from '../../public/img/utulna.png';
import pramen from '../../public/img/pramen.png';
import krcma_jedlo from '../../public/img/krcma_jedlo.png';
import posed from '../../public/img/posed.png';
import ostatne from '../../public/img/ostatne.png';
import razcestnik from '../../public/img/razcestnik.png';

const PoiCategories = [
  { value: "pramen", label: "prameň", icon: "fas fa-tint", iconUrl: pramen },
  { value: "pristresok", label: "prístrešok", icon: "fas fa-umbrella", iconUrl: pristresok },
  { value: "chata", label: "chata", icon: "fas fa-bed", iconUrl: chata },
  { value: "utulna", label: "útulňa", icon: "fas fa-home", iconUrl: utulna },
  { value: "krcma_jedlo", label: "krčma", icon: "fas fa-utensils", iconUrl: krcma_jedlo },
  { value: "potraviny", label: "potraviny", icon: "fas fa-shopping-basket", iconUrl: potraviny },
  { value: "posed", label: "posed", icon: "fas fa-map-marker-alt", iconUrl: posed },
  { value: Constants.PoiCategoryGuidepost, label: "rázcestník", icon: "fas fa-plus", hidden: true, iconUrl: razcestnik },
  { value: Constants.PoiCategoryOther, label: "ostatné", icon: "fas fa-map-marker-alt", iconUrl: ostatne },
];

const findPoiCategory = (category) => {
  const i = PoiCategories.findIndex(p => p.value == category);

  return i >= 0 ? PoiCategories[i] : PoiCategories[PoiCategories.length - 1];
}

export { PoiCategories, findPoiCategory };