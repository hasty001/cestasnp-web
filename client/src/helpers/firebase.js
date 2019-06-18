import * as firebase from 'firebase/app'
import 'firebase/auth'

firebase.initializeApp({
    apiKey: "AIzaSyBJpRnnmBqfGnYXU0N6AVtO3S5X3Ug4_CQ",
    authDomain: "cestasnp-sk.firebaseapp.com",
    databaseURL: "https://cestasnp-sk.firebaseio.com",
    projectId: "cestasnp-sk",
    storageBucket: "cestasnp-sk.appspot.com",
    messagingSenderId: "733336663349"
});

const auth = firebase.auth()

export { 
    auth,
}