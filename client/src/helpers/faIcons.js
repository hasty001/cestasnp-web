import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faLink, faCompass, faInfoCircle, faTrashAlt, faEdit, faTimes, faExternalLinkAlt,
  faMapMarkerAlt, faMapMarker, faMapMarkedAlt, faPencilAlt, faTable, faComment, faTint,
  faBed, faHome, faUtensils, faShoppingBasket, faPlus, faAsterisk, faAlignJustify, faMap, 
  faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar, faImages } from '@fortawesome/free-regular-svg-icons';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

var faPristresek = {
  prefix: 'fac',
  iconName: 'pristresek',
  icon: [240, 227, [], 'e001', 'M206.1,188.6H33.9c-6.9,0-12.4,5.6-12.4,12.4v11.7c0,6.9,5.6,12.4,12.4,12.4h172.2c6.9,0,12.4-5.6,12.4-12.4v-11.7C218.6,194.2,213,188.6,206.1,188.6zM238.9,86.9c-0.7-3.3-2.6-6-5.4-7.9l-105-68.5c-4.2-2.7-9.5-2.7-13.7,0L6.4,82.2c-2.8,1.8-4.7,4.6-5.3,7.9c-0.7,3.3,0,6.6,1.8,9.3l6.4,9.7l0,0c2.4,3.6,6.4,5.6,10.4,5.6c2.4,0,4.7-0.7,6.8-2.1l95.2-62.9l91.8,59.8c5.7,3.7,13.5,2.1,17.2-3.6l6.4-9.8C239,93.4,239.6,90.1,238.9,86.9z']
};

var faPosed = {
  prefix: 'fac',
  iconName: 'posed',
  icon: [240, 227, [], 'e002', 'M209.2,210.4l-28.9-87.5V37.7l2.8-0.4c3.2-0.5,6.1-2.2,8-4.9c1.9-2.6,2.7-5.9,2.2-9.1l-1.9-11.7c-0.5-3.2-2.2-6.1-4.9-8c-2.6-1.9-5.9-2.7-9.1-2.2L70,18.4c-6,0.9-10.3,6-10.3,12.1v92.4l-28.9,87.5c-1.2,3.7-0.6,7.8,1.7,11s6,5.1,9.9,5.1h12.5c5.3,0,9.9-3.4,11.6-8.4L90.9,144h58.1l24.5,74.1c1.7,5,6.3,8.4,11.6,8.4h12.5c3.9,0,7.6-1.9,9.9-5.1C209.8,218.2,210.5,214.1,209.2,210.4z M144,43.4v64.2H96V51.1L144,43.4z']
};
  

/**
 * Registers individual FontAwesome icons for use all around the web (in <i> tags).
 */
const faIconsRegister = () => {
  library.add(faLink, faCompass, faInfoCircle, faTrashAlt, faEdit, faTimes, faExternalLinkAlt,
    faMapMarkerAlt, faMapMarker, faMapMarkedAlt, faPencilAlt, faTable, faComment, faTint,
    faBed, faHome, faUtensils, faShoppingBasket, faPlus, faAsterisk, faAlignJustify, faMap,
    fasStar);

  library.add(faStar, faImages);

  library.add(faFacebookF, faInstagram);
  
  library.add(faPristresek, faPosed);

  dom.watch();
}


export { faIconsRegister };