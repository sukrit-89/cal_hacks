import express from 'express';
import { auth } from '../config/firebase.js';
import { createUser, getUser } from '../services/firestore.js';

const router = express.Router();

// Register new user
router.post('/signup', async (req, res) => {
    try {
        console.log('📝 Signup request received:', { email: req.body.email, uid: req.body.uid, role: req.body.role });

        const { email, displayName, role, uid } = req.body;

        // Create user in Firebase Auth (handled by frontend)
        // This endpoint just stores additional user data in Firestore

        if (!uid) {
            console.log('❌ Signup failed: UID is required');
            return res.status(400).json({ error: 'UID is required' });
        }

        // Check if user already exists in Firestore
        const existingUser = await getUser(uid);
        if (existingUser) {
            console.log('✅ User already exists in Firestore, returning existing user');
            return res.status(200).json({
                message: 'User already exists',
                user: existingUser
            });
        }

        const userData = {
            email,
            displayName,
            role: role || 'participant',
            profile: {}
        };

        console.log('📝 Creating user in Firestore...');
        await createUser(uid, userData);

        // Set custom claim for role
        console.log('📝 Setting custom claims...');
        await auth.setCustomUserClaims(uid, { role: userData.role });

        console.log('✅ User created successfully:', uid);
        res.status(201).json({
            message: 'User created successfully',
            user: { uid, ...userData }
        });
    } catch (error) {
        console.error('❌ Signup error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ /me request: No auth header');
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        console.log('🔐 Verifying token...');
        const decodedToken = await auth.verifyIdToken(token);
        console.log('✅ Token verified for UID:', decodedToken.uid);

        const user = await getUser(decodedToken.uid);

        if (!user) {
            console.log('❌ User not found in Firestore:', decodedToken.uid);
            return res.status(404).json({ error: 'User not found in database' });
        }

        console.log('✅ User found:', user.email);
        res.json({ user });
    } catch (error) {
        console.error('❌ Get user error:', error.message);
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
});

export default router;
