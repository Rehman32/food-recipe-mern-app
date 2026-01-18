import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { cn } from '../../utils/helpers';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useThemeStore();

    const themes = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        'p-2 rounded-lg transition-all duration-200',
                        theme === value
                            ? 'bg-white dark:bg-surface-700 text-primary-500 shadow-sm'
                            : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                    )}
                    title={label}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
};

export { ThemeToggle };
