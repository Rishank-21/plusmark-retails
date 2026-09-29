/**
 * Firebase web app configuration. These values are public by design (they ship
 * to every browser) — access control lives in the Realtime Database rules
 * (database.rules.json), not here. Env vars override the defaults.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB0cKQl4LSD2fP9uhWv4CajFCbbMQapkJ4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "plusmark-retailers.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://plusmark-retailers-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "plusmark-retailers",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "plusmark-retailers.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "864370688864",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:864370688864:web:4cb1b698cf2f42238d5405",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-M31RZRF9BW",
};
