import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../stores/authStore';

// Validation schemas
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const { login, register: registerUser, isLoading, error, clearError } = useAuthStore();

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    const handleLogin = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
            onClose();
        } catch {
            // Error is handled by store
        }
    };

    const handleRegister = async (data: RegisterFormData) => {
        try {
            await registerUser(data.name, data.email, data.password);
            onClose();
        } catch {
            // Error is handled by store
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        clearError();
        loginForm.reset();
        registerForm.reset();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-surface-500 mt-1">
                    {mode === 'login'
                        ? 'Sign in to access your recipes'
                        : 'Join our cooking community'}
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Google OAuth */}
            <Button
                variant="secondary"
                fullWidth
                onClick={handleGoogleLogin}
                leftIcon={<Chrome className="w-5 h-5" />}
                className="mb-6"
            >
                Continue with Google
            </Button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-200 dark:border-surface-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-surface-900 text-surface-500">
                        or continue with email
                    </span>
                </div>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="w-5 h-5" />}
                        error={loginForm.formState.errors.email?.message}
                        {...loginForm.register('email')}
                    />

                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="hover:text-surface-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        }
                        error={loginForm.formState.errors.password?.message}
                        {...loginForm.register('password')}
                    />

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        leftIcon={<User className="w-5 h-5" />}
                        error={registerForm.formState.errors.name?.message}
                        {...registerForm.register('name')}
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        leftIcon={<Mail className="w-5 h-5" />}
                        error={registerForm.formState.errors.email?.message}
                        {...registerForm.register('email')}
                    />

                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="hover:text-surface-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        }
                        error={registerForm.formState.errors.password?.message}
                        {...registerForm.register('password')}
                    />

                    <Input
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        leftIcon={<Lock className="w-5 h-5" />}
                        error={registerForm.formState.errors.confirmPassword?.message}
                        {...registerForm.register('confirmPassword')}
                    />

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Create Account
                    </Button>
                </form>
            )}

            {/* Switch mode */}
            <p className="text-center mt-6 text-surface-600 dark:text-surface-400">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                    type="button"
                    onClick={switchMode}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </Modal>
    );
};

export { AuthModal };
