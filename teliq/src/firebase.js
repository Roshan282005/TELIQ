import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoIAiSnBx8GGNhjQkEB7j1bANx7k2l8dc",
  authDomain: "rizzauthapp.firebaseapp.com",
  databaseURL: "https://rizzauthapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rizzauthapp",
  storageBucket: "rizzauthapp.appspot.com",

  messagingSenderId: "607508317395",
  appId: "1:607508317395:web:f2f403d10915d6d2ef4026",
  measurementId: "G-2YQFBWK95F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
