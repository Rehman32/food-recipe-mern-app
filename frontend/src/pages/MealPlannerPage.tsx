import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    CalendarDays,
    Flame,
    Clock,
    Loader2,
    RefreshCw,
    Leaf,
    Target,
    BarChart3,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';

const DIET_OPTIONS = [
    { value: '', label: 'No Restriction' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'ketogenic', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'gluten free', label: 'Gluten Free' },
    { value: 'pescetarian', label: 'Pescetarian' },
];

const MealPlannerPage: React.FC = () => {
    const [targetCalories, setTargetCalories] = useState(2000);
    const [diet, setDiet] = useState('');
    const [exclude, setExclude] = useState('');
    const [timeFrame, setTimeFrame] = useState<'day' | 'week'>('day');
    const [generateKey, setGenerateKey] = useState(0); // used to re-trigger query

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['mealPlan', targetCalories, diet, exclude, timeFrame, generateKey],
        queryFn: () =>
            spoonacularApi.generateMealPlan({
                timeFrame,
                targetCalories,
                diet: diet || undefined,
                exclude: exclude || undefined,
            }),
        staleTime: 0, // Always fresh
    });

    const mealPlan = data?.data;

    const handleRegenerate = () => {
        setGenerateKey((prev) => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 text-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <CalendarDays className="w-8 h-8" />
                        AI Meal Planner
                    </h1>
                    <p className="text-white/80">
                        Generate smart meal plans tailored to your calorie goals and diet preferences
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        {/* Time Frame */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTimeFrame('day')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${timeFrame === 'day'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setTimeFrame('week')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${timeFrame === 'week'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>

                        {/* Calories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Target className="w-3 h-3 inline mr-1" />
                                Target: {targetCalories} cal
                            </label>
                            <input
                                type="range"
                                min="1200"
                                max="3500"
                                step="100"
                                value={targetCalories}
                                onChange={(e) => setTargetCalories(Number(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                        </div>

                        {/* Diet */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Leaf className="w-3 h-3 inline mr-1" /> Diet
                            </label>
                            <select
                                value={diet}
                                onChange={(e) => setDiet(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            >
                                {DIET_OPTIONS.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Exclude */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exclude</label>
                            <input
                                type="text"
                                value={exclude}
                                onChange={(e) => setExclude(e.target.value)}
                                placeholder="e.g., shellfish, olives"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Generate */}
                        <button
                            onClick={handleRegenerate}
                            disabled={isFetching}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isFetching ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Regenerate
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Generating your meal plan...</p>
                    </div>
                )}

                {/* Daily Plan */}
                {!isLoading && mealPlan && timeFrame === 'day' && (
                    <div>
                        {/* Nutrient Summary */}
                        {mealPlan.nutrients && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Calories', value: Math.round(mealPlan.nutrients.calories), unit: 'kcal', color: 'text-orange-500', icon: Flame },
                                    { label: 'Protein', value: Math.round(mealPlan.nutrients.protein), unit: 'g', color: 'text-blue-500', icon: BarChart3 },
                                    { label: 'Carbs', value: Math.round(mealPlan.nutrients.carbohydrates), unit: 'g', color: 'text-green-500', icon: BarChart3 },
                                    { label: 'Fat', value: Math.round(mealPlan.nutrients.fat), unit: 'g', color: 'text-yellow-500', icon: BarChart3 },
                                ].map((n) => (
                                    <div key={n.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                                        <n.icon className={`w-6 h-6 ${n.color} mx-auto mb-1`} />
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{n.value}<span className="text-sm font-normal text-gray-500 ml-0.5">{n.unit}</span></p>
                                        <p className="text-xs text-gray-500">{n.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Meals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {mealPlan.meals?.map((meal: any, i: number) => (
                                <Link
                                    key={meal.id}
                                    to={`/recipes/${meal.id}`}
                                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={`https://img.spoonacular.com/recipes/${meal.id}-556x370.jpg`}
                                            alt={meal.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute top-3 left-3">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${i === 0 ? 'bg-yellow-500 text-yellow-900' :
                                                i === 1 ? 'bg-orange-500 text-white' :
                                                    'bg-indigo-500 text-white'
                                                }`}>
                                                {i === 0 ? '🌅 Breakfast' : i === 1 ? '☀️ Lunch' : '🌙 Dinner'}
                                            </span>
                                        </div>
                                        {meal.readyInMinutes && (
                                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {meal.readyInMinutes}m
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-500 transition-colors">
                                            {meal.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {meal.servings} serving{meal.servings !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekly Plan */}
                {!isLoading && mealPlan && timeFrame === 'week' && mealPlan.week && (
                    <div className="space-y-8">
                        {Object.entries(mealPlan.week).map(([day, dayData]: [string, any]) => (
                            <div key={day}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                                    {day}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        {dayData.nutrients && `${Math.round(dayData.nutrients.calories)} cal`}
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayData.meals?.map((meal: any, i: number) => (
                                        <Link
                                            key={meal.id}
                                            to={`/recipes/${meal.id}`}
                                            className="group flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                                        >
                                            <img
                                                src={`https://img.spoonacular.com/recipes/${meal.id}-240x150.jpg`}
                                                alt={meal.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs font-bold ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-orange-600' : 'text-indigo-600'
                                                    }`}>
                                                    {i === 0 ? 'Breakfast' : i === 1 ? 'Lunch' : 'Dinner'}
                                                </span>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors">
                                                    {meal.title}
                                                </h4>
                                                {meal.readyInMinutes && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {meal.readyInMinutes} min
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPlannerPage;
