import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Clock,
    Users,
    Star,
    ChefHat,
    Bookmark,
    Share2,
    Printer,
    CheckCircle2,
    Timer,
    Flame,
    ChevronLeft,
    Heart,
} from 'lucide-react';
import { recipeApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import ReviewSection from '../components/recipe/ReviewSection';
import NutritionOverview from '../components/recipe/NutritionOverview';
import { cn, formatTime } from '../utils/helpers';
import { Recipe, Ingredient, Instruction } from '../types';

const RecipeDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { user } = useAuthStore();
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [servingsMultiplier, setServingsMultiplier] = useState(1);
    const [isSaved, setIsSaved] = useState(false);

    // Fetch recipe
    const { data, isLoading, error } = useQuery({
        queryKey: ['recipe', slug],
        queryFn: () => recipeApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const recipe: Recipe | undefined = data?.data?.recipe;

    const toggleStep = (step: number) => {
        setCompletedSteps((prev) =>
            prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
        );
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        // TODO: Implement save API call
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: recipe?.title,
                text: recipe?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // TODO: Show toast
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-pulse">
                <div className="h-96 bg-surface-200 dark:bg-surface-800" />
                <div className="container mx-auto px-4 py-8 space-y-4">
                    <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
                </div>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
                        Recipe not found
                    </h2>
                    <Link to="/recipes">
                        <Button>Browse Recipes</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = recipe.images?.[0]?.url || recipe.image || '/placeholder-recipe.jpg';
    const authorName = typeof recipe.author === 'object' ? recipe.author.name : 'Unknown Chef';
    const authorAvatar = typeof recipe.author === 'object' ? recipe.author.avatar : undefined;
    const rating = recipe.stats?.avgRating || 0;
    const reviewCount = recipe.stats?.reviewCount || 0;

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 print:bg-white">
            {/* Hero Image */}
            <div className="relative h-80 md:h-96 lg:h-[28rem] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Back button */}
                <Link
                    to="/recipes"
                    className="absolute top-4 left-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors print:hidden"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                    <button
                        onClick={handleSave}
                        className={cn(
                            'p-2.5 rounded-full backdrop-blur-sm transition-all',
                            isSaved
                                ? 'bg-primary-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        )}
                    >
                        <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                        <Printer className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Meta */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {recipe.category && (
                                    <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full capitalize">
                                        {recipe.category.replace('-', ' ')}
                                    </span>
                                )}
                                {recipe.cuisine && (
                                    <span className="px-3 py-1 text-sm font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-full capitalize">
                                        {recipe.cuisine.replace('-', ' ')}
                                    </span>
                                )}
                                {recipe.difficulty && (
                                    <span
                                        className={cn(
                                            'px-3 py-1 text-sm font-medium rounded-full capitalize',
                                            recipe.difficulty === 'easy' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                            recipe.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                            recipe.difficulty === 'hard' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        )}
                                    >
                                        {recipe.difficulty}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                                {recipe.title || recipe.name}
                            </h1>

                            <p className="text-lg text-surface-600 dark:text-surface-400 mb-6">
                                {recipe.description}
                            </p>

                            {/* Author & Rating */}
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    {authorAvatar ? (
                                        <img
                                            src={authorAvatar}
                                            alt={authorName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                            <ChefHat className="w-5 h-5 text-primary-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-surface-900 dark:text-white">
                                            {authorName}
                                        </p>
                                        <p className="text-sm text-surface-500">Recipe Author</p>
                                    </div>
                                </div>

                                {rating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        'w-5 h-5',
                                                        star <= Math.round(rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-surface-300 dark:text-surface-600'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium text-surface-900 dark:text-white">
                                            {rating.toFixed(1)}
                                        </span>
                                        <span className="text-surface-500">({reviewCount} reviews)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-white dark:bg-surface-800 text-center">
                                <Clock className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                                <p className="text-sm text-surface-500 mb-1">Total Time</p>
                                <p className="font-semibold text-surface-900 dark:text-white">
                                    {formatTime(recipe.totalTime || (recipe.prepTime || 0) + (recipe.cookTime || 0))}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-surface-800 text-center">
                                <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                                <p className="text-sm text-surface-500 mb-1">Servings</p>
                                <p className="font-semibold text-surface-900 dark:text-white">
                                    {recipe.servings * servingsMultiplier}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-surface-800 text-center">
                                <Flame className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                                <p className="text-sm text-surface-500 mb-1">Calories</p>
                                <p className="font-semibold text-surface-900 dark:text-white">
                                    {recipe.nutrition?.calories || '—'}
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
                                Instructions
                            </h2>
                            <div className="space-y-4">
                                {(recipe.instructions || recipe.steps || []).map((instruction, index) => {
                                    const step = typeof instruction === 'string'
                                        ? { step: index + 1, text: instruction }
                                        : instruction;
                                    const isCompleted = completedSteps.includes(step.step);

                                    return (
                                        <div
                                            key={step.step}
                                            className={cn(
                                                'flex gap-4 p-4 rounded-xl transition-colors cursor-pointer',
                                                isCompleted
                                                    ? 'bg-green-50 dark:bg-green-900/20'
                                                    : 'bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700'
                                            )}
                                            onClick={() => toggleStep(step.step)}
                                        >
                                            <div
                                                className={cn(
                                                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                                                    isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                )}
                                            >
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.step}
                                            </div>
                                            <div className="flex-1">
                                                <p
                                                    className={cn(
                                                        'text-surface-700 dark:text-surface-300',
                                                        isCompleted && 'line-through opacity-70'
                                                    )}
                                                >
                                                    {step.text}
                                                </p>
                                                {step.duration && (
                                                    <p className="text-sm text-surface-500 mt-2 flex items-center gap-1">
                                                        <Timer className="w-4 h-4" />
                                                        {formatTime(step.duration)}
                                                    </p>
                                                )}
                                                {step.tips && (
                                                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-2 italic">
                                                        💡 {step.tips}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress indicator */}
                            <div className="mt-6 p-4 rounded-xl bg-white dark:bg-surface-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
                                        Progress
                                    </span>
                                    <span className="text-sm font-medium text-primary-500">
                                        {completedSteps.length} / {(recipe.instructions || recipe.steps || []).length}
                                    </span>
                                </div>
                                <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-300"
                                        style={{
                                            width: `${(completedSteps.length / (recipe.instructions || recipe.steps || []).length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <ReviewSection recipeId={recipe._id} />
                    </div>

                    {/* Sidebar - Ingredients */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                                        Ingredients
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setServingsMultiplier(Math.max(0.5, servingsMultiplier - 0.5))}
                                            className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 flex items-center justify-center"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center font-medium text-surface-900 dark:text-white">
                                            {servingsMultiplier}x
                                        </span>
                                        <button
                                            onClick={() => setServingsMultiplier(servingsMultiplier + 0.5)}
                                            className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {(recipe.ingredients || []).map((ingredient, index) => {
                                        const ing = typeof ingredient === 'string'
                                            ? { item: ingredient, quantity: 1, unit: '' }
                                            : ingredient;

                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 pb-3 border-b border-surface-100 dark:border-surface-700 last:border-0"
                                            >
                                                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-medium text-surface-900 dark:text-white">
                                                        {(ing.quantity * servingsMultiplier).toFixed(ing.quantity % 1 !== 0 ? 1 : 0)} {ing.unit}
                                                    </span>{' '}
                                                    <span className="text-surface-600 dark:text-surface-400">
                                                        {ing.item}
                                                    </span>
                                                    {ing.notes && (
                                                        <p className="text-sm text-surface-500 mt-1">{ing.notes}</p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Dietary tags */}
                                {recipe.dietary && recipe.dietary.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-700">
                                        <p className="text-sm text-surface-500 mb-3">Dietary</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recipe.dietary.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full capitalize"
                                                >
                                                    {tag.replace('-', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nutrition overview */}
                                {recipe.nutrition && (
                                    <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-700">
                                        <NutritionOverview nutrition={recipe.nutrition} servings={recipe.servings} />
                                    </div>
                                )}

                                {/* Made It button */}
                                <Button className="w-full mt-6" leftIcon={<Heart className="w-4 h-4" />}>
                                    I Made This!
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPage;
