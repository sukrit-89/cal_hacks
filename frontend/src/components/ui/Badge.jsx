import { cn, getStatusColor } from '../../utils/helpers';

export const Badge = ({ children, status, className = '', ...props }) => {
    const statusClass = status ? getStatusColor(status) : 'badge-info';

    return (
        <span
            className={cn('badge', statusClass, className)}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
