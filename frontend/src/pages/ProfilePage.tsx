import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    MapPin, Calendar, ChefHat, Users, BookOpen, Heart, Settings, UserPlus, Camera,
} from 'lucide-react';
import { userApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import RecipeGrid from '../components/recipe/RecipeGrid';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/helpers';

type TabType = 'recipes' | 'collections' | 'about';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('recipes');

    const isOwnProfile = currentUser?.username === username;

    // Fetch profile
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ['profile', username],
        queryFn: () => userApi.getProfile(username!),
        enabled: !!username,
    });

    // Fetch user's recipes
    const { data: recipesData, isLoading: recipesLoading } = useQuery({
        queryKey: ['userRecipes', username],
        queryFn: () => userApi.getRecipes(username!),
        enabled: !!username && activeTab === 'recipes',
    });

    // Fetch user's collections
    const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
        queryKey: ['userCollections', username],
        queryFn: () => userApi.getCollections(username!),
        enabled: !!username && activeTab === 'collections',
    });

    const profile = profileData?.data?.user;
    const recipes = recipesData?.data?.recipes || [];
    const collections = collectionsData?.data?.collections || [];

    // Follow/unfollow
    const followMutation = useMutation({
        mutationFn: () => userApi.follow(profile!._id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
    });

    const unfollowMutation = useMutation({
        mutationFn: () => userApi.unfollow(profile!._id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
    });

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
                <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-700 animate-pulse" />
                <div className="container mx-auto px-4 -mt-16">
                    <div className="w-32 h-32 rounded-full bg-surface-200 dark:bg-surface-700 border-4 border-white dark:border-surface-900 animate-pulse" />
                    <div className="mt-4 space-y-3">
                        <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-48 animate-pulse" />
                        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">User not found</h2>
                    <Link to="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        );
    }

    const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: 'recipes', label: 'Recipes', icon: <BookOpen className="w-4 h-4" /> },
        { key: 'collections', label: 'Collections', icon: <Heart className="w-4 h-4" /> },
        { key: 'about', label: 'About', icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Hero Banner */}
            <div className="h-48 md:h-56 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative">
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile Header */}
            <div className="container mx-auto px-4">
                <div className="relative -mt-16 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full border-4 border-white dark:border-surface-900 object-cover shadow-lg" />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-surface-900 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shadow-lg">
                                    <ChefHat className="w-12 h-12 text-primary-500" />
                                </div>
                            )}
                            {isOwnProfile && (
                                <button className="absolute bottom-1 right-1 p-2 rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Name & Actions */}
                        <div className="flex-1 pb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">{profile.name}</h1>
                            <p className="text-surface-500">@{profile.username}</p>
                        </div>

                        <div className="flex gap-2 pb-2">
                            {isOwnProfile ? (
                                <Link to="/settings">
                                    <Button variant="secondary" leftIcon={<Settings className="w-4 h-4" />}>Edit Profile</Button>
                                </Link>
                            ) : currentUser ? (
                                <Button
                                    variant="primary"
                                    leftIcon={followMutation.isPending || unfollowMutation.isPending ? undefined : <UserPlus className="w-4 h-4" />}
                                    onClick={() => followMutation.mutate()}
                                    disabled={followMutation.isPending || unfollowMutation.isPending}
                                >
                                    Follow
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Bio & Meta */}
                <div className="mb-6">
                    {profile.bio && <p className="text-surface-700 dark:text-surface-300 mb-3 max-w-2xl">{profile.bio}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                        {profile.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>
                        )}
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {joinDate}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-8 pb-6 border-b border-surface-200 dark:border-surface-800">
                    <div className="text-center">
                        <p className="text-xl font-bold text-surface-900 dark:text-white">{profile.stats?.recipesSubmitted || 0}</p>
                        <p className="text-sm text-surface-500">Recipes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-surface-900 dark:text-white">{profile.stats?.followers || 0}</p>
                        <p className="text-sm text-surface-500">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-surface-900 dark:text-white">{profile.stats?.following || 0}</p>
                        <p className="text-sm text-surface-500">Following</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-surface-900 dark:text-white">{profile.stats?.recipesCooked || 0}</p>
                        <p className="text-sm text-surface-500">Cooked</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
                                activeTab === tab.key
                                    ? 'bg-primary-500 text-white'
                                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                            )}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="pb-12">
                    {activeTab === 'recipes' && (
                        <RecipeGrid
                            recipes={recipes}
                            isLoading={recipesLoading}
                            emptyMessage={isOwnProfile ? "You haven't published any recipes yet" : "This user hasn't published any recipes yet"}
                        />
                    )}

                    {activeTab === 'collections' && (
                        <div>
                            {collectionsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="rounded-2xl bg-white dark:bg-surface-800 animate-pulse h-48" />
                                    ))}
                                </div>
                            ) : collections.length === 0 ? (
                                <p className="text-center text-surface-500 py-12">No collections yet</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {collections.map((collection: any) => (
                                        <Link
                                            key={collection._id}
                                            to={`/collections/${collection._id}`}
                                            className="group block rounded-2xl overflow-hidden bg-white dark:bg-surface-800 shadow-soft hover:shadow-lg transition-all"
                                        >
                                            <div className="h-32 bg-gradient-to-br from-primary-400 to-accent-400 relative">
                                                {collection.coverImage && (
                                                    <img src={collection.coverImage} alt="" className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                {collection.isDefault && (
                                                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-white/90 rounded-full">Default</span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">{collection.name}</h3>
                                                <p className="text-sm text-surface-500 mt-1">{collection.recipeCount || collection.recipes?.length || 0} recipes</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="max-w-2xl space-y-6">
                            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6">
                                <h3 className="font-semibold text-surface-900 dark:text-white mb-4">About {profile.name}</h3>
                                <p className="text-surface-600 dark:text-surface-400">{profile.bio || 'No bio yet.'}</p>
                            </div>
                            {profile.preferences && (
                                <>
                                    {profile.preferences.cuisines?.length > 0 && (
                                        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6">
                                            <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Favorite Cuisines</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.preferences.cuisines.map((c: string) => (
                                                    <span key={c} className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full capitalize">{c}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {profile.preferences.dietary?.length > 0 && (
                                        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6">
                                            <h3 className="font-semibold text-surface-900 dark:text-white mb-3">Dietary Preferences</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.preferences.dietary.map((d: string) => (
                                                    <span key={d} className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full capitalize">{d.replace('-', ' ')}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
