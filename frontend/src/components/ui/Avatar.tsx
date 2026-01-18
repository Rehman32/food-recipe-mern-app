import React from 'react';
import { cn } from '../../utils/helpers';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
    src?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const initials = getInitials(name);

    return (
        <div
            className={cn(
                'relative rounded-full overflow-hidden flex items-center justify-center',
                'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-medium',
                sizeClasses[size],
                className
            )}
        >
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};

export { Avatar };
