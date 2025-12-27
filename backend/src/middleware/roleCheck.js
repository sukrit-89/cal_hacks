export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden - Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

export const isOrganizer = requireRole('organizer');
export const isParticipant = requireRole('participant');
export const isMentor = requireRole('mentor');
export const isAnyUser = requireRole('organizer', 'participant');
export const isOrganizerOrMentor = requireRole('organizer', 'mentor');

export default requireRole;
