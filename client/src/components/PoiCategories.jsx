import * as Constants from './Constants';

const PoiCategories = [
  { value: "pramen", label: "voda", icon: "fas fa-tint poi-icon", description: "napr. prameň, studnička alebo verejný kohútik" },
  { value: "pristresok", label: "prístrešok", icon: "fac fa-pristresek poi-icon", description: "miesto, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: "chata", label: "ubytovanie", icon: "fas fa-bed poi-icon", description: "napr. hotel, horská chata, penzión, turistická ubytovňa" },
  { value: "utulna", label: "útulňa", icon: "fas fa-home poi-icon", description: "skromnejší ubytovanie, za dobrovoľný poplatok" },
  { value: "krcma_jedlo", label: "jedlo", icon: "fas fa-utensils poi-icon", description: "podnik, kde poskytujú teplé jedlo, napr. reštaurácia, bufet" },
  { value: "potraviny", label: "potraviny", icon: "fas fa-shopping-basket poi-icon", description: "predajňa potravín" },
  { value: "posed", label: "posed", icon: "fac fa-posed poi-icon", description: "odomknutý posed, kde sa dá schovať pred nepriaznivým počasím, pripadne núdzovo prespať" },
  { value: Constants.PoiCategoryGuidepost, label: "rázcestník", icon: "fas fa-plus poi-icon", hidden: true },
  { value: Constants.PoiCategoryOther, label: "ostatné", icon: "fas fa-asterisk poi-icon" },
  { value: Constants.PoiCategoryArticle, label: "článok", icon: "fas fa-align-left poi-icon", hidden: true },
];

const findPoiCategory = (category) => {
  const i = PoiCategories.findIndex(p => p.value == category);

  return i >= 0 ? PoiCategories[i] : PoiCategories[PoiCategories.length - 1];
}

export { PoiCategories, findPoiCategory };