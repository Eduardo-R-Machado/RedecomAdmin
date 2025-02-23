import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDPEfdmdtgFLrILwWNM2kf6DLqIXqmzJls",
  authDomain: "redecomdatabase.firebaseapp.com",
  databaseURL: "https://redecomdatabase-default-rtdb.firebaseio.com",
  projectId: "redecomdatabase",
  storageBucket: "redecomdatabase.appspot.com",
  messagingSenderId: "1055171188041",
  appId: "1:1055171188041:web:199aff7fdb4a95070fb698",
  measurementId: "G-ZW2VHRVY9F",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);