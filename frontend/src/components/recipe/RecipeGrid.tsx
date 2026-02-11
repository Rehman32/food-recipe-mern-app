import React from 'react';
import { Recipe } from '../../types';
import RecipeCard from './RecipeCard';
import { cn } from '../../utils/helpers';

interface RecipeGridProps {
    recipes: Recipe[];
    variant?: 'default' | 'compact' | 'featured';
    columns?: 2 | 3 | 4;
    showAuthor?: boolean;
    onSave?: (id: string) => void;
    savedRecipes?: string[];
    isLoading?: boolean;
    emptyMessage?: string;
}

const RecipeGrid: React.FC<RecipeGridProps> = ({
    recipes,
    variant = 'default',
    columns = 3,
    showAuthor = true,
    onSave,
    savedRecipes = [],
    isLoading = false,
    emptyMessage = 'No recipes found',
}) => {
    const columnClasses: Record<number, string> = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    if (isLoading) {
        return (
            <div className={cn('grid gap-6', columnClasses[columns])}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-surface-800 animate-pulse">
                        <div className="aspect-[4/3] bg-surface-200 dark:bg-surface-700" />
                        <div className="p-4 space-y-3">
                            <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 mb-4 text-surface-300 dark:text-surface-600">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                </div>
                <p className="text-lg text-surface-500 dark:text-surface-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn('grid gap-6', columnClasses[columns])}>
            {recipes.map((recipe) => (
                <RecipeCard
                    key={recipe._id || recipe.id}
                    recipe={recipe}
                    variant={variant}
                    showAuthor={showAuthor}
                    onSave={onSave}
                    isSaved={savedRecipes.includes(recipe._id)}
                />
            ))}
        </div>
    );
};

export default RecipeGrid;
