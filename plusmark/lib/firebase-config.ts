/**
 * Firebase web app configuration. These values are public by design (they ship
 * to every browser) — access control lives in the Realtime Database rules
 * (database.rules.json), not here. Env vars override the defaults.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAEhhUsIzmKoiDGJUxAhpdFsLyrA1GJuQI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "plusmarkleads.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://plusmarkleads-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "plusmarkleads",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "plusmarkleads.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "323167780898",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:323167780898:web:f04ae546f173ec86108a7b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-V43T3TDDHJ",
};
