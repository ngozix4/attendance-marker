// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5x_TcBFM16hq69EAd_LjpX0DWFMisHZw",
  authDomain: "attendance-marker-5a84e.firebaseapp.com",
  projectId: "attendance-marker-5a84e",
  storageBucket: "attendance-marker-5a84e.appspot.com",
  messagingSenderId: "139402022385",
  appId: "1:139402022385:web:b37ff5d79105b7d78f0850",
  measurementId: "G-N8425X2L6F",
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH };