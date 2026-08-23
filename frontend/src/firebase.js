import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA517MLcp3STKTHalsIxOGWZaY_csrlRdQ",
  authDomain: "greenmediqueue.firebaseapp.com",
  projectId: "greenmediqueue",
  storageBucket: "greenmediqueue.firebasestorage.app",
  messagingSenderId: "3806059841",
  appId: "1:3806059841:web:cfb4d826ac22915a0515c0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;