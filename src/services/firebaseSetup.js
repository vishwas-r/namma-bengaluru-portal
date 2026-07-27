import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxHQLZB5yD35qhGkDwCoqz2TVZhnsyG_k",
  authDomain: "namma-bengaluru-c5b2b.firebaseapp.com",
  projectId: "namma-bengaluru-c5b2b",
  storageBucket: "namma-bengaluru-c5b2b.firebasestorage.app",
  messagingSenderId: "1043036262666",
  appId: "1:1043036262666:web:71132dd1d8f8bb0a5b6af3",
  measurementId: "G-TXFH5NS68T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
