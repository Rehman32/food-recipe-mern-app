import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Clock,
    Flame,
    Heart,
    X,
    ChevronLeft,
    ChevronRight,
    Star,
    Loader2,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';
import { SpoonacularRecipe, SpoonacularFilters } from '../types';

const CUISINES = [
    'African', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese',
    'European', 'French', 'German', 'Greek', 'Indian', 'Irish',
    'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American',
    'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'Southern',
    'Spanish', 'Thai', 'Vietnamese',
];

const DIETS = [
    'Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian',
    'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo',
    'Primal', 'Low FODMAP', 'Whole30',
];

const INTOLERANCES = [
    'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood',
    'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat',
];

const MEAL_TYPES = [
    'Main Course', 'Side Dish', 'Dessert', 'Appetizer', 'Salad',
    'Bread', 'Breakfast', 'Soup', 'Beverage', 'Sauce',
    'Marinade', 'Finger Food', 'Snack', 'Drink',
];

const SORT_OPTIONS = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'healthiness', label: 'Healthiest' },
    { value: 'time', label: 'Quickest' },
    { value: 'calories', label: 'Lowest Calories' },
    { value: 'protein', label: 'Highest Protein' },
    { value: 'random', label: 'Random' },
];

const RecipeListPage: React.FC = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SpoonacularFilters>({
        query: '',
        number: 12,
        offset: 0,
        sort: 'popularity',
        sortDirection: 'desc',
    });

    const [searchInput, setSearchInput] = useState('');

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['spoonacularSearch', filters],
        queryFn: () => spoonacularApi.search(filters),
        staleTime: 5 * 60 * 1000,
    });

    const searchResult = data?.data;
    const recipes: SpoonacularRecipe[] = searchResult?.results || [];
    const totalResults = searchResult?.totalResults || 0;
    const currentPage = Math.floor((filters.offset || 0) / (filters.number || 12)) + 1;
    const totalPages = Math.ceil(totalResults / (filters.number || 12));

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setFilters((prev) => ({ ...prev, query: searchInput, offset: 0 }));
    }, [searchInput]);

    const updateFilter = useCallback((key: keyof SpoonacularFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value || undefined, offset: 0 }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({ query: searchInput, number: 12, offset: 0, sort: 'popularity', sortDirection: 'desc' });
    }, [searchInput]);

    const goToPage = useCallback((page: number) => {
        setFilters((prev) => ({ ...prev, offset: (page - 1) * (prev.number || 12) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const getCalories = (recipe: SpoonacularRecipe) => {
        const cal = recipe.nutrition?.nutrients?.find((n) => n.name === 'Calories');
        return cal ? Math.round(cal.amount) : null;
    };

    const getProtein = (recipe: SpoonacularRecipe) => {
        const p = recipe.nutrition?.nutrients?.find((n) => n.name === 'Protein');
        return p ? Math.round(p.amount) : null;
    };

    const activeFilterCount = [
        filters.cuisine, filters.diet, filters.intolerances, filters.type,
        filters.maxReadyTime, filters.maxCalories,
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-4">Explore Recipes</h1>
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search 500K+ recipes..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                        <button type="submit" className="bg-white text-red-600 px-6 rounded-xl font-semibold hover:bg-yellow-50 transition-colors">Search</button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative bg-white/10 backdrop-blur-sm border border-white/20 px-4 rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
                            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuisine</label>
                                <select value={filters.cuisine || ''} onChange={(e) => updateFilter('cuisine', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <option value="">All Cuisines</option>
                                    {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diet</label>
                                <select value={filters.diet || ''} onChange={(e) => updateFilter('diet', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <option value="">Any Diet</option>
                                    {DIETS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intolerances</label>
                                <select value={filters.intolerances || ''} onChange={(e) => updateFilter('intolerances', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <option value="">None</option>
                                    {INTOLERANCES.map((i) => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                                <select value={filters.type || ''} onChange={(e) => updateFilter('type', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    <option value="">All Types</option>
                                    {MEAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Cook Time: {filters.maxReadyTime ? `${filters.maxReadyTime} min` : 'Any'}</label>
                                <input type="range" min="0" max="120" step="5" value={filters.maxReadyTime || 0} onChange={(e) => updateFilter('maxReadyTime', Number(e.target.value) || undefined)} className="w-full accent-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Calories: {filters.maxCalories ? filters.maxCalories : 'Any'}</label>
                                <input type="range" min="0" max="1500" step="50" value={filters.maxCalories || 0} onChange={(e) => updateFilter('maxCalories', Number(e.target.value) || undefined)} className="w-full accent-orange-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                                <select value={filters.sort || 'popularity'} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {filters.cuisine && (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                                        {filters.cuisine}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('cuisine', '')} />
                                    </span>
                                )}
                                {filters.diet && (
                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                                        {filters.diet}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('diet', '')} />
                                    </span>
                                )}
                                {filters.intolerances && (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-1 rounded-full">
                                        No {filters.intolerances}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('intolerances', '')} />
                                    </span>
                                )}
                                {filters.type && (
                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
                                        {filters.type}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('type', '')} />
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {totalResults > 0 ? (
                            <>Showing <strong>{(filters.offset || 0) + 1}-{Math.min((filters.offset || 0) + (filters.number || 12), totalResults)}</strong> of <strong>{totalResults.toLocaleString()}</strong> recipes</>
                        ) : isLoading ? 'Searching...' : 'No recipes found'}
                        {isFetching && !isLoading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                <div className="h-52 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    <div className="flex gap-2">
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recipes found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or search query</p>
                        <button onClick={clearFilters} className="text-red-500 hover:text-red-600 font-medium">Clear all filters</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recipes.map((recipe) => (
                                <Link
                                    key={recipe.id}
                                    to={`/recipes/${recipe.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative h-52 overflow-hidden">
                                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                            {recipe.vegan && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegan</span>}
                                            {!recipe.vegan && recipe.vegetarian && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegetarian</span>}
                                            {recipe.glutenFree && <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">GF</span>}
                                            {recipe.dairyFree && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">DF</span>}
                                        </div>
                                        {recipe.healthScore > 0 && (
                                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                                <span className="text-xs font-bold text-gray-800 dark:text-white">{recipe.healthScore}</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white rounded-full px-3 py-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs font-medium">{recipe.readyInMinutes} min</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-3 group-hover:text-red-500 transition-colors">{recipe.title}</h3>
                                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-3">
                                                {getCalories(recipe) && (
                                                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /><span className="font-medium">{getCalories(recipe)}</span> cal</span>
                                                )}
                                                {getProtein(recipe) && (
                                                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-blue-500" /><span className="font-medium">{getProtein(recipe)}g</span> prot</span>
                                                )}
                                            </div>
                                            {recipe.servings && <span className="text-gray-400">{recipe.servings} servings</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${page === currentPage ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeListPage;
