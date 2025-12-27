import express from 'express';
import authenticate from '../middleware/auth.js';
import { getUser, updateUser } from '../services/firestore.js';

const router = express.Router();

// Get user by ID (authenticated)
router.get('/:userId', authenticate, async (req, res) => {
    try {
        const user = await getUser(req.params.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...userData } = user;

        res.json({ user: userData });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get current user (authenticated)
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await getUser(req.user.uid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...userData } = user;

        res.json({ user: userData });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile (authenticated)
router.put('/me', authenticate, async (req, res) => {
    try {
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.uid;
        delete updates.role;
        delete updates.createdAt;

        await updateUser(req.user.uid, updates);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
