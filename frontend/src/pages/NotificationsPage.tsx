import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Star, UserPlus, Heart, BookOpen, ChefHat } from 'lucide-react';
import { notificationApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/helpers';

const typeIcons: Record<string, React.ReactNode> = {
    new_review: <Star className="w-5 h-5 text-yellow-500" />,
    new_follower: <UserPlus className="w-5 h-5 text-primary-500" />,
    recipe_liked: <Heart className="w-5 h-5 text-red-500" />,
    recipe_saved: <BookOpen className="w-5 h-5 text-blue-500" />,
    made_it: <ChefHat className="w-5 h-5 text-green-500" />,
};

const NotificationsPage: React.FC = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.getAll(),
        enabled: !!user,
    });

    const markAllMutation = useMutation({
        mutationFn: () => notificationApi.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationApi.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
        },
    });

    const notifications = data?.data?.notifications || [];
    const unread = notifications.filter((n: any) => !n.read).length;

    if (!user) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Sign in to see notifications</h2>
                    <Link to="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        );
    }

    // Group notifications by date
    const grouped: Record<string, any[]> = {};
    notifications.forEach((n: any) => {
        const dateKey = new Date(n.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(n);
    });

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="container mx-auto px-4 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="w-7 h-7 text-primary-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Notifications</h1>
                            {unread > 0 && <p className="text-sm text-surface-500">{unread} unread</p>}
                        </div>
                    </div>
                    {unread > 0 && (
                        <Button variant="ghost" onClick={() => markAllMutation.mutate()} leftIcon={<CheckCheck className="w-4 h-4" />}>
                            Mark all read
                        </Button>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-4 animate-pulse h-20" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                        <Bell className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <p className="text-lg text-surface-500">No notifications yet</p>
                        <p className="text-sm text-surface-400 mt-1">When someone interacts with your recipes, you'll see it here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([date, items]) => (
                            <div key={date}>
                                <h3 className="text-sm font-medium text-surface-500 mb-3">{date}</h3>
                                <div className="space-y-2">
                                    {items.map((notification: any) => {
                                        const senderName = notification.sender?.name || 'Someone';
                                        const recipeLink = notification.recipe ? `/recipes/${notification.recipe.slug || notification.recipe._id}` : null;

                                        return (
                                            <div
                                                key={notification._id}
                                                onClick={() => !notification.read && markReadMutation.mutate(notification._id)}
                                                className={cn(
                                                    'flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer',
                                                    notification.read
                                                        ? 'bg-white dark:bg-surface-800'
                                                        : 'bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20'
                                                )}
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                                                    {typeIcons[notification.type] || <Bell className="w-5 h-5 text-surface-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-surface-700 dark:text-surface-300">
                                                        <span className="font-semibold text-surface-900 dark:text-white">{senderName}</span>{' '}
                                                        {notification.message}
                                                    </p>
                                                    {recipeLink && notification.recipe?.title && (
                                                        <Link to={recipeLink} className="text-sm text-primary-500 hover:text-primary-600 mt-0.5 block" onClick={(e) => e.stopPropagation()}>
                                                            {notification.recipe.title}
                                                        </Link>
                                                    )}
                                                    <p className="text-xs text-surface-400 mt-1">
                                                        {new Date(notification.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
