import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import RecipeGrid from '../components/recipe/RecipeGrid';
import RecipeFilters from '../components/recipe/RecipeFilters';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Recipe, RecipeFilters as IRecipeFilters } from '../types';

const RecipeListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthStore();

    // Filter states from URL params
    const [filters, setFilters] = useState<IRecipeFilters>({
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        cuisine: searchParams.get('cuisine') || '',
        difficulty: (searchParams.get('difficulty') as IRecipeFilters['difficulty']) || undefined,
        sort: (searchParams.get('sort') as IRecipeFilters['sort']) || 'newest',
        page: Number(searchParams.get('page')) || 1,
        limit: 12,
    });

    const [showFilters, setShowFilters] = useState(false);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.category) params.set('category', filters.category);
        if (filters.cuisine) params.set('cuisine', filters.cuisine);
        if (filters.difficulty) params.set('difficulty', filters.difficulty);
        if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
        if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
        setSearchParams(params);
    }, [filters, setSearchParams]);

    // Fetch recipes
    const { data, isLoading, error } = useQuery({
        queryKey: ['recipes', filters],
        queryFn: () => recipeApi.getAll(filters),
    });

    const recipes = data?.data?.data || [];
    const pagination = data?.data?.pagination;

    // Count active filters
    const activeFiltersCount = [
        filters.category,
        filters.cuisine,
        filters.difficulty,
    ].filter(Boolean).length;

    // Filter update handlers
    const updateFilter = (key: keyof IRecipeFilters, value: string | number | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value, // Reset page when other filters change
        }));
    };

    const clearFilters = () => {
        setFilters({
            q: '',
            category: '',
            cuisine: '',
            difficulty: undefined,
            sort: 'newest',
            page: 1,
            limit: 12,
        });
    };

    const handleSaveRecipe = (recipeId: string) => {
        // TODO: Implement save functionality
        console.log('Save recipe:', recipeId);
    };

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
                        Explore Recipes
                    </h1>
                    <p className="text-surface-600 dark:text-surface-400">
                        Discover delicious recipes from around the world
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="mb-8">
                    <RecipeFilters
                        searchQuery={filters.q || ''}
                        onSearchChange={(q) => updateFilter('q', q)}
                        category={filters.category || ''}
                        onCategoryChange={(cat) => updateFilter('category', cat)}
                        cuisine={filters.cuisine || ''}
                        onCuisineChange={(cuisine) => updateFilter('cuisine', cuisine)}
                        difficulty={filters.difficulty || ''}
                        onDifficultyChange={(diff) => updateFilter('difficulty', diff as IRecipeFilters['difficulty'])}
                        sortBy={filters.sort || 'newest'}
                        onSortChange={(sort) => updateFilter('sort', sort)}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        onClearFilters={clearFilters}
                        activeFiltersCount={activeFiltersCount}
                    />
                </div>

                {/* Results count */}
                {pagination && (
                    <p className="text-sm text-surface-500 mb-6">
                        Showing {recipes.length} of {pagination.totalItems} recipes
                    </p>
                )}

                {/* Error state */}
                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">Failed to load recipes</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                )}

                {/* Recipe Grid */}
                <RecipeGrid
                    recipes={recipes}
                    isLoading={isLoading}
                    onSave={user ? handleSaveRecipe : undefined}
                    savedRecipes={user?.savedRecipes?.map((r) => r.toString()) || []}
                    emptyMessage={
                        filters.q || activeFiltersCount > 0
                            ? 'No recipes match your search criteria'
                            : 'No recipes available yet'
                    }
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                        <Button
                            variant="secondary"
                            disabled={!pagination.hasPrev}
                            onClick={() => updateFilter('page', (filters.page || 1) - 1)}
                            leftIcon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Previous
                        </Button>
                        <span className="text-surface-600 dark:text-surface-400">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={!pagination.hasNext}
                            onClick={() => updateFilter('page', (filters.page || 1) + 1)}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeListPage;
