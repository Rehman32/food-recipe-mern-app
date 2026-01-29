import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ChefHat,
    Sparkles,
    Search,
    CalendarDays,
    Clock,
    Heart,
    Flame,
    Leaf,
    ArrowRight,
    Star,
    TrendingUp,
    Apple,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';
import { SpoonacularRecipe } from '../types';

const HomePage: React.FC = () => {
    // Fetch random popular recipes for the homepage
    const { data: randomData, isLoading } = useQuery({
        queryKey: ['randomRecipes'],
        queryFn: () => spoonacularApi.getRandom(undefined, 8),
        staleTime: 10 * 60 * 1000, // 10 min cache
    });

    const recipes: SpoonacularRecipe[] = randomData?.data?.recipes || [];

    // Helper to get calories from nutrition
    const getCalories = (recipe: SpoonacularRecipe) => {
        const cal = recipe.nutrition?.nutrients?.find((n) => n.name === 'Calories');
        return cal ? Math.round(cal.amount) : null;
    };

    const getProtein = (recipe: SpoonacularRecipe) => {
        const p = recipe.nutrition?.nutrients?.find((n) => n.name === 'Protein');
        return p ? Math.round(p.amount) : null;
    };

    return (
        <div className="min-h-screen">
            {/* ─── Hero Section ─────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Powered by 500K+ Real Recipes</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Cook Smarter,<br />
                            <span className="text-yellow-300">Eat Better</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Discover recipes with real nutrition data, smart diet filters, AI meal plans,
                            and detailed calorie tracking — all in one place.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/recipes"
                                className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Search className="w-5 h-5" />
                                Explore Recipes
                            </Link>
                            <Link
                                to="/nutrition"
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                            >
                                <Apple className="w-5 h-5" />
                                Nutrition Finder
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1200 100" className="w-full h-12 sm:h-16" preserveAspectRatio="none">
                        <path d="M0,50 C300,100 900,0 1200,50 L1200,100 L0,100 Z" fill="currentColor" className="text-gray-50 dark:text-gray-900" />
                    </svg>
                </div>
            </section>

            {/* ─── Features Strip ──────────────────────────── */}
            <section className="bg-gray-50 dark:bg-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Sparkles, title: 'AI Meal Plans', desc: 'Auto-generate daily plans', link: '/meal-planner', color: 'from-purple-500 to-indigo-600' },
                            { icon: Search, title: 'Smart Search', desc: 'By diet, nutrients, ingredients', link: '/search', color: 'from-blue-500 to-cyan-600' },
                            { icon: Flame, title: 'Calorie Tracker', desc: 'Detailed nutrition data', link: '/nutrition', color: 'from-orange-500 to-red-600' },
                            { icon: Leaf, title: 'Diet Filters', desc: 'Vegan, keto, gluten-free', link: '/recipes', color: 'from-green-500 to-emerald-600' },
                        ].map((feature) => (
                            <Link
                                key={feature.title}
                                to={feature.link}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Trending Recipes ────────────────────────── */}
            <section className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-red-500" />
                                <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">Trending Now</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popular Recipes</h2>
                        </div>
                        <Link
                            to="/recipes"
                            className="hidden sm:inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold transition-colors"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recipes.map((recipe) => (
                                <Link
                                    key={recipe.id}
                                    to={`/recipes/${recipe.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                        {/* Diet badges */}
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                            {recipe.vegan && (
                                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegan</span>
                                            )}
                                            {recipe.glutenFree && (
                                                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">GF</span>
                                            )}
                                            {recipe.veryHealthy && (
                                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Healthy</span>
                                            )}
                                        </div>

                                        {/* Health score */}
                                        {recipe.healthScore > 0 && (
                                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                                <span className="text-xs font-bold text-gray-800 dark:text-white">{recipe.healthScore}</span>
                                            </div>
                                        )}

                                        {/* Cook time */}
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full px-2 py-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs font-medium">{recipe.readyInMinutes}m</span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                                            {recipe.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-3">
                                                {getCalories(recipe) && (
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                        {getCalories(recipe)} cal
                                                    </span>
                                                )}
                                                {getProtein(recipe) && (
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-blue-500" />
                                                        {getProtein(recipe)}g protein
                                                    </span>
                                                )}
                                            </div>
                                            {recipe.aggregateLikes != null && recipe.aggregateLikes > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3" />
                                                    {recipe.aggregateLikes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-8 sm:hidden">
                        <Link
                            to="/recipes"
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold"
                        >
                            View All Recipes <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ───────────────────────────────── */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: 'Recipes Available', value: '500K+', icon: ChefHat },
                            { label: 'Cuisines', value: '25+', icon: Star },
                            { label: 'Diet Types', value: '10+', icon: Leaf },
                            { label: 'Nutrients Tracked', value: '30+', icon: Flame },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <stat.icon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ─────────────────────────────── */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Transform Your Cooking?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        Track nutrition, plan meals, discover recipes by what's in your fridge,
                        and find the perfect dish for any diet — all for free.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg"
                        >
                            <Search className="w-5 h-5" />
                            Smart Search
                        </Link>
                        <Link
                            to="/meal-planner"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
                        >
                            <CalendarDays className="w-5 h-5" />
                            AI Meal Planner
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
