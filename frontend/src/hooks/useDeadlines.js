import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDeadlines = () => {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeadlines = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                const response = await axios.get(`${API_URL}/api/deadlines/user/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setDeadlines(response.data.deadlines);
                setError(null);
            } catch (err) {
                console.error('Fetch deadlines error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDeadlines();
    }, []);

    return { deadlines, loading, error };
};
