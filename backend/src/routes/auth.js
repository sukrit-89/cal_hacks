import express from 'express';
import { auth } from '../config/firebase.js';
import { createUser, getUser } from '../services/firestore.js';

const router = express.Router();

// Register new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body;

        // Create user in Firebase Auth (handled by frontend)
        // This endpoint just stores additional user data in Firestore

        if (!req.body.uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        const userData = {
            email,
            displayName,
            role: role || 'participant',
            profile: {}
        };

        await createUser(req.body.uid, userData);

        // Set custom claim for role
        await auth.setCustomUserClaims(req.body.uid, { role: userData.role });

        res.status(201).json({
            message: 'User created successfully',
            user: { uid: req.body.uid, ...userData }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        const user = await getUser(decodedToken.uid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

export default router;
