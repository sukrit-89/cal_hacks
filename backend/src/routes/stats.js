import express from 'express';
import authenticate from '../middleware/auth.js';
import { getUserStats } from '../services/firestore.js';

const router = express.Router();

// Get user statistics
router.get('/user/:userId', authenticate, async (req, res) => {
    try {
        // Users can only get their own stats unless they're an admin
        if (req.params.userId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view these stats' });
        }

        const stats = await getUserStats(req.params.userId);
        res.json({ stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

// Get current user's statistics
router.get('/me', authenticate, async (req, res) => {
    try {
        const stats = await getUserStats(req.user.uid);
        res.json({ stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

export default router;
