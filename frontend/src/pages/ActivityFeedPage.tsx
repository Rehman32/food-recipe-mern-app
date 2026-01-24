import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Rss, Star, ChefHat, Clock, Users } from 'lucide-react';
import { recipeApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { formatDate, formatTime } from '../utils/helpers';

const ActivityFeedPage: React.FC = () => {
    const { user } = useAuthStore();

    // Show trending/latest recipes as feed content
    const { data: trendingData, isLoading: trendingLoading } = useQuery({
        queryKey: ['feedTrending'],
        queryFn: () => recipeApi.getTrending(),
    });

    const { data: latestData, isLoading: latestLoading } = useQuery({
        queryKey: ['feedLatest'],
        queryFn: () => recipeApi.getAll({ sort: 'newest' } as any),
    });

    const trending = trendingData?.data?.recipes || [];
    const latest = latestData?.data?.recipes || latestData?.data?.data || [];
    const isLoading = trendingLoading || latestLoading;

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-3">
                        <Rss className="w-7 h-7 text-primary-500" />
                        <div>
                            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Activity Feed</h1>
                            <p className="text-surface-600 dark:text-surface-400">Discover what's trending and new in the community</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" /> Latest Recipes
                        </h2>

                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl p-6 animate-pulse h-40" />
                                ))}
                            </div>
                        ) : latest.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl">
                                <ChefHat className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                                <p className="text-surface-500">No recipes in the feed yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {latest.slice(0, 10).map((recipe: any) => {
                                    const authorName = typeof recipe.author === 'object' ? recipe.author.name : 'Anonymous';
                                    const authorUsername = typeof recipe.author === 'object' ? recipe.author.username : '';

                                    return (
                                        <Link
                                            key={recipe._id}
                                            to={`/recipes/${recipe.slug || recipe._id}`}
                                            className="block bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                {recipe.images?.[0]?.url && (
                                                    <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                                                        <img src={recipe.images[0].url} alt={recipe.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="p-5 flex-1">
                                                    <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <ChefHat className="w-3.5 h-3.5" />
                                                            {authorName}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDate(recipe.createdAt)}</span>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{recipe.title}</h3>
                                                    <p className="text-sm text-surface-500 line-clamp-2 mb-3">{recipe.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-surface-400">
                                                        {recipe.totalTime && (
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(recipe.totalTime)}</span>
                                                        )}
                                                        {recipe.stats?.averageRating > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                                {recipe.stats.averageRating.toFixed(1)}
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs capitalize">{recipe.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar — Trending */}
                    <div>
                        <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-yellow-500" /> Trending
                        </h2>
                        <div className="space-y-3">
                            {trendingLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-4 animate-pulse h-20" />
                                ))
                            ) : trending.length === 0 ? (
                                <p className="text-surface-500 text-sm">No trending recipes yet.</p>
                            ) : (
                                trending.slice(0, 5).map((recipe: any, idx: number) => (
                                    <Link
                                        key={recipe._id}
                                        to={`/recipes/${recipe.slug || recipe._id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-800 hover:shadow-md transition-all group"
                                    >
                                        <span className="text-2xl font-bold text-surface-200 dark:text-surface-700 w-8">{idx + 1}</span>
                                        {recipe.images?.[0]?.url ? (
                                            <img src={recipe.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                                <ChefHat className="w-5 h-5 text-primary-500" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">{recipe.title}</h4>
                                            {recipe.stats?.averageRating > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-surface-400">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    {recipe.stats.averageRating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Community Stats (static placeholder) */}
                        <div className="mt-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-6 text-white">
                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Community</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold">1K+</p>
                                    <p className="text-xs text-white/70">Recipes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">500+</p>
                                    <p className="text-xs text-white/70">Chefs</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">3K+</p>
                                    <p className="text-xs text-white/70">Reviews</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">10K+</p>
                                    <p className="text-xs text-white/70">Cooked</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityFeedPage;
