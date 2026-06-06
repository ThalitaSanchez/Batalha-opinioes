import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzoVSvgiV8fkisNiudjZZNuq75egN031s",
  authDomain: "batalha-de-opinioes.firebaseapp.com",
  projectId: "batalha-de-opinioes",
  storageBucket: "batalha-de-opinioes.firebasestorage.app",
  messagingSenderId: "687084094461",
  appId: "1:687084094461:web:620a3ccd006d02c7cd8f94"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);