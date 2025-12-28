import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin using environment variables
if (!admin.apps.length) {
    // Check if we're using environment variables or service account file
    const useEnvVars = process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY;

    if (useEnvVars) {
        // Production: Use environment variables
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    } else {
        // Development: Try to use ServiceAccount.json if it exists
        try {
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            const serviceAccount = require('./ServiceAccount.json');

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`
            });
        } catch (error) {
            console.error('❌ Firebase initialization failed. Please set environment variables or provide ServiceAccount.json');
            throw new Error('Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
        }
    }
}

export const auth = admin.auth();
export const db = admin.firestore();
export const bucket = admin.storage().bucket();

export default admin;
