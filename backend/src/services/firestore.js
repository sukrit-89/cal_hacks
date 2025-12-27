import { db } from '../config/firebase.js';

// User operations
export const createUser = async (uid, userData) => {
    await db.collection('users').doc(uid).set({
        ...userData,
        createdAt: new Date().toISOString()
    });
};

export const getUser = async (uid) => {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const updateUser = async (uid, updates) => {
    await db.collection('users').doc(uid).update(updates);
};

// Hackathon operations
export const createHackathon = async (hackathonData) => {
    const docRef = await db.collection('hackathons').add({
        ...hackathonData,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getHackathon = async (hackathonId) => {
    const doc = await db.collection('hackathons').doc(hackathonId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getAllHackathons = async (filters = {}) => {
    let query = db.collection('hackathons');

    if (filters.status) {
        query = query.where('status', '==', filters.status);
    }

    if (filters.organizerId) {
        query = query.where('organizerId', '==', filters.organizerId);
    }

    // Get results without orderBy to avoid composite index requirement
    const snapshot = await query.get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort in memory by createdAt
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateHackathon = async (hackathonId, updates) => {
    await db.collection('hackathons').doc(hackathonId).update(updates);
};

export const deleteHackathon = async (hackathonId) => {
    await db.collection('hackathons').doc(hackathonId).delete();
};

// Team operations
export const createTeam = async (teamData) => {
    const docRef = await db.collection('teams').add({
        ...teamData,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getTeam = async (teamId) => {
    const doc = await db.collection('teams').doc(teamId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getTeamByCode = async (teamCode) => {
    const snapshot = await db.collection('teams')
        .where('teamCode', '==', teamCode)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
};

export const getTeamsByHackathon = async (hackathonId) => {
    const snapshot = await db.collection('teams')
        .where('hackathonId', '==', hackathonId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTeamsByUser = async (userId) => {
    const snapshot = await db.collection('teams')
        .where('members', 'array-contains', userId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTeam = async (teamId, updates) => {
    await db.collection('teams').doc(teamId).update(updates);
};

// Evaluation operations
export const saveEvaluation = async (evaluationData) => {
    const docRef = await db.collection('evaluations').add({
        ...evaluationData,
        evaluatedAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getEvaluationsByTeam = async (teamId) => {
    const snapshot = await db.collection('evaluations')
        .where('teamId', '==', teamId)
        .get();

    // Sort in memory to avoid composite index requirement
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => new Date(b.evaluatedAt) - new Date(a.evaluatedAt));
};

export const getEvaluationsByHackathon = async (hackathonId, type = null) => {
    let query = db.collection('evaluations')
        .where('hackathonId', '==', hackathonId);

    if (type) {
        query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// User statistics operations
export const getUserStats = async (userId) => {
    // Get all user's teams
    const userTeams = await getTeamsByUser(userId);

    // Calculate stats
    const activeHackathons = userTeams.filter(t =>
        ['pending', 'accepted'].includes(t.status)
    ).length;

    const pendingReviews = userTeams.filter(t => t.status === 'pending').length;

    const totalWins = userTeams.filter(t => t.winner === true).length;

    const totalParticipations = userTeams.length;

    // Calculate ranking (this is a simple implementation)
    // In production, you'd want a more sophisticated ranking system
    const allUsersSnapshot = await db.collection('users').get();
    const totalUsers = allUsersSnapshot.size;
    const rank = totalWins > 0 ? Math.ceil((totalUsers * 0.1)) : null; // Top 10% if has wins

    return {
        activeHackathons,
        pendingReviews,
        totalWins,
        totalParticipations,
        rank,
        rankPercentile: rank ? 10 : null
    };
};

// Team invite operations
export const createTeamInvite = async (inviteData) => {
    const docRef = await db.collection('team_invites').add({
        ...inviteData,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getTeamInvites = async (userId) => {
    const snapshot = await db.collection('team_invites')
        .where('invitedUser', '==', userId)
        .where('status', '==', 'pending')
        .get();

    // Sort in memory to avoid composite index requirement
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateInviteStatus = async (inviteId, status) => {
    await db.collection('team_invites').doc(inviteId).update({
        status,
        respondedAt: new Date().toISOString()
    });
};

export const getUserInviteCount = async (userId) => {
    const snapshot = await db.collection('team_invites')
        .where('invitedUser', '==', userId)
        .where('status', '==', 'pending')
        .get();

    return snapshot.size;
};

// Deadline operations
export const getUserDeadlines = async (userId) => {
    // Get user's active teams
    const userTeams = await getTeamsByUser(userId);
    const activeTeams = userTeams.filter(t => ['pending', 'accepted'].includes(t.status));

    const deadlines = [];

    // Extract deadlines from hackathon timelines
    for (const team of activeTeams) {
        const hackathon = await getHackathon(team.hackathonId);
        if (!hackathon || !hackathon.timeline) continue;

        const timeline = hackathon.timeline;

        // Registration deadline
        if (timeline.registrationClose) {
            deadlines.push({
                id: `${hackathon.id}-registration`,
                title: 'Registration Closes',
                event: hackathon.title,
                time: timeline.registrationClose,
                hackathonId: hackathon.id
            });
        }

        // Idea submission deadline
        if (timeline.ideaSubmission) {
            deadlines.push({
                id: `${hackathon.id}-idea`,
                title: 'Idea Submission',
                event: hackathon.title,
                time: timeline.ideaSubmission,
                hackathonId: hackathon.id
            });
        }

        // Final submission deadline
        if (timeline.finalSubmission) {
            deadlines.push({
                id: `${hackathon.id}-final`,
                title: 'Final Submission',
                event: hackathon.title,
                time: timeline.finalSubmission,
                hackathonId: hackathon.id
            });
        }
    }

    // Filter out past deadlines and sort by date
    const now = new Date();
    return deadlines

        .filter(d => new Date(d.time) > now)
        .sort((a, b) => new Date(a.time) - new Date(b.time));
};

// Mentor operations
export const createMentor = async (mentorData) => {
    const docRef = await db.collection('mentors').add({
        ...mentorData,
        assignedCount: 0,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getMentor = async (mentorId) => {
    const doc = await db.collection('mentors').doc(mentorId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

export const getAllMentors = async () => {
    const snapshot = await db.collection('mentors').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateMentor = async (mentorId, updates) => {
    await db.collection('mentors').doc(mentorId).update(updates);
};

export const getMentorsByDomain = async (domain) => {
    const snapshot = await db.collection('mentors')
        .where('domains', 'array-contains', domain)
        .get();

    // Sort by assignedCount in memory for deterministic load balancing
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return docs.sort((a, b) => a.assignedCount - b.assignedCount);
};

// Mentor assignment operations
export const createMentorAssignment = async (assignmentData) => {
    const docRef = await db.collection('mentorAssignments').add({
        ...assignmentData,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

export const getAssignmentsByMentor = async (mentorId, status = null) => {
    let query = db.collection('mentorAssignments')
        .where('mentorId', '==', mentorId);

    if (status) {
        query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt in memory
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAssignmentsByHackathon = async (hackathonId) => {
    const snapshot = await db.collection('mentorAssignments')
        .where('hackathonId', '==', hackathonId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAssignmentsByTeam = async (teamId) => {
    const snapshot = await db.collection('mentorAssignments')
        .where('teamId', '==', teamId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateAssignmentStatus = async (assignmentId, status) => {
    const updates = {
        status,
        ...(status === 'reviewed' && { reviewedAt: new Date().toISOString() })
    };
    await db.collection('mentorAssignments').doc(assignmentId).update(updates);
};

export default {
    createUser,
    getUser,
    updateUser,
    createHackathon,
    getHackathon,
    getAllHackathons,
    updateHackathon,
    deleteHackathon,
    createTeam,
    getTeam,
    getTeamByCode,
    getTeamsByHackathon,
    getTeamsByUser,
    updateTeam,
    saveEvaluation,
    getEvaluationsByTeam,
    getEvaluationsByHackathon,
    getUserStats,
    createTeamInvite,
    getTeamInvites,
    updateInviteStatus,
    getUserInviteCount,
    getUserDeadlines,
    createMentor,
    getMentor,
    getAllMentors,
    updateMentor,
    getMentorsByDomain,
    createMentorAssignment,
    getAssignmentsByMentor,
    getAssignmentsByHackathon,
    getAssignmentsByTeam,
    updateAssignmentStatus
};

