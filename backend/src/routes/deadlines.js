import express from 'express';
import authenticate from '../middleware/auth.js';
import { getUserDeadlines } from '../services/firestore.js';

const router = express.Router();

// Get user's deadlines
router.get('/user/me', authenticate, async (req, res) => {
    try {
        const deadlines = await getUserDeadlines(req.user.uid);
        res.json({ deadlines });
    } catch (error) {
        console.error('Get deadlines error:', error);
        res.status(500).json({ error: 'Failed to fetch deadlines' });
    }
});

export default router;
