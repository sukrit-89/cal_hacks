import { cn } from '../../utils/helpers';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary hover:bg-primary-dark text-white',
        secondary: 'bg-dark-card hover:bg-dark-hover text-white border border-dark-border',
        success: 'bg-accent-green hover:bg-accent-green/90 text-white',
        danger: 'bg-accent-red hover:bg-accent-red/90 text-white',
        ghost: 'hover:bg-dark-hover text-white'
    };

    const sizes = {
        sm: 'py-1.5 px-4 text-sm',
        md: 'py-2.5 px-6 text-base',
        lg: 'py-3 px-8 text-lg'
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
