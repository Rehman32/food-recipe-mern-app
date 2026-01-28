import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, ChefHat, Clock, Flame, Shuffle,
    Leaf, Globe, Heart, Star, Loader2, ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { spoonacularApi } from '../services/api';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Chinese', 'French', 'Korean', 'Greek'];
const DIETARY = [
    { label: 'None', value: '' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten Free', value: 'gluten free' },
    { label: 'Keto', value: 'ketogenic' },
    { label: 'Paleo', value: 'paleo' },
    { label: 'Dairy Free', value: 'dairy free' },
];
const TIMES = [
    { label: 'Any Time', value: 0 },
    { label: '< 15 min', value: 15 },
    { label: '< 30 min', value: 30 },
    { label: '< 60 min', value: 60 },
];

const AISuggestionsPage: React.FC = () => {
    const [cuisine, setCuisine] = useState('Any');
    const [dietary, setDietary] = useState('');
    const [maxTime, setMaxTime] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [queryKey, setQueryKey] = useState(0);

    // Use Spoonacular complexSearch with the user's preferences
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['aiSuggestions', queryKey],
        queryFn: () =>
            spoonacularApi.search({
                query: '',
                cuisine: cuisine !== 'Any' ? cuisine : undefined,
                diet: dietary || undefined,
                maxReadyTime: maxTime > 0 ? maxTime : undefined,
                sort: 'random',
                number: 6,
            }),
        enabled: showResults,
        staleTime: 0,
    });

    // Also fetch random as shuffle option
    const { data: randomData, isLoading: randomLoading } = useQuery({
        queryKey: ['aiRandom', queryKey],
        queryFn: () => {
            const tags = [
                cuisine !== 'Any' ? cuisine.toLowerCase() : '',
                dietary || '',
            ].filter(Boolean).join(',');
            return spoonacularApi.getRandom(tags || undefined, 6);
        },
        enabled: showResults,
        staleTime: 0,
    });

    const searchRecipes = data?.data?.results || [];
    const randomRecipes = randomData?.data?.recipes || [];
    // Merge both sources, deduplicate by id, take 6
    const allRecipes = [...searchRecipes, ...randomRecipes];
    const seen = new Set<number>();
    const recipes = allRecipes.filter((r: any) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
    }).slice(0, 6);

    const loading = isLoading || randomLoading || isFetching;

    const handleGenerate = () => {
        setShowResults(true);
        setQueryKey((k) => k + 1);
    };

    const handleShuffle = () => {
        setQueryKey((k) => k + 1);
    };

    const getCalories = (recipe: any) => {
        const cal = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories');
        return cal ? Math.round(cal.amount) : null;
    };

    const getProtein = (recipe: any) => {
        const p = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein');
        return p ? Math.round(p.amount) : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">AI Recipe Chef</h1>
                    </div>
                    <p className="text-white/80 text-lg ml-14">Tell us your preferences and we'll find the perfect recipes for you</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Preferences Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20 space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" /> Preferences
                            </h2>

                            {/* Cuisine */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Globe className="w-4 h-4 text-indigo-500" /> Cuisine
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCuisine(c)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${cuisine === c ? 'bg-indigo-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Leaf className="w-4 h-4 text-green-500" /> Dietary
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY.map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => setDietary(d.value)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${dietary === d.value ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 text-blue-500" /> Max Cook Time
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TIMES.map((t) => (
                                        <button
                                            key={t.value}
                                            onClick={() => setMaxTime(t.value)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${maxTime === t.value ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Finding Recipes...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Get AI Suggestions</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2">
                        {!showResults ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-6 flex items-center justify-center">
                                    <ChefHat className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to discover recipes?</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Set your preferences on the left and click "Get AI Suggestions" to find recipes tailored just for you.</p>
                            </div>
                        ) : loading ? (
                            <div className="grid sm:grid-cols-2 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl animate-pulse overflow-hidden shadow-sm">
                                        <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recipes.length === 0 ? (
                            <div className="text-center py-16">
                                <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No recipes match your criteria. Try broader preferences.</p>
                                <button
                                    onClick={() => { setCuisine('Any'); setDietary(''); setMaxTime(0); }}
                                    className="text-purple-500 hover:text-purple-600 font-medium"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {recipes.length} Recipes Found
                                    </h2>
                                    <button
                                        onClick={handleShuffle}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                                    >
                                        <Shuffle className="w-4 h-4" /> Shuffle
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {recipes.map((recipe: any) => (
                                        <Link
                                            key={recipe.id}
                                            to={`/recipes/${recipe.id}`}
                                            className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={recipe.image}
                                                    alt={recipe.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                {/* Diet badges */}
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                                    {recipe.vegan && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegan</span>}
                                                    {!recipe.vegan && recipe.vegetarian && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegetarian</span>}
                                                    {recipe.glutenFree && <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">GF</span>}
                                                </div>
                                                {/* Health score */}
                                                {recipe.healthScore > 0 && (
                                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                        <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                                        <span className="text-xs font-bold text-gray-800 dark:text-white">{recipe.healthScore}</span>
                                                    </div>
                                                )}
                                                {/* Time */}
                                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full px-2.5 py-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs font-medium">{recipe.readyInMinutes} min</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors mb-2 line-clamp-2">
                                                    {recipe.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                    {getCalories(recipe) && (
                                                        <span className="flex items-center gap-1">
                                                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                                                            {getCalories(recipe)} cal
                                                        </span>
                                                    )}
                                                    {getProtein(recipe) && (
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 text-blue-500" />
                                                            {getProtein(recipe)}g protein
                                                        </span>
                                                    )}
                                                    {recipe.servings && (
                                                        <span>{recipe.servings} servings</span>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center text-purple-500 text-sm font-medium group-hover:gap-2 transition-all">
                                                    View Recipe <ArrowRight className="w-4 h-4 ml-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISuggestionsPage;
