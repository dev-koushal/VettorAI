
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:"vettor-ai.firebaseapp.com",
  projectId: "vettor-ai-4862c",
  storageBucket: "vettor-ai-4862c.firebasestorage.app",
  messagingSenderId: "474724726598",
  appId: "1:474724726598:web:58eba7ba6c8fc7a8aa9747"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const  auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };


