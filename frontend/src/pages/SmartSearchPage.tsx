import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Clock,
    Flame,
    Heart,
    Loader2,
    Package,
    BarChart3,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';

const SmartSearchPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'ingredients' | 'nutrients'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [nutrientFilters, setNutrientFilters] = useState({
        minCalories: 0,
        maxCalories: 800,
        minProtein: 0,
    });
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const debounceTimer = useRef<any>(null);

    // Debounce search
    useEffect(() => {
        debounceTimer.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(debounceTimer.current);
    }, [searchQuery]);

    // Autocomplete
    const { data: autocompleteData } = useQuery({
        queryKey: ['autocomplete', debouncedQuery],
        queryFn: () => spoonacularApi.autocomplete(debouncedQuery, 8),
        enabled: activeTab === 'search' && debouncedQuery.length >= 2,
        staleTime: 5 * 60 * 1000,
    });

    // Main recipe search
    const [submittedQuery, setSubmittedQuery] = useState('');
    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ['smartSearch', submittedQuery],
        queryFn: () => spoonacularApi.search({
            query: submittedQuery,
            addRecipeInformation: true,
            addRecipeNutrition: true,
            number: 12,
        }),
        enabled: !!submittedQuery,
        staleTime: 5 * 60 * 1000,
    });

    // Ingredient search
    const [submittedIngredients, setSubmittedIngredients] = useState('');
    const { data: ingredientData, isLoading: ingredientLoading } = useQuery({
        queryKey: ['ingredientSearch', submittedIngredients],
        queryFn: () => spoonacularApi.searchByIngredients(submittedIngredients, 12),
        enabled: !!submittedIngredients,
        staleTime: 5 * 60 * 1000,
    });

    // Nutrient search
    const [nutrientSearchTriggered, setNutrientSearchTriggered] = useState(false);
    const { data: nutrientData, isLoading: nutrientLoading } = useQuery({
        queryKey: ['nutrientSearch', nutrientFilters],
        queryFn: () => spoonacularApi.searchByNutrients({
            minCalories: nutrientFilters.minCalories || undefined,
            maxCalories: nutrientFilters.maxCalories || undefined,
            minProtein: nutrientFilters.minProtein || undefined,
            number: 12,
        }),
        enabled: nutrientSearchTriggered,
        staleTime: 5 * 60 * 1000,
    });

    const suggestions = autocompleteData?.data || [];
    const searchResults = searchData?.data?.results || [];
    const ingredientResults = ingredientData?.data || [];
    const nutrientResults = nutrientData?.data || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedQuery(searchQuery);
    };

    const handleSuggestionClick = (title: string) => {
        setSearchQuery(title);
        setSubmittedQuery(title);
    };

    const handleIngredientSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedIngredients(ingredients);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Search className="w-8 h-8" /> Smart Search
                    </h1>
                    <p className="text-white/80">Search by name, ingredients you have, or nutritional targets</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { key: 'search', label: 'Recipe Search', icon: Search },
                        { key: 'ingredients', label: 'By Ingredients', icon: Package },
                        { key: 'nutrients', label: 'By Nutrients', icon: BarChart3 },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.key
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Tab */}
                {activeTab === 'search' && (
                    <div>
                        <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search recipes..."
                                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                            >
                                Search
                            </button>

                            {/* Autocomplete dropdown */}
                            {suggestions.length > 0 && searchQuery.length >= 2 && !submittedQuery && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                    {suggestions.map((s: any) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(s.title)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                            <Search className="w-4 h-4 text-gray-400" />
                                            {s.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </form>

                        {searchLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                                <p className="text-gray-500 mt-2">Searching recipes...</p>
                            </div>
                        )}

                        {!searchLoading && searchResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {searchResults.map((recipe: any) => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        )}

                        {!searchLoading && submittedQuery && searchResults.length === 0 && (
                            <EmptyState message="No recipes found. Try a different search term." />
                        )}
                    </div>
                )}

                {/* Ingredients Tab */}
                {activeTab === 'ingredients' && (
                    <div>
                        <form onSubmit={handleIngredientSearch} className="max-w-2xl mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                What ingredients do you have? (comma-separated)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={ingredients}
                                    onChange={(e) => setIngredients(e.target.value)}
                                    placeholder="chicken, tomato, garlic, onion..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-500 text-white px-6 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                                >
                                    Find
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">We'll find recipes that maximize your ingredients and minimize missing ones.</p>
                        </form>

                        {ingredientLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                            </div>
                        )}

                        {!ingredientLoading && ingredientResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {ingredientResults.map((recipe: any) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            <div className="absolute bottom-3 left-3 flex gap-2">
                                                <span className="bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    ✓ {recipe.usedIngredientCount} used
                                                </span>
                                                {recipe.missedIngredientCount > 0 && (
                                                    <span className="bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        − {recipe.missedIngredientCount} missing
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-500 transition-colors">
                                                {recipe.title}
                                            </h3>
                                            {recipe.missedIngredients?.length > 0 && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Missing: {recipe.missedIngredients.map((m: any) => m.name).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Nutrients Tab */}
                {activeTab === 'nutrients' && (
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xl mb-8 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Set Nutritional Targets</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Calories: {nutrientFilters.minCalories} — {nutrientFilters.maxCalories} kcal
                                    </label>
                                    <div className="flex gap-3 mt-1">
                                        <input type="number" value={nutrientFilters.minCalories} onChange={(e) => setNutrientFilters((p) => ({ ...p, minCalories: Number(e.target.value) }))}
                                            placeholder="Min" className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                                        <input type="number" value={nutrientFilters.maxCalories} onChange={(e) => setNutrientFilters((p) => ({ ...p, maxCalories: Number(e.target.value) }))}
                                            placeholder="Max" className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Min Protein: {nutrientFilters.minProtein}g
                                    </label>
                                    <input type="range" min="0" max="100" step="5" value={nutrientFilters.minProtein}
                                        onChange={(e) => setNutrientFilters((p) => ({ ...p, minProtein: Number(e.target.value) }))}
                                        className="w-full accent-indigo-500 mt-1" />
                                </div>
                            </div>
                            <button
                                onClick={() => setNutrientSearchTriggered(true)}
                                className="mt-4 w-full bg-indigo-500 text-white py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
                            >
                                Find Recipes
                            </button>
                        </div>

                        {nutrientLoading && (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                            </div>
                        )}

                        {!nutrientLoading && nutrientResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {nutrientResults.map((recipe: any) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            <div className="absolute bottom-3 left-3 bg-orange-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <Flame className="w-3 h-3" /> {recipe.calories} cal
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-500 transition-colors mb-2">{recipe.title}</h3>
                                            <div className="flex gap-3 text-xs text-gray-500">
                                                <span>{recipe.protein} protein</span>
                                                <span>{recipe.fat} fat</span>
                                                <span>{recipe.carbs} carbs</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Shared recipe card
const RecipeCard: React.FC<{ recipe: any }> = ({ recipe }) => (
    <Link
        to={`/recipes/${recipe.id}`}
        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
        <div className="relative h-44 overflow-hidden">
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {recipe.readyInMinutes && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {recipe.readyInMinutes}m
                </div>
            )}
            {recipe.healthScore > 0 && (
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    <span className="text-xs font-bold">{recipe.healthScore}</span>
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-500 transition-colors">{recipe.title}</h3>
        </div>
    </Link>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-16">
        <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);

export default SmartSearchPage;
