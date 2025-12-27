import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useUserStats = (userId) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                const endpoint = userId
                    ? `${API_URL}/api/stats/user/${userId}`
                    : `${API_URL}/api/stats/me`;

                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setStats(response.data.stats);
                setError(null);
            } catch (err) {
                console.error('Fetch stats error:', err);
                setError(err.message);
                // Set default values on error
                setStats({
                    activeHackathons: 0,
                    pendingReviews: 0,
                    totalWins: 0,
                    totalParticipations: 0,
                    rank: null,
                    rankPercentile: null
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    return { stats, loading, error };
};
