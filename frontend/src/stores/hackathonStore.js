import { create } from 'zustand';
import api from '../services/api.js';

export const useHackathonStore = create((set, get) => ({
    hackathons: [],
    currentHackathon: null,
    loading: false,
    error: null,

    // Fetch all hackathons
    fetchHackathons: async (filters = {}) => {
        try {
            set({ loading: true, error: null });
            const params = new URLSearchParams(filters);
            const response = await api.get(`/hackathons?${params}`);
            set({ hackathons: response.data.hackathons, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch single hackathon
    fetchHackathon: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await api.get(`/hackathons/${id}`);
            set({ currentHackathon: response.data.hackathon, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Create hackathon
    createHackathon: async (hackathonData) => {
        try {
            set({ loading: true, error: null });
            const response = await api.post('/hackathons', hackathonData);
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Update hackathon
    updateHackathon: async (id, updates) => {
        try {
            set({ loading: true, error: null });
            await api.put(`/hackathons/${id}`, updates);
            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
