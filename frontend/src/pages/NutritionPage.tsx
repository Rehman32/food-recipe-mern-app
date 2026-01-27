import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Flame,
    Clock,
    Heart,
    Leaf,
    Star,
    Apple,
    Target,
    BarChart3,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';
import { SpoonacularRecipe } from '../types';

const DIET_OPTIONS = [
    { value: '', label: 'Any Diet', emoji: '🍽️' },
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'ketogenic', label: 'Keto', emoji: '🥑' },
    { value: 'paleo', label: 'Paleo', emoji: '🥩' },
    { value: 'gluten free', label: 'Gluten Free', emoji: '🌾' },
    { value: 'pescetarian', label: 'Pescetarian', emoji: '🐟' },
    { value: 'whole30', label: 'Whole30', emoji: '💪' },
];

const CALORIE_PRESETS = [
    { label: 'Under 300', max: 300, color: 'from-green-400 to-emerald-500' },
    { label: '300-500', min: 300, max: 500, color: 'from-blue-400 to-indigo-500' },
    { label: '500-700', min: 500, max: 700, color: 'from-yellow-400 to-orange-500' },
    { label: '700+', min: 700, color: 'from-orange-400 to-red-500' },
];

const NutritionPage: React.FC = () => {
    const [selectedDiet, setSelectedDiet] = useState('');
    const [calorieRange, setCalorieRange] = useState<{ min?: number; max?: number }>({});
    const [proteinMin, setProteinMin] = useState<number>(0);
    const [maxCalories, setMaxCalories] = useState<number>(800);
    const [searchMode, setSearchMode] = useState<'smart' | 'nutrient'>('smart');

    const { data: smartData, isLoading: smartLoading, isFetching: smartFetching } = useQuery({
        queryKey: ['nutritionSmart', selectedDiet, maxCalories, proteinMin],
        queryFn: () =>
            spoonacularApi.search({
                diet: selectedDiet || undefined,
                maxCalories: maxCalories || undefined,
                minProtein: proteinMin || undefined,
                sort: 'healthiness',
                sortDirection: 'desc',
                number: 12,
            }),
        staleTime: 5 * 60 * 1000,
        enabled: searchMode === 'smart',
    });

    const { data: nutrientData, isLoading: nutrientLoading } = useQuery({
        queryKey: ['nutritionNutrient', calorieRange, proteinMin],
        queryFn: () =>
            spoonacularApi.searchByNutrients({
                ...calorieRange,
                minProtein: proteinMin || undefined,
                number: 12,
            }),
        staleTime: 5 * 60 * 1000,
        enabled: searchMode === 'nutrient' && (!!calorieRange.min || !!calorieRange.max),
    });

    const smartRecipes: SpoonacularRecipe[] = smartData?.data?.results || [];
    const nutrientRecipes = nutrientData?.data || [];
    const isLoading = searchMode === 'smart' ? smartLoading : nutrientLoading;

    const getCalories = (recipe: SpoonacularRecipe) => {
        const cal = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories');
        return cal ? Math.round(cal.amount) : null;
    };

    const getProtein = (recipe: SpoonacularRecipe) => {
        const p = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein');
        return p ? Math.round(p.amount) : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Apple className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">Nutrition Finder</h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Find recipes that fit your nutritional goals. Filter by calories, protein, diet type, and more.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setSearchMode('smart')}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${searchMode === 'smart' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                    >
                        <BarChart3 className="w-4 h-4 inline mr-1" />
                        Smart Filter
                    </button>
                    <button
                        onClick={() => setSearchMode('nutrient')}
                        className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${searchMode === 'nutrient' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                    >
                        <Target className="w-4 h-4 inline mr-1" />
                        By Calories
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-green-500" />
                                Diet Type
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {DIET_OPTIONS.map((diet) => (
                                    <button
                                        key={diet.value}
                                        onClick={() => setSelectedDiet(diet.value)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedDiet === diet.value ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium border-2 border-emerald-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-transparent hover:bg-gray-100'}`}
                                    >
                                        <span className="mr-1">{diet.emoji}</span>
                                        {diet.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" />
                                Max Calories: <span className="text-orange-500">{maxCalories}</span>
                            </h3>
                            <input type="range" min="100" max="1500" step="50" value={maxCalories} onChange={(e) => setMaxCalories(Number(e.target.value))} className="w-full accent-orange-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>100</span><span>750</span><span>1500</span>
                            </div>
                        </div>

                        {searchMode === 'nutrient' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Calorie Ranges</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {CALORIE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setCalorieRange({ min: preset.min, max: preset.max })}
                                            className={`bg-gradient-to-r ${preset.color} text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity ${calorieRange.min === preset.min && calorieRange.max === preset.max ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                        >
                                            {preset.label} cal
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-blue-500" />
                                Min Protein: <span className="text-blue-500">{proteinMin}g</span>
                            </h3>
                            <input type="range" min="0" max="100" step="5" value={proteinMin} onChange={(e) => setProteinMin(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isLoading ? 'Searching...' : (
                                    searchMode === 'smart'
                                        ? `${smartRecipes.length} healthy recipes found`
                                        : `${nutrientRecipes.length} recipes in range`
                                )}
                                {smartFetching && !smartLoading && <Loader2 className="inline w-4 h-4 ml-1 animate-spin" />}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                                        <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {(searchMode === 'smart' ? smartRecipes : nutrientRecipes).map((recipe: any) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            {recipe.vegan && (
                                                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Vegan</span>
                                            )}
                                            <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white rounded-full px-3 py-1 flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                <span className="text-xs font-bold">
                                                    {searchMode === 'nutrient' ? `${recipe.calories || '?'} cal` : `${getCalories(recipe) || '?'} cal`}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-full px-2 py-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-xs">{recipe.readyInMinutes}m</span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-emerald-500 transition-colors">{recipe.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {searchMode === 'nutrient' ? (
                                                    <>
                                                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-blue-500" />{recipe.protein || '?'}g protein</span>
                                                        <span>{recipe.fat || '?'}g fat</span>
                                                        <span>{recipe.carbs || '?'}g carbs</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {getProtein(recipe) && (
                                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-blue-500" />{getProtein(recipe)}g protein</span>
                                                        )}
                                                        {recipe.healthScore > 0 && (
                                                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" />Score: {recipe.healthScore}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!isLoading && searchMode === 'smart' && smartRecipes.length === 0 && (
                            <div className="text-center py-16">
                                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No recipes match your criteria</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your diet or calorie filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionPage;
