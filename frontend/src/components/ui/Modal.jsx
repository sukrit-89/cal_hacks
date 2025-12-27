import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                'relative bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full animate-fade-in',
                sizes[size],
                className
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
