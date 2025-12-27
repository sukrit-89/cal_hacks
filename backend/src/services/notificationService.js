import { db } from '../config/firebase.js';

/**
 * Notification types:
 * - team_invite: Team invitation
 * - application_status: Application accepted/rejected
 * - deadline_reminder: Upcoming deadline
 * - general: General announcements
 */

// Create notification
export const createNotification = async (notificationData) => {
    const docRef = await db.collection('notifications').add({
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
    const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get unread count
export const getUnreadCount = async (userId) => {
    const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

    return snapshot.size;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    await db.collection('notifications').doc(notificationId).update({
        read: true,
        readAt: new Date().toISOString()
    });
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId) => {
    const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            read: true,
            readAt: new Date().toISOString()
        });
    });

    await batch.commit();
    return snapshot.size; // Return count of notifications marked as read
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    await db.collection('notifications').doc(notificationId).delete();
};

// Create team invite notification
export const createTeamInviteNotification = async (userId, teamName, teamId, invitedBy) => {
    return await createNotification({
        userId,
        type: 'team_invite',
        title: 'Team Invitation',
        message: `${invitedBy} invited you to join team "${teamName}"`,
        data: {
            teamId,
            invitedBy
        }
    });
};

// Create application status notification
export const createApplicationStatusNotification = async (userId, hackathonTitle, status) => {
    const message = status === 'accepted'
        ? `Your application for ${hackathonTitle} has been accepted!`
        : `Your application for ${hackathonTitle} was not accepted this time.`;

    return await createNotification({
        userId,
        type: 'application_status',
        title: status === 'accepted' ? 'Application Accepted' : 'Application Update',
        message,
        data: {
            hackathonTitle,
            status
        }
    });
};

// Create deadline reminder notification
export const createDeadlineReminder = async (userId, deadlineTitle, hackathonTitle, dueDate) => {
    return await createNotification({
        userId,
        type: 'deadline_reminder',
        title: 'Upcoming Deadline',
        message: `${deadlineTitle} for ${hackathonTitle} is due ${dueDate}`,
        data: {
            deadlineTitle,
            hackathonTitle,
            dueDate
        }
    });
};

export default {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    createTeamInviteNotification,
    createApplicationStatusNotification,
    createDeadlineReminder
};
