import express from 'express';
import authenticate from '../middleware/auth.js';
import {
    getUserNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification
} from '../services/notificationService.js';

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const { limit } = req.query;
        const notifications = await getUserNotifications(
            req.user.uid,
            limit ? parseInt(limit) : 50
        );

        const unreadCount = await getUnreadCount(req.user.uid);

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await markNotificationAsRead(req.params.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req, res) => {
    try {
        const count = await markAllAsRead(req.user.uid);
        res.json({
            message: 'All notifications marked as read',
            count
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await deleteNotification(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
