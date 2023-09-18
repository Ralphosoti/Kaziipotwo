import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCSUolTz52WkndWME_wlsKf0ZqJZUyx2BE",
  authDomain: "kazi-ipo.firebaseapp.com",
  projectId: "kazi-ipo",
  storageBucket: "kazi-ipo.appspot.com",
  messagingSenderId: "60376903095",
  appId: "1:60376903095:web:a46fc44740127e4d8f4c32",
  measurementId: "G-X0WDPJE88B"
};

firebase.initializeApp(firebaseConfig);

export default firebase;