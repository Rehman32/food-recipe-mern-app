import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Clock,
    Users,
    Flame,
    Heart,
    Leaf,
    ChefHat,
    ArrowLeft,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Star,
    Utensils,
    ShieldCheck,
    AlertTriangle,
    Play,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';
import { SpoonacularRecipe, NutrientInfo } from '../types';

const RecipeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [showAllNutrients, setShowAllNutrients] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const { data, isLoading, error } = useQuery({
        queryKey: ['spoonacularRecipe', id],
        queryFn: () => spoonacularApi.getRecipe(Number(id)),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });

    const { data: similarData } = useQuery({
        queryKey: ['similarRecipes', id],
        queryFn: () => spoonacularApi.getSimilar(Number(id)),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });

    const recipe: SpoonacularRecipe | null = data?.data || null;
    const similarRecipes: any[] = similarData?.data || [];

    const toggleStep = (stepNum: number) => {
        setCompletedSteps((prev) => {
            const next = new Set(prev);
            if (next.has(stepNum)) next.delete(stepNum);
            else next.add(stepNum);
            return next;
        });
    };

    // Nutrition helpers
    const mainNutrients = ['Calories', 'Fat', 'Saturated Fat', 'Carbohydrates', 'Sugar', 'Protein', 'Fiber', 'Sodium', 'Cholesterol'];
    const getMainNutrients = (): NutrientInfo[] => {
        if (!recipe?.nutrition?.nutrients) return [];
        return recipe.nutrition.nutrients.filter((n) => mainNutrients.includes(n.name));
    };
    const getAllNutrients = (): NutrientInfo[] => recipe?.nutrition?.nutrients || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
                        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8" />
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recipe Not Found</h2>
                    <Link to="/recipes" className="text-red-500 hover:text-red-600 font-medium">← Back to Recipes</Link>
                </div>
            </div>
        );
    }

    const caloricBreakdown = recipe.nutrition?.caloricBreakdown;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* ─── Back Button ──────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 pt-6">
                <Link to="/recipes" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Recipes
                </Link>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── Main Content (Left 2 columns) ──────── */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-72 sm:h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{recipe.title}</h1>
                                <div className="flex flex-wrap gap-2">
                                    {recipe.diets?.map((diet) => (
                                        <span key={diet} className="bg-green-500/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <Leaf className="w-3 h-3" />
                                            {diet}
                                        </span>
                                    ))}
                                    {recipe.veryHealthy && (
                                        <span className="bg-emerald-500/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Very Healthy
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.readyInMinutes}</p>
                                <p className="text-xs text-gray-500">Minutes</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.servings}</p>
                                <p className="text-xs text-gray-500">Servings</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.healthScore}</p>
                                <p className="text-xs text-gray-500">Health Score</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{recipe.aggregateLikes}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                            </div>
                        </div>

                        {/* Summary */}
                        {recipe.summary && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About This Recipe</h2>
                                <div
                                    className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: recipe.summary }}
                                />
                            </div>
                        )}

                        {/* Ingredients */}
                        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-orange-500" />
                                    Ingredients ({recipe.extendedIngredients.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {recipe.extendedIngredients.map((ing, i) => (
                                        <div
                                            key={`${ing.id}-${i}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <img
                                                src={`https://img.spoonacular.com/ingredients_100x100/${ing.image}`}
                                                alt={ing.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{ing.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {ing.measures?.us
                                                        ? `${ing.measures.us.amount} ${ing.measures.us.unitShort}`
                                                        : ing.original}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ChefHat className="w-5 h-5 text-purple-500" />
                                        Instructions
                                    </h2>
                                    <Link
                                        to={`/cook/${recipe.id}`}
                                        className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all"
                                    >
                                        <Play className="w-4 h-4" /> Cooking Mode
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {recipe.analyzedInstructions[0].steps.map((step) => (
                                        <div
                                            key={step.number}
                                            onClick={() => toggleStep(step.number)}
                                            className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all border ${completedSteps.has(step.number)
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${completedSteps.has(step.number)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                {completedSteps.has(step.number) ? '✓' : step.number}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${completedSteps.has(step.number)
                                                    ? 'text-gray-500 dark:text-gray-400 line-through'
                                                    : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {step.step}
                                                </p>
                                                {step.equipment && step.equipment.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {step.equipment.map((eq) => (
                                                            <span key={eq.id} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                                {eq.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {step.length && (
                                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {step.length.number} {step.length.unit}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Source */}
                        {recipe.sourceUrl && (
                            <div className="text-center">
                                <a
                                    href={recipe.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Original source: {recipe.sourceName || 'View'}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* ─── Sidebar (Right column) ───────────────── */}
                    <div className="space-y-6">
                        {/* Nutrition Panel */}
                        {recipe.nutrition?.nutrients && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    Nutrition Facts
                                </h3>

                                {/* Caloric Breakdown Donut */}
                                {caloricBreakdown && (
                                    <div className="mb-6">
                                        <div className="flex justify-around text-center mb-3">
                                            <div>
                                                <div className="relative w-16 h-16 mx-auto">
                                                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                                                            strokeDasharray={`${caloricBreakdown.percentProtein} 100`} />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                                                        {Math.round(caloricBreakdown.percentProtein)}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Protein</p>
                                            </div>
                                            <div>
                                                <div className="relative w-16 h-16 mx-auto">
                                                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                                                            strokeDasharray={`${caloricBreakdown.percentFat} 100`} />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                                                        {Math.round(caloricBreakdown.percentFat)}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Fat</p>
                                            </div>
                                            <div>
                                                <div className="relative w-16 h-16 mx-auto">
                                                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3"
                                                            strokeDasharray={`${caloricBreakdown.percentCarbs} 100`} />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                                                        {Math.round(caloricBreakdown.percentCarbs)}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Carbs</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Nutrient Table */}
                                <div className="space-y-1">
                                    {(showAllNutrients ? getAllNutrients() : getMainNutrients()).map((nutrient) => (
                                        <div key={nutrient.name} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{nutrient.name}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {Math.round(nutrient.amount * 10) / 10}{nutrient.unit}
                                                </span>
                                                {nutrient.percentOfDailyNeeds != null && (
                                                    <span className="text-xs text-gray-400 ml-1">
                                                        ({Math.round(nutrient.percentOfDailyNeeds)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowAllNutrients(!showAllNutrients)}
                                    className="flex items-center justify-center gap-1 w-full mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
                                >
                                    {showAllNutrients ? (
                                        <>Show Less <ChevronUp className="w-4 h-4" /></>
                                    ) : (
                                        <>Show All {getAllNutrients().length} Nutrients <ChevronDown className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Diet Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Diet Information</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Vegetarian', value: recipe.vegetarian },
                                    { label: 'Vegan', value: recipe.vegan },
                                    { label: 'Gluten Free', value: recipe.glutenFree },
                                    { label: 'Dairy Free', value: recipe.dairyFree },
                                    { label: 'Very Healthy', value: recipe.veryHealthy },
                                    { label: 'Sustainable', value: recipe.sustainable },
                                    { label: 'Low FODMAP', value: recipe.lowFodmap },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                        <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
                                            {value ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cooking Mode CTA */}
                        <Link
                            to={`/cook/${recipe.id}`}
                            className="block bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-4 text-center shadow-sm hover:from-red-600 hover:to-pink-700 transition-all"
                        >
                            <Play className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-bold">Start Cooking Mode</p>
                            <p className="text-sm text-white/80">Step-by-step guided experience</p>
                        </Link>
                    </div>
                </div>

                {/* ─── Similar Recipes ──────────────────────── */}
                {similarRecipes.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Recipes</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {similarRecipes.map((sr: any) => (
                                <Link
                                    key={sr.id}
                                    to={`/recipes/${sr.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative h-28 overflow-hidden">
                                        <img
                                            src={`https://img.spoonacular.com/recipes/${sr.id}-312x231.jpg`}
                                            alt={sr.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                                            {sr.title}
                                        </h3>
                                        {sr.readyInMinutes && (
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {sr.readyInMinutes} min
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetailPage;
