import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faLink, faCompass, faInfoCircle, faTrashAlt, faEdit, faTimes, faExternalLinkAlt,
  faMapMarkerAlt, faMapMarker, faMapMarkedAlt, faPencilAlt, faTable, faComment, faTint,
  faBed, faHome, faUtensils, faShoppingBasket, faPlus, faAsterisk, faAlignJustify, faMap, 
  faStar as fasStar, faEyeSlash, faClipboardCheck, faAlignLeft, faAlignCenter, faAlignRight,
  faListOl, faCompress, faLayerGroup, faSearch, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { faStar, faImages, faCopy, faWindowRestore, faEnvelope, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faFacebookF, faInstagram, faPatreon } from '@fortawesome/free-brands-svg-icons';

const faPristresek = {
  prefix: 'fac',
  iconName: 'pristresek',
  icon: [240, 227, [], 'e001', 'M206.1,188.6H33.9c-6.9,0-12.4,5.6-12.4,12.4v11.7c0,6.9,5.6,12.4,12.4,12.4h172.2c6.9,0,12.4-5.6,12.4-12.4v-11.7C218.6,194.2,213,188.6,206.1,188.6zM238.9,86.9c-0.7-3.3-2.6-6-5.4-7.9l-105-68.5c-4.2-2.7-9.5-2.7-13.7,0L6.4,82.2c-2.8,1.8-4.7,4.6-5.3,7.9c-0.7,3.3,0,6.6,1.8,9.3l6.4,9.7l0,0c2.4,3.6,6.4,5.6,10.4,5.6c2.4,0,4.7-0.7,6.8-2.1l95.2-62.9l91.8,59.8c5.7,3.7,13.5,2.1,17.2-3.6l6.4-9.8C239,93.4,239.6,90.1,238.9,86.9z']
};

const faPosed = {
  prefix: 'fac',
  iconName: 'posed',
  icon: [240, 227, [], 'e002', 'M209.2,210.4l-28.9-87.5V37.7l2.8-0.4c3.2-0.5,6.1-2.2,8-4.9c1.9-2.6,2.7-5.9,2.2-9.1l-1.9-11.7c-0.5-3.2-2.2-6.1-4.9-8c-2.6-1.9-5.9-2.7-9.1-2.2L70,18.4c-6,0.9-10.3,6-10.3,12.1v92.4l-28.9,87.5c-1.2,3.7-0.6,7.8,1.7,11s6,5.1,9.9,5.1h12.5c5.3,0,9.9-3.4,11.6-8.4L90.9,144h58.1l24.5,74.1c1.7,5,6.3,8.4,11.6,8.4h12.5c3.9,0,7.6-1.9,9.9-5.1C209.8,218.2,210.5,214.1,209.2,210.4z M144,43.4v64.2H96V51.1L144,43.4z']
};

const faAnjel = {
  prefix: 'fac',
  iconName: 'anjel',
  icon: [472.06, 441.6, [], 'e002', 'M 304.46,124.49 A 68.43,68.43 0 0 1 236.03,192.92 68.43,68.43 0 0 1 167.6,124.49 68.43,68.43 0 0 1 236.03,56.059998 68.43,68.43 0 0 1 304.46,124.49 ZM141.01,90.21c-1.52,0-3.06-0.28-4.55-0.86c-29.19-11.43-35.32-25.99-35.32-36.2c0-35.35,69.92-51.46,134.89-51.46   c64.97,0,134.89,16.1,134.89,51.46c0,10.18-6.1,24.72-35.17,36.14c-6.42,2.52-13.68-0.64-16.21-7.06   c-2.52-6.43,0.64-13.68,7.06-16.21c15.96-6.27,19.31-12,19.31-12.87c0-1.15-4.72-8.5-27.14-15.64   c-21.92-6.98-51.31-10.82-82.75-10.82c-31.44,0-60.83,3.84-82.75,10.82c-22.42,7.14-27.14,14.48-27.14,15.64   c0,0.87,3.38,6.63,19.43,12.92c6.43,2.52,9.6,9.77,7.08,16.2C150.72,87.2,146,90.21,141.01,90.21zM86.93,441.6h0.03h17.68h262.79h17.68h0.03l-0.01-0.02l54.39-54.39c10.86-10.86,16.84-25.3,16.84-40.66  s-5.98-29.8-16.84-40.66c-12.67-12.67-12.67-33.29,0-45.97l12.52-12.52c26.7-26.7,26.7-70.15,0-96.85  c-12.95-12.95-30.12-20.06-48.41-20.06c-0.17,0-0.34,0-0.51,0c-18.48,0.13-35.74,7.5-48.62,20.75l-78.06,80.33  c-12.06-6.91-25.92-10.77-40.41-10.77h0c-14.49,0-28.35,3.86-40.41,10.77l-78.06-80.33c-12.88-13.25-30.14-20.62-48.62-20.75  c-18.45-0.13-35.85,6.99-48.91,20.06c-26.7,26.7-26.7,70.15,0,96.85l12.52,12.52c6.14,6.14,9.52,14.3,9.52,22.98  s-3.38,16.84-9.52,22.98c-10.86,10.86-16.84,25.3-16.84,40.66s5.98,29.8,16.84,40.66l54.39,54.39L86.93,441.6z M372.43,168.66  c8.18-8.41,19.14-13.09,30.87-13.18c0.11,0,0.21,0,0.32,0c11.61,0,22.52,4.52,30.74,12.73c16.95,16.95,16.95,44.54,0,61.49  l-12.52,12.52c-22.42,22.42-22.42,58.9,0,81.32c6.14,6.14,9.52,14.3,9.52,22.98s-3.38,16.84-9.52,22.98l-47.4,47.4l-63.81-147.16  c-3.64-8.4-8.6-15.97-14.57-22.5L372.43,168.66z M50.23,369.52c-6.14-6.14-9.52-14.3-9.52-22.98s3.38-16.84,9.52-22.98  c10.86-10.86,16.84-25.3,16.84-40.66s-5.98-29.8-16.84-40.66L37.7,229.7c-16.95-16.95-16.95-44.54,0-61.49  c8.3-8.3,19.34-12.86,31.06-12.73c11.73,0.08,22.7,4.76,30.87,13.18l76.38,78.6c-5.97,6.53-10.93,14.09-14.57,22.5L97.63,416.92  L50.23,369.52z']
};  

/**
 * Registers individual FontAwesome icons for use all around the web (in <i> tags).
 */
const faIconsRegister = () => {
  library.add(faLink, faCompass, faInfoCircle, faTrashAlt, faEdit, faTimes, faExternalLinkAlt,
    faMapMarkerAlt, faMapMarker, faMapMarkedAlt, faPencilAlt, faTable, faComment, faTint,
    faBed, faHome, faUtensils, faShoppingBasket, faPlus, faAsterisk, faAlignJustify, faMap,
    fasStar, faEyeSlash, faClipboardCheck, faAlignLeft, faAlignCenter, faAlignRight,
    faListOl, faCompress, faLayerGroup, faSearch, faUserFriends);

  library.add(faStar, faImages, faCopy, faWindowRestore, faEnvelope, faQuestionCircle);

  library.add(faFacebookF, faInstagram, faPatreon);
  
  library.add(faPristresek, faPosed, faAnjel);

  dom.watch();
}


export { faIconsRegister, faPosed, faPristresek, faAnjel };