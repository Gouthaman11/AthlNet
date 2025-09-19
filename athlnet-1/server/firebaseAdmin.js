/**
 * Firebase Admin initialization template.
 * IMPORTANT: Do NOT commit service account JSON to the repo.
 * Place the JSON file path in an environment variable or use
 * GOOGLE_APPLICATION_CREDENTIALS to point to the file.
 */
const admin = require('firebase-admin');
const path = require('path');

function initAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();

  // Preferred: use GOOGLE_APPLICATION_CREDENTIALS env var to point at a service account JSON file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    return admin.app();
  }

  // Fallback: load JSON from a path specified in FIREBASE_SERVICE_ACCOUNT (DO NOT COMMIT)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    return admin.app();
  }

  throw new Error('No Firebase admin credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH');
}

module.exports = { initAdmin, admin };
