const PoiCategories = [
  { value: "pramen", label: "prameň", icon: "fas fa-tint" },
  { value: "pristresok", label: "prístrešok", icon: "fas fa-umbrella" },
  { value: "chata", label: "chata", icon: "fas fa-bed" },
  { value: "utulna", label: "útulňa", icon: "fas fa-home"},
  { value: "krcma_jedlo", label: "krčma", icon: "fas fa-utensils"},
  { value: "potraviny", label: "potraviny", icon: "fas fa-shopping-basket"},
  { value: "ostatne", label: "ostatné", icon: "fas fa-map-marker-alt"},
];

const findPoiCategory = (category) => {
  const i = PoiCategories.findIndex(p => p.value == category);

  return i >= 0 ? PoiCategories[i] : PoiCategories[PoiCategories.length - 1];
}

export { PoiCategories, findPoiCategory };