import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await axios.get(`${API_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
            setError(null);
        } catch (err) {
            console.error('Fetch notifications error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const token = localStorage.getItem('authToken');

            await axios.put(
                `${API_URL}/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');

            await axios.put(
                `${API_URL}/api/notifications/mark-all-read`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all as read error:', err);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            const token = localStorage.getItem('authToken');

            await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.filter(notif => notif.id !== notificationId)
            );
        } catch (err) {
            console.error('Delete notification error:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
};
