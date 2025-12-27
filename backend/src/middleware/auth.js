import { auth } from '../config/firebase.js';
import { getUser } from '../services/firestore.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(token);

        // Try to get role from token custom claims first
        let role = decodedToken.role;

        // If role is not in token, fetch from Firestore
        if (!role) {
            const userData = await getUser(decodedToken.uid);
            role = userData?.role || 'participant';
        }

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

export default authenticate;
