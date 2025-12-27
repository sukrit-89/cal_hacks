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

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        .orderBy('evaluatedAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    getEvaluationsByHackathon
};
