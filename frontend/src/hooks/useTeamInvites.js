import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTeamInvites = () => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvites = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await axios.get(`${API_URL}/api/teams/invites/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setInvites(response.data.invites);
            setError(null);
        } catch (err) {
            console.error('Fetch invites error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const acceptInvite = useCallback(async (inviteId) => {
        try {
            const token = localStorage.getItem('authToken');

            await axios.post(
                `${API_URL}/api/teams/invites/${inviteId}/accept`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setInvites(prev => prev.filter(invite => invite.id !== inviteId));

            return { success: true };
        } catch (err) {
            console.error('Accept invite error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    const rejectInvite = useCallback(async (inviteId) => {
        try {
            const token = localStorage.getItem('authToken');

            await axios.post(
                `${API_URL}/api/teams/invites/${inviteId}/reject`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state
            setInvites(prev => prev.filter(invite => invite.id !== inviteId));

            return { success: true };
        } catch (err) {
            console.error('Reject invite error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    return {
        invites,
        loading,
        error,
        acceptInvite,
        rejectInvite,
        refresh: fetchInvites,
        inviteCount: invites.length
    };
};
