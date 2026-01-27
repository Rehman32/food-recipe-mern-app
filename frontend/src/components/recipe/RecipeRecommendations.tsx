import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, ChefHat, Sparkles } from 'lucide-react';
import { recipeApi } from '../../services/api';
import { cn } from '../../utils/helpers';

interface RecipeRecommendationsProps {
    currentRecipeId?: string;
    category?: string;
    cuisine?: string;
    className?: string;
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
    currentRecipeId,
    category,
    cuisine,
    className,
}) => {
    const { data, isLoading } = useQuery({
        queryKey: ['recommendations', category, cuisine],
        queryFn: () =>
            recipeApi.getAll({
                category: category || undefined,
                cuisine: cuisine || undefined,
                limit: 5,
                sort: 'rating',
            } as any),
    });

    const allRecipes = data?.data?.recipes || data?.data?.data || [];
    const recipes = allRecipes.filter((r: any) => r._id !== currentRecipeId).slice(0, 4);

    if (isLoading) {
        return (
            <div className={cn('space-y-3', className)}>
                <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-1/2 animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-16 h-16 rounded-xl bg-surface-200 dark:bg-surface-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (recipes.length === 0) return null;

    return (
        <div className={cn('', className)}>
            <h3 className="font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary-500" /> You Might Also Like
            </h3>
            <div className="space-y-3">
                {recipes.map((recipe: any) => {
                    const imageUrl = recipe.images?.[0]?.url || recipe.image;
                    const rating = recipe.stats?.avgRating || recipe.stats?.averageRating || 0;

                    return (
                        <Link
                            key={recipe._id}
                            to={`/recipes/${recipe.slug || recipe._id}`}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors group"
                        >
                            {imageUrl ? (
                                <img src={imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                    <ChefHat className="w-6 h-6 text-primary-500" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h4 className="text-sm font-medium text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                                    {recipe.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-surface-400 mt-1">
                                    {rating > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {rating.toFixed(1)}
                                        </span>
                                    )}
                                    {recipe.totalTime && (
                                        <span className="flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" /> {recipe.totalTime}m
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default RecipeRecommendations;
