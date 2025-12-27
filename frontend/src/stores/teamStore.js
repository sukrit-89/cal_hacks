import { create } from 'zustand';
import api from '../services/api.js';

export const useTeamStore = create((set, get) => ({
    teams: [],
    currentTeam: null,
    loading: false,
    error: null,

    // Create team
    createTeam: async (hackathonId, teamName) => {
        try {
            set({ loading: true, error: null });
            const response = await api.post('/teams', { hackathonId, teamName });
            set({ currentTeam: response.data.team, loading: false });
            return response.data.team;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Join team
    joinTeam: async (teamCode) => {
        try {
            set({ loading: true, error: null });
            const response = await api.post('/teams/join', { teamCode });
            set({ currentTeam: response.data.team, loading: false });
            return response.data.team;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Fetch team
    fetchTeam: async (teamId) => {
        try {
            set({ loading: true, error: null });
            const response = await api.get(`/teams/${teamId}`);
            set({ currentTeam: response.data.team, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch user teams
    fetchUserTeams: async () => {
        try {
            set({ loading: true, error: null });
            const response = await api.get('/teams/user/me');
            set({ teams: response.data.teams, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch teams by hackathon
    fetchTeamsByHackathon: async (hackathonId) => {
        try {
            set({ loading: true, error: null });
            const response = await api.get(`/teams/hackathon/${hackathonId}`);
            set({ teams: response.data.teams, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Submit registration
    submitRegistration: async (teamId, data) => {
        try {
            set({ loading: true, error: null });
            await api.post(`/teams/${teamId}/submit`, data);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // RSVP
    rsvp: async (teamId) => {
        try {
            set({ loading: true, error: null });
            const response = await api.post(`/teams/${teamId}/rsvp`);
            set({ loading: false });
            return response.data.qrCode;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Final submission
    submitFinal: async (teamId, data) => {
        try {
            set({ loading: true, error: null });
            await api.post(`/teams/${teamId}/final-submit`, data);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Update team
    updateTeam: async (teamId, updates) => {
        try {
            set({ loading: true, error: null });
            await api.put(`/teams/${teamId}`, updates);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
