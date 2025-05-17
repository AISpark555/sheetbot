import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface FirebaseAdmin {
  db: ReturnType<typeof getFirestore>;
  auth: ReturnType<typeof getAuth>;
}

declare global {
  var firebaseAdmin: FirebaseAdmin | undefined;
}

const initializeFirebaseAdmin = (): FirebaseAdmin => {
  // Check if already initialized
  if (global.firebaseAdmin) {
    return global.firebaseAdmin;
  }

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDrkr_pflEckccEeVTceXne4Wag3aV8xn8",
    authDomain: "aibot-d4599.firebaseapp.com",
    projectId: "aibot-d4599",
    storageBucket: "aibot-d4599.firebasestorage.app",
    messagingSenderId: "177897658381",
    appId: "1:177897658381:web:ab6740a8ceca6631f89d44"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app);
  const auth = getAuth(app);

  // Store the initialized Firebase Admin in global to prevent re-initialization
  global.firebaseAdmin = { db, auth };
  return { db, auth };
};

export const { db, auth } = initializeFirebaseAdmin();