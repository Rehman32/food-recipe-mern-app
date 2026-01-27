import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Search, SlidersHorizontal, X, Star, Clock, ChefHat,
    Flame, TrendingUp, Filter,
} from 'lucide-react';
import { recipeApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { cn, formatTime, debounce } from '../utils/helpers';

const CATEGORIES = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Breakfast', 'Salad', 'Soup', 'Side Dish', 'Beverage', 'Snack'];
const CUISINES = ['All', 'Italian', 'Mexican', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Chinese', 'French'];
const SORT_OPTIONS = [
    { value: 'rating', label: 'Top Rated', icon: Star },
    { value: 'newest', label: 'Newest', icon: TrendingUp },
    { value: 'time', label: 'Quickest', icon: Clock },
    { value: 'popular', label: 'Most Popular', icon: Flame },
];

const SmartSearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [showFilters, setShowFilters] = useState(false);
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'All');
    const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
    const [maxTime, setMaxTime] = useState(Number(searchParams.get('maxTime')) || 0);
    const [page, setPage] = useState(1);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((q: string) => {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (category !== 'All') params.set('category', category);
            if (cuisine !== 'All') params.set('cuisine', cuisine);
            if (difficulty) params.set('difficulty', difficulty);
            if (sort) params.set('sort', sort);
            if (maxTime > 0) params.set('maxTime', String(maxTime));
            setSearchParams(params);
            setPage(1);
        }, 300),
        [category, cuisine, difficulty, sort, maxTime]
    );

    useEffect(() => {
        debouncedSearch(query);
    }, [query, category, cuisine, difficulty, sort, maxTime]);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['smartSearch', query, category, cuisine, difficulty, sort, maxTime, page],
        queryFn: () =>
            recipeApi.getAll({
                q: query || undefined,
                category: category !== 'All' ? category.toLowerCase().replace(' ', '-') : undefined,
                cuisine: cuisine !== 'All' ? cuisine.toLowerCase() : undefined,
                difficulty: difficulty || undefined,
                sort: sort as any,
                maxTime: maxTime > 0 ? maxTime : undefined,
                page,
                limit: 12,
            } as any),
    });

    const recipes = data?.data?.recipes || data?.data?.data || [];
    const pagination = data?.data?.pagination;
    const activeFilters = [category !== 'All', cuisine !== 'All', !!difficulty, maxTime > 0].filter(Boolean).length;

    const clearFilters = () => {
        setCategory('All');
        setCuisine('All');
        setDifficulty('');
        setMaxTime(0);
        setSort('rating');
    };

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Search Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                type="text"
                                placeholder="Search recipes, ingredients, cuisines..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                                autoFocus
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700"
                                >
                                    <X className="w-4 h-4 text-surface-400" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                'p-3 rounded-xl border transition-all relative',
                                showFilters || activeFilters > 0
                                    ? 'bg-primary-500 border-primary-500 text-white'
                                    : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                            )}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            {activeFilters > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {activeFilters}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filter Chips */}
                    {showFilters && (
                        <div className="mt-4 space-y-4 pb-2 animate-in slide-in-from-top duration-200">
                            {/* Sort */}
                            <div>
                                <p className="text-xs font-medium text-surface-500 mb-2">Sort By</p>
                                <div className="flex flex-wrap gap-2">
                                    {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setSort(value)}
                                            className={cn(
                                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                sort === value
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" /> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <p className="text-xs font-medium text-surface-500 mb-2">Category</p>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCategory(c)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                category === c
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cuisine */}
                            <div>
                                <p className="text-xs font-medium text-surface-500 mb-2">Cuisine</p>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCuisine(c)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                cuisine === c
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty & Time */}
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <p className="text-xs font-medium text-surface-500 mb-2">Difficulty</p>
                                    <div className="flex gap-2">
                                        {['', 'easy', 'medium', 'hard'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                                                    difficulty === d
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                                )}
                                            >
                                                {d || 'Any'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-surface-500 mb-2">Max Time</p>
                                    <div className="flex gap-2">
                                        {[0, 15, 30, 60, 120].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setMaxTime(t)}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                    maxTime === t
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                                )}
                                            >
                                                {t === 0 ? 'Any' : `${t}m`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {activeFilters > 0 && (
                                <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" /> Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="container mx-auto px-4 py-8">
                {/* Results count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-surface-500">
                        {isFetching ? 'Searching...' : `${pagination?.totalItems || recipes.length} recipes found`}
                        {query && <span className="text-surface-900 dark:text-white font-medium"> for "{query}"</span>}
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl animate-pulse overflow-hidden">
                                <div className="h-44 bg-surface-200 dark:bg-surface-700" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                                    <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No recipes found</h3>
                        <p className="text-surface-500 mb-4">Try different keywords or adjust your filters</p>
                        <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
                    </div>
                ) : (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recipes.map((recipe: any) => {
                                const imageUrl = recipe.images?.[0]?.url || recipe.image;
                                const rating = recipe.stats?.avgRating || recipe.stats?.averageRating || 0;

                                return (
                                    <Link
                                        key={recipe._id}
                                        to={`/recipes/${recipe.slug || recipe._id}`}
                                        className="group bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                                                    <ChefHat className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                                                </div>
                                            )}
                                            {rating > 0 && (
                                                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm">
                                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {rating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                {recipe.category && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full capitalize">
                                                        {recipe.category.replace('-', ' ')}
                                                    </span>
                                                )}
                                                {recipe.difficulty && (
                                                    <span className={cn(
                                                        'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                                                        recipe.difficulty === 'easy' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                                        recipe.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                                        recipe.difficulty === 'hard' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    )}>
                                                        {recipe.difficulty}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors mb-2 line-clamp-1">
                                                {recipe.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-surface-400">
                                                {recipe.totalTime && (
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(recipe.totalTime)}</span>
                                                )}
                                                {recipe.nutrition?.calories && (
                                                    <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{recipe.nutrition.calories} cal</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 pt-8">
                                <Button variant="secondary" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                                <span className="flex items-center px-4 text-sm text-surface-500">{pagination.currentPage} / {pagination.totalPages}</span>
                                <Button variant="secondary" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SmartSearchPage;
