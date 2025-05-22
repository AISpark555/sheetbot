// lib/firebase.ts - Server-side Firebase Admin SDK
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

  // Check if any apps are already initialized
  if (getApps().length === 0) {
    // Initialize Firebase Admin with service account
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  const db = getFirestore();
  const auth = getAuth();

  // Store the initialized Firebase Admin in global to prevent re-initialization
  global.firebaseAdmin = { db, auth };
  return { db, auth };
};

export const { db, auth } = initializeFirebaseAdmin();