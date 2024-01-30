import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC26NMHFPO2anP3UG5djT3H75i3NO3Dq-A",
  authDomain: "notes-app-f5540.firebaseapp.com",
  projectId: "notes-app-f5540",
  storageBucket: "notes-app-f5540.appspot.com",
  messagingSenderId: "1074132283588",
  appId: "1:1074132283588:web:f8179725f2092497839991"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notesCollection = collection(db, 'notes')