import { cn } from '../../utils/helpers';

export const Input = ({
    label,
    error,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={cn('w-full', containerClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'input-field',
                    error && 'border-accent-red focus:ring-accent-red',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-accent-red">{error}</p>
            )}
        </div>
    );
};

export default Input;
