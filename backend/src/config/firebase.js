import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Import service account key
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountkey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
    });
}

export const auth = admin.auth();
export const db = admin.firestore();
export const bucket = admin.storage().bucket();

export default admin;
