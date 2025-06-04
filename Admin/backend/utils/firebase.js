// backend/utils/firebase.js

/**
 * Firebase Admin SDK Initialization
 *
 * This file sets up the Firebase Admin SDK using the service account JSON file.
 * It initializes the Firebase app only if it hasn't been initialized yet.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebaseServiceAccount.json');

// Initialize Firebase Admin SDK only if no apps have been initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
