import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface FirebaseAdmin {
  db: ReturnType<typeof getFirestore>;
  auth: ReturnType<typeof getAuth>;
}

declare global { // This is correctly declared, the issue might be how Next.js handles global types.
  var firebaseAdmin: FirebaseAdmin | undefined;
}

const initializeFirebaseAdmin = (): FirebaseAdmin => {
  // Check if already initialized
  if (global.firebaseAdmin) {
    return global.firebaseAdmin;
  }

  // Your web app's Firebase configuration
  // Using environment variables for security is recommended.
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
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