import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-vSM72SIpHzKmccLedSnESKlgkOCvidA",
  authDomain: "app12-37904.firebaseapp.com",
  projectId: "app12-37904",
  storageBucket: "app12-37904.firebasestorage.app",
  messagingSenderId: "32174843751",
  appId: "1:32174843751:web:44942d086ada19cca6b1c2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Error signing out: ", error.message);
    return { error: error.message };
  }
};

export { auth, db };
