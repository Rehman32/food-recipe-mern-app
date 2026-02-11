import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Bookmark, ChefHat } from 'lucide-react';
import { Recipe } from '../../types';
import { cn, formatTime, truncate } from '../../utils/helpers';

interface RecipeCardProps {
    recipe: Recipe;
    variant?: 'default' | 'compact' | 'featured';
    showAuthor?: boolean;
    onSave?: (id: string) => void;
    isSaved?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    variant = 'default',
    showAuthor = true,
    onSave,
    isSaved = false,
}) => {
    const imageUrl = recipe.images?.[0]?.url || recipe.image || '/placeholder-recipe.jpg';
    const authorName = typeof recipe.author === 'object' ? recipe.author.name : 'Unknown Chef';
    const authorAvatar = typeof recipe.author === 'object' ? recipe.author.avatar : undefined;
    const rating = recipe.stats?.avgRating || 0;
    const reviewCount = recipe.stats?.reviewCount || 0;
    const totalTime = recipe.totalTime || (recipe.prepTime || 0) + (recipe.cookTime || 0);

    const difficultyColors: Record<string, string> = {
        easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSave?.(recipe._id);
    };

    if (variant === 'featured') {
        return (
            <Link
                to={`/recipes/${recipe.slug || recipe._id}`}
                className="group relative block overflow-hidden rounded-2xl bg-white dark:bg-surface-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="relative h-72 overflow-hidden">
                    <img src={imageUrl} alt={recipe.title || recipe.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {recipe.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">Featured</div>
                    )}
                    {onSave && (
                        <button onClick={handleSaveClick} className={cn('absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all', isSaved ? 'bg-primary-500 text-white' : 'bg-white/20 text-white hover:bg-white/40')}>
                            <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
                        </button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{recipe.title || recipe.name}</h3>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(totalTime)}</span>
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{recipe.servings} servings</span>
                            {rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{rating.toFixed(1)}</span>}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link to={`/recipes/${recipe.slug || recipe._id}`} className="group flex gap-4 p-3 rounded-xl bg-white dark:bg-surface-800 hover:shadow-md transition-all duration-200">
                <img src={imageUrl} alt={recipe.title || recipe.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-surface-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">{recipe.title || recipe.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTime(totalTime)}</span>
                        {rating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{rating.toFixed(1)}</span>}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link to={`/recipes/${recipe.slug || recipe._id}`} className="group block rounded-2xl overflow-hidden bg-white dark:bg-surface-800 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img src={imageUrl} alt={recipe.title || recipe.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize', difficultyColors[recipe.difficulty || 'medium'])}>{recipe.difficulty || 'Medium'}</span>
                    {onSave && (
                        <button onClick={handleSaveClick} className={cn('p-2 rounded-full backdrop-blur-sm transition-all', isSaved ? 'bg-primary-500 text-white shadow-md' : 'bg-white/80 dark:bg-surface-800/80 text-surface-600 dark:text-surface-300 hover:bg-white dark:hover:bg-surface-700')}>
                            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
                        </button>
                    )}
                </div>
                {recipe.category && (
                    <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 text-xs font-medium bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-full text-surface-700 dark:text-surface-300 capitalize">{recipe.category.replace('-', ' ')}</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-surface-900 dark:text-white line-clamp-2 group-hover:text-primary-500 transition-colors mb-2">{recipe.title || recipe.name}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">{truncate(recipe.description || '', 100)}</p>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-surface-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(totalTime)}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{recipe.servings}</span>
                    </div>
                    {rating > 0 && (
                        <div className="flex items-center gap-1 text-surface-700 dark:text-surface-300">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{rating.toFixed(1)}</span>
                            <span className="text-surface-400">({reviewCount})</span>
                        </div>
                    )}
                </div>
                {showAuthor && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                        {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><ChefHat className="w-4 h-4 text-primary-500" /></div>
                        )}
                        <span className="text-sm text-surface-600 dark:text-surface-400">{authorName}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default RecipeCard;
