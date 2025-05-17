import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGgyl6hgeX8NXORS74Xhrgw2Gvc3u1A74",
  authDomain: "socialapp-001-81c00.firebaseapp.com",
  projectId: "socialapp-001-81c00",
  storageBucket: "socialapp-001-81c00.firebasestorage.app",
  messagingSenderId: "220640855082",
  appId: "1:220640855082:web:5258496875dd2cfe21ef53"
};

// Initialize Firebase
const appMessage = initializeApp(firebaseConfig,"MessageFirebase");

// Firestore instance
export const db = getFirestore(appMessage);