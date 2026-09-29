/**
 * Server-side Firebase Admin SDK. Bypasses database rules, so the Realtime
 * Database can stay fully locked to the public. Credentials (one of):
 *   FIREBASE_SERVICE_ACCOUNT            → the whole service-account JSON, as one line
 *   FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *   GOOGLE_APPLICATION_CREDENTIALS      → path to the JSON file (Application Default Credentials)
 */
import "server-only";
import { cert, applicationDefault, getApps, initializeApp, type App, type Credential } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import { firebaseConfig } from "./firebase-config";

function credential(): Credential | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    const sa = JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
    return cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key });
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    return cert({ projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId, clientEmail, privateKey });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  return null;
}

export function firebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
      (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

let app: App | undefined;

export function adminDb(): Database {
  if (!app) {
    app = getApps().find((a) => a.name === "plusmark-admin");
    if (!app) {
      const cred = credential();
      if (!cred) throw new Error("Firebase Admin credentials are not configured (see .env.example).");
      app = initializeApp(
        { credential: cred, databaseURL: process.env.FIREBASE_DATABASE_URL || firebaseConfig.databaseURL },
        "plusmark-admin",
      );
    }
  }
  return getDatabase(app);
}
