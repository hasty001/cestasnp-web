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
  { value: "pramen", label: "voda", icon: "fas fa-tint poi-icon", iconUrl: pramen, description: "napr. prameň, studnička alebo verejný kohútik" },
  { value: "pristresok", label: "prístrešok", icon: "fac fa-pristresek poi-icon", iconUrl: pristresok, description: "miesto, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: "chata", label: "ubytovanie", icon: "fas fa-bed poi-icon", iconUrl: chata, description: "napr. hotel, horská chata, penzión, turistická ubytovňa" },
  { value: "utulna", label: "útulňa", icon: "fas fa-home poi-icon", iconUrl: utulna, description: "skromnejší ubytovanie, za dobrovoľný poplatok" },
  { value: "krcma_jedlo", label: "jedlo", icon: "fas fa-utensils poi-icon", iconUrl: krcma_jedlo, description: "podnik, kde poskytujú teplé jedlo, napr. reštaurácia, bufet" },
  { value: "potraviny", label: "potraviny", icon: "fas fa-shopping-basket poi-icon", iconUrl: potraviny, description: "predajňa potravín" },
  { value: "posed", label: "posed", icon: "fac fa-posed poi-icon", iconUrl: posed, description: "odomknutý posed, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: Constants.PoiCategoryGuidepost, label: "rázcestník", icon: "fas fa-plus poi-icon", hidden: true, iconUrl: razcestnik },
  { value: Constants.PoiCategoryOther, label: "ostatné", icon: "fas fa-asterisk poi-icon", iconUrl: ostatne },
];

const findPoiCategory = (category) => {
  const i = PoiCategories.findIndex(p => p.value == category);

  return i >= 0 ? PoiCategories[i] : PoiCategories[PoiCategories.length - 1];
}

export { PoiCategories, findPoiCategory };