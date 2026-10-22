/**
 * Server-side Firebase Admin SDK. Bypasses database rules, so the Realtime
 * Database can stay fully locked to the public. Credentials (one of):
 *   FIREBASE_SERVICE_ACCOUNT            → the whole service-account JSON, as one line
 *   FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *   GOOGLE_APPLICATION_CREDENTIALS      → path to the JSON file (Application Default Credentials)
 */
import "server-only";
import { readFileSync } from "node:fs";
import { cert, applicationDefault, getApps, initializeApp, type App, type Credential } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { firebaseConfig } from "./firebase-config";

/** The Admin SDK credential from the environment, shared by the database and storage apps. */
export function adminCredential(): Credential | null {
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

function credentialFromEnv(name: string): Credential | null {
  const json = process.env[name] ??
    (name === "FIREBASE_TARGET_SERVICE_ACCOUNT" && process.env.FIREBASE_TARGET_SERVICE_ACCOUNT_FILE
      ? readFileSync(process.env.FIREBASE_TARGET_SERVICE_ACCOUNT_FILE, "utf8")
      : undefined);
  if (!json) return null;
  const sa = JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error(`${name} must contain a valid Firebase service-account JSON object.`);
  }
  return cert({ projectId: sa.project_id, clientEmail: sa.client_email, privateKey: sa.private_key.replace(/\\n/g, "\n") });
}

export function websiteAdminCredential(): Credential | null {
  return (
    credentialFromEnv("FIREBASE_TARGET_SERVICE_ACCOUNT") ??
    (process.env.FIREBASE_TARGET_CLIENT_EMAIL && process.env.FIREBASE_TARGET_PRIVATE_KEY
      ? cert({
          projectId: process.env.FIREBASE_TARGET_PROJECT_ID || "plusmarkleads",
          clientEmail: process.env.FIREBASE_TARGET_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_TARGET_PRIVATE_KEY.replace(/\\n/g, "\n"),
        })
      : null)
  );
}

export function firebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
      (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

export function websiteFirebaseConfigured() {
  return Boolean(
    process.env.FIREBASE_TARGET_SERVICE_ACCOUNT ||
      process.env.FIREBASE_TARGET_SERVICE_ACCOUNT_FILE ||
      (process.env.FIREBASE_TARGET_CLIENT_EMAIL && process.env.FIREBASE_TARGET_PRIVATE_KEY),
  );
}

let app: App | undefined;

export function adminDb(): Database {
  if (!app) {
    app = getApps().find((a) => a.name === "plusmark-admin");
    if (!app) {
      const cred = adminCredential();
      if (!cred) throw new Error("Firebase Admin credentials are not configured (see .env.example).");
      app = initializeApp(
        { credential: cred, databaseURL: process.env.FIREBASE_DATABASE_URL || firebaseConfig.databaseURL },
        "plusmark-admin",
      );
    }
  }
  return getDatabase(app);
}

let websiteApp: App | undefined;

function websiteFirebaseApp(): App {
  if (websiteApp) return websiteApp;
  websiteApp = getApps().find((a) => a.name === "plusmark-website") ??
    (() => {
      const cred = websiteAdminCredential();
      if (!cred) throw new Error("Website Firebase credentials are not configured (see .env.example).");
      return initializeApp(
        {
          credential: cred,
          projectId: process.env.FIREBASE_TARGET_PROJECT_ID || "plusmarkleads",
          storageBucket: process.env.FIREBASE_TARGET_STORAGE_BUCKET || "plusmarkleads.firebasestorage.app",
        },
        "plusmark-website",
      );
    })();
  return websiteApp;
}

/** Firestore used only by the retail website; the Android app's RTDB remains separate. */
export function websiteFirestore(): Firestore {
  return getFirestore(websiteFirebaseApp());
}

export function websiteStorage(): Storage {
  return getStorage(websiteFirebaseApp());
}

/** Android lead-management RTDB in the same plusmarkleads Firebase project. */
export function leadsDb(): Database {
  return getDatabase(
    (() => {
      const app = websiteFirebaseApp();
      const options = app.options;
      if (!options.databaseURL) {
        app.options.databaseURL =
          process.env.FIREBASE_TARGET_DATABASE_URL || "https://plusmarkleads-default-rtdb.firebaseio.com";
      }
      return app;
    })(),
  );
}
