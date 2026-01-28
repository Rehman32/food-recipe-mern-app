import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Rss, Star, ChefHat, Clock, Flame,
    Heart, ArrowRight, TrendingUp, Sparkles,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';

const ActivityFeedPage: React.FC = () => {
    // Latest recipes via Spoonacular search (sorted by time)
    const { data: latestData, isLoading: latestLoading } = useQuery({
        queryKey: ['feedLatest'],
        queryFn: () => spoonacularApi.search({ sort: 'time', number: 10 }),
        staleTime: 5 * 60 * 1000,
    });

    // Trending = popular random recipes
    const { data: trendingData, isLoading: trendingLoading } = useQuery({
        queryKey: ['feedTrending'],
        queryFn: () => spoonacularApi.getRandom(undefined, 5),
        staleTime: 5 * 60 * 1000,
    });

    const latest = latestData?.data?.results || [];
    const trending = trendingData?.data?.recipes || [];

    const getCalories = (recipe: any) => {
        const cal = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories');
        return cal ? Math.round(cal.amount) : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500">
                            <Rss className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
                            <p className="text-gray-600 dark:text-gray-400">Discover what's trending and new in the community</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Feed — Latest */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Latest Recipes
                        </h2>

                        {latestLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl animate-pulse h-44 shadow-sm" />
                                ))}
                            </div>
                        ) : latest.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No recipes in the feed yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {latest.map((recipe: any) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="sm:w-52 h-44 sm:h-auto flex-shrink-0">
                                                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="p-5 flex-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                                                    {recipe.vegan && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Vegan</span>}
                                                    {!recipe.vegan && recipe.vegetarian && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Vegetarian</span>}
                                                    {recipe.glutenFree && <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Gluten Free</span>}
                                                    {recipe.dairyFree && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">Dairy Free</span>}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{recipe.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: recipe.summary?.replace(/<[^>]+>/g, '').slice(0, 120) + '...' || '' }} />
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    {recipe.readyInMinutes && (
                                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.readyInMinutes}m</span>
                                                    )}
                                                    {recipe.healthScore > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />{recipe.healthScore}
                                                        </span>
                                                    )}
                                                    {getCalories(recipe) && (
                                                        <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />{getCalories(recipe)} cal</span>
                                                    )}
                                                    {recipe.cuisines?.length > 0 && (
                                                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs capitalize">{recipe.cuisines[0]}</span>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center text-indigo-500 text-sm font-medium hover:gap-2 transition-all">
                                                    View Recipe <ArrowRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar — Trending */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-orange-500" /> Trending
                        </h2>
                        <div className="space-y-3">
                            {trendingLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse h-20 shadow-sm" />
                                ))
                            ) : trending.length === 0 ? (
                                <p className="text-gray-500 text-sm">No trending recipes yet.</p>
                            ) : (
                                trending.map((recipe: any, idx: number) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all group border border-gray-100 dark:border-gray-700"
                                    >
                                        <span className="text-2xl font-bold text-gray-200 dark:text-gray-700 w-8">{idx + 1}</span>
                                        <img
                                            src={recipe.image}
                                            alt=""
                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            loading="lazy"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate">{recipe.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                {recipe.readyInMinutes && (
                                                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{recipe.readyInMinutes}m</span>
                                                )}
                                                {recipe.healthScore > 0 && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        {recipe.healthScore}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Community Stats */}
                        <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Community</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold">5K+</p>
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
