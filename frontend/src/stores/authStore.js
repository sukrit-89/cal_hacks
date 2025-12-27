import { create } from 'zustand';
import { auth } from '../config/firebase.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import api from '../services/api.js';

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: true,
    error: null,

    // Initialize auth listener
    initialize: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    localStorage.setItem('authToken', token);

                    // Get user data from backend
                    const response = await api.get('/auth/me');
                    set({ user: response.data.user, loading: false });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    set({ user: null, loading: false });
                }
            } else {
                localStorage.removeItem('authToken');
                set({ user: null, loading: false });
            }
        });
    },

    // Sign up
    signUp: async (email, password, displayName, role) => {
        try {
            set({ loading: true, error: null });

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user in backend (this sets custom claims)
            const response = await api.post('/auth/signup', {
                uid: userCredential.user.uid,
                email,
                displayName,
                role
            });

            // Force refresh token to get updated custom claims
            const token = await userCredential.user.getIdToken(true); // true forces refresh
            localStorage.setItem('authToken', token);

            set({ user: response.data.user, loading: false });
            return response.data.user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Sign in
    signIn: async (email, password) => {
        try {
            set({ loading: true, error: null });

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Force refresh to get latest custom claims
            const token = await userCredential.user.getIdToken(true);
            localStorage.setItem('authToken', token);

            // Get user data
            const response = await api.get('/auth/me');
            set({ user: response.data.user, loading: false });
            return response.data.user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await firebaseSignOut(auth);
            localStorage.removeItem('authToken');
            set({ user: null });
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }
}));
