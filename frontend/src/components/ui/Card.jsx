import { cn } from '../../utils/helpers';

export const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div
            className={cn(
                'card',
                hover && 'hover:border-primary/50',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
