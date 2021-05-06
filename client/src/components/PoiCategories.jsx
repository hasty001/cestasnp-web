import * as Constants from './Constants';
import { faBed, faHome, faUtensils, faShoppingBasket, faPlus, faAsterisk, faAlignLeft, faTint } from '@fortawesome/free-solid-svg-icons';
import { faPosed, faPristresek } from '../helpers/faIcons';

const PoiCategories = [
  { value: Constants.PoiCategoryGuidepost, label: "rázcestník", icon: "fas fa-plus poi-icon", iconDefinition: faPlus,  hidden: true },
  { value: Constants.PoiCategoryArticle, label: "článok", icon: "fas fa-align-left poi-icon", iconDefinition: faAlignLeft, hidden: true },
  { value: Constants.PoiCategoryOther, label: "ostatné", icon: "fas fa-asterisk poi-icon", iconDefinition: faAsterisk },
  { value: "pramen", label: "voda", icon: "fas fa-tint poi-icon", iconDefinition: faTint, description: "napr. prameň, studnička alebo verejný kohútik" },
  { value: "posed", label: "posed", icon: "fac fa-posed poi-icon", iconDefinition: faPosed, description: "odomknutý posed, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: "pristresok", label: "prístrešok", icon: "fac fa-pristresek poi-icon", iconDefinition: faPristresek, description: "miesto, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: "krcma_jedlo", label: "jedlo", icon: "fas fa-utensils poi-icon", iconDefinition: faUtensils, description: "podnik, kde poskytujú teplé jedlo, napr. reštaurácia, bufet" },
  { value: "potraviny", label: "potraviny", icon: "fas fa-shopping-basket poi-icon", iconDefinition: faShoppingBasket, description: "predajňa potravín" },
  { value: "utulna", label: "útulňa", icon: "fas fa-home poi-icon", iconDefinition: faHome, description: "skromnejší ubytovanie, za dobrovoľný poplatok" },
  { value: "chata", label: "ubytovanie", icon: "fas fa-bed poi-icon", iconDefinition: faBed, description: "napr. hotel, horská chata, penzión, turistická ubytovňa" },
];

const findPoiCategory = (category) => {
  const i = PoiCategories.findIndex(p => p.value == category);

  return i >= 0 ? PoiCategories[i] : PoiCategories[PoiCategories.length - 1];
}

export { PoiCategories, findPoiCategory };