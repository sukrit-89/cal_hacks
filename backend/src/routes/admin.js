import express from 'express';
import { auth } from '../config/firebase.js';
import { getUser } from '../services/firestore.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Sync Firestore role to Firebase custom claims
router.post('/sync-role', authenticate, async (req, res) => {
    try {
        const uid = req.user.uid;

        // Get user from Firestore
        const user = await getUser(uid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Set custom claims to match Firestore role
        await auth.setCustomUserClaims(uid, { role: user.role });

        res.json({
            message: 'Role synced successfully. Please log out and log back in.',
            role: user.role
        });
    } catch (error) {
        console.error('Sync role error:', error);
        res.status(500).json({ error: 'Failed to sync role' });
    }
});

export default router;
