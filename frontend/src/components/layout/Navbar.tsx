import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    ChefHat,
    Search,
    User,
    LogOut,
    Bell,
    CalendarDays,
    Sparkles,
    FolderOpen,
    Apple,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { AuthModal } from '../auth/AuthModal';
import { cn } from '../../utils/helpers';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/recipes', label: 'Recipes' },
        { to: '/nutrition', label: 'Nutrition', icon: Apple },
        { to: '/ai-suggestions', label: 'AI Chef', icon: Sparkles },
        { to: '/meal-planner', label: 'Meal Plan', requiresAuth: true },
    ];

    const openAuth = (mode: 'login' | 'register') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        setIsProfileDropdownOpen(false);
        navigate('/');
    };

    return (
        <>
            <nav className="sticky top-0 z-40 w-full border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-xl font-bold text-surface-900 dark:text-white"
                        >
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <span className="hidden sm:block font-display">RecipeHub</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <ul className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                if (link.requiresAuth && !isAuthenticated) return null;
                                return (
                                    <li key={link.to}>
                                        <NavLink
                                            to={link.to}
                                            className={({ isActive }) =>
                                                cn(
                                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                    isActive
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                                                )
                                            }
                                        >
                                            {link.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search Button */}
                            <button
                                onClick={() => navigate('/search')}
                                className="p-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {/* Notifications */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="p-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                </button>
                            )}

                            {/* Theme Toggle */}
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>

                            {/* Auth / Profile */}
                            {isAuthenticated && user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                    >
                                        <Avatar src={user.avatar} name={user.name} size="sm" />
                                        <span className="hidden lg:block text-sm font-medium text-surface-700 dark:text-surface-300">
                                            {user.name.split(' ')[0]}
                                        </span>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {isProfileDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0"
                                                onClick={() => setIsProfileDropdownOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 animate-slide-down">
                                                <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-surface-500">@{user.username}</p>
                                                </div>

                                                <Link
                                                    to={`/profile/${user.username}`}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    to="/collections"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <FolderOpen className="w-4 h-4" />
                                                    My Collections
                                                </Link>
                                                <Link
                                                    to="/meal-planner"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <CalendarDays className="w-4 h-4" />
                                                    Meal Planner
                                                </Link>
                                                <Link
                                                    to="/notifications"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <Bell className="w-4 h-4" />
                                                    Notifications
                                                </Link>

                                                <div className="border-t border-surface-200 dark:border-surface-700 mt-2 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => openAuth('login')}>
                                        Sign In
                                    </Button>
                                    <Button size="sm" onClick={() => openAuth('register')}>
                                        Get Started
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-surface-200 dark:border-surface-700 animate-slide-down">
                            <ul className="space-y-1">
                                {navLinks.map((link) => {
                                    if (link.requiresAuth && !isAuthenticated) return null;
                                    return (
                                        <li key={link.to}>
                                            <NavLink
                                                to={link.to}
                                                className={({ isActive }) =>
                                                    cn(
                                                        'block px-4 py-3 rounded-lg text-sm font-medium',
                                                        isActive
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                            : 'text-surface-600 dark:text-surface-400'
                                                    )
                                                }
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </NavLink>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                                <div className="flex items-center justify-between px-4 mb-4">
                                    <span className="text-sm text-surface-600 dark:text-surface-400">Theme</span>
                                    <ThemeToggle />
                                </div>

                                {!isAuthenticated && (
                                    <div className="flex gap-2 px-4">
                                        <Button variant="ghost" fullWidth onClick={() => { openAuth('login'); setIsMenuOpen(false); }}>
                                            Sign In
                                        </Button>
                                        <Button fullWidth onClick={() => { openAuth('register'); setIsMenuOpen(false); }}>
                                            Get Started
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </>
    );
};

export default Navbar;
