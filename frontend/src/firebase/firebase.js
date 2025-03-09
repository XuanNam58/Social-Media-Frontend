// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDoZrv8IZR8qyz2w1qlDYy4AJG3EeYmM9U",
  authDomain: "social-media-1c233.firebaseapp.com",
  projectId: "social-media-1c233",
  storageBucket: "social-media-1c233.firebasestorage.app",
  messagingSenderId: "589813021873",
  appId: "1:589813021873:web:77e99f1effa4b9ce2bf690",
  measurementId: "G-FR1RWCW32E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
