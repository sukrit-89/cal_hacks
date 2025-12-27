// Utility to merge class names
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Format date to readable string
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatusColor = (status) => {
    const colors = {
        pending: 'badge-warning',
        accepted: 'badge-success',
        rejected: 'badge-error',
        waitlisted: 'badge-info',
        draft: 'badge-info',
        live: 'badge-success',
        closed: 'badge-error'
    };
    return colors[status] || 'badge-info';
};

export const truncate = (str, length = 100) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

export const generateTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
