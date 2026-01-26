import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CalendarDays, Plus, ChefHat, Trash2, ShoppingCart,
    ChevronLeft, ChevronRight, Clock, Utensils, Coffee, Moon, Cookie,
} from 'lucide-react';
import { mealPlanApi, recipeApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/helpers';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = [
    { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-500' },
    { key: 'lunch', label: 'Lunch', icon: Utensils, color: 'text-green-500' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-500' },
    { key: 'snacks', label: 'Snacks', icon: Cookie, color: 'text-pink-500' },
];

function getWeekDates(offset: number = 0) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + offset * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

const MealPlannerPage: React.FC = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [weekOffset, setWeekOffset] = useState(0);
    const [showRecipePicker, setShowRecipePicker] = useState<{ date: string; mealType: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { start, end } = getWeekDates(weekOffset);

    // Fetch current plan
    const { data: planData, isLoading } = useQuery({
        queryKey: ['mealPlan', weekOffset],
        queryFn: () => mealPlanApi.getCurrent(),
        enabled: !!user,
    });

    // Fetch recipes for picker
    const { data: recipesData } = useQuery({
        queryKey: ['recipeSearch', searchQuery],
        queryFn: () => recipeApi.getAll({ q: searchQuery, limit: 12 } as any),
        enabled: showRecipePicker !== null,
    });

    // Create plan
    const createMutation = useMutation({
        mutationFn: () =>
            mealPlanApi.create({
                name: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mealPlan'] }),
    });

    // Update day
    const updateDayMutation = useMutation({
        mutationFn: (data: { planId: string; date: string; mealType: string; recipeId?: string; servings?: number }) =>
            mealPlanApi.updateDay(data.planId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mealPlan'] });
            setShowRecipePicker(null);
        },
    });

    const plan = planData?.data?.plan;
    const recipes = recipesData?.data?.recipes || recipesData?.data?.data || [];

    // Build week display
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });

    const getDayData = (date: Date) => {
        if (!plan?.days) return null;
        const dateStr = date.toISOString().split('T')[0];
        return plan.days.find((d: any) => new Date(d.date).toISOString().split('T')[0] === dateStr);
    };

    const getSlotRecipe = (dayData: any, mealType: string) => {
        if (!dayData) return null;
        if (mealType === 'snacks') return dayData.snacks?.[0]?.recipe || null;
        return dayData[mealType]?.recipe || null;
    };

    const handleAddRecipe = (recipeId: string) => {
        if (!plan || !showRecipePicker) return;
        updateDayMutation.mutate({
            planId: plan._id,
            date: showRecipePicker.date,
            mealType: showRecipePicker.mealType,
            recipeId,
            servings: 2,
        });
    };

    const handleRemoveRecipe = (dateStr: string, mealType: string) => {
        if (!plan) return;
        updateDayMutation.mutate({
            planId: plan._id,
            date: dateStr,
            mealType,
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Sign in to plan meals</h2>
                    <Link to="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CalendarDays className="w-7 h-7 text-primary-500" />
                            <div>
                                <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Meal Planner</h1>
                                <p className="text-surface-600 dark:text-surface-400">Plan your weekly meals and generate shopping lists</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {plan && (
                                <Link to={`/shopping-list/${plan._id}`}>
                                    <Button variant="secondary" leftIcon={<ShoppingCart className="w-4 h-4" />}>Shopping List</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                            {start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h2>
                        {weekOffset !== 0 && (
                            <button onClick={() => setWeekOffset(0)} className="text-sm text-primary-500 hover:text-primary-600">This Week</button>
                        )}
                    </div>
                    <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <ChevronRight className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                    </button>
                </div>

                {/* Create plan prompt */}
                {!isLoading && !plan && (
                    <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl">
                        <CalendarDays className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No meal plan for this week</h3>
                        <p className="text-surface-500 mb-6">Create a meal plan to organize your weekly meals</p>
                        <Button onClick={() => createMutation.mutate()} leftIcon={<Plus className="w-4 h-4" />}>
                            {createMutation.isPending ? 'Creating...' : 'Create Meal Plan'}
                        </Button>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-4 animate-pulse h-64" />
                        ))}
                    </div>
                )}

                {/* Weekly Grid */}
                {plan && (
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        {weekDays.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayData = getDayData(date);
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div
                                    key={dateStr}
                                    className={cn(
                                        'bg-white dark:bg-surface-800 rounded-xl p-4 transition-all',
                                        isToday && 'ring-2 ring-primary-500'
                                    )}
                                >
                                    <div className="text-center mb-3">
                                        <p className="text-xs text-surface-500 uppercase">{DAYS_OF_WEEK[date.getDay()]}</p>
                                        <p className={cn('text-lg font-bold', isToday ? 'text-primary-500' : 'text-surface-900 dark:text-white')}>
                                            {date.getDate()}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {MEAL_TYPES.map(({ key, label, icon: Icon, color }) => {
                                            const recipe = getSlotRecipe(dayData, key);

                                            return (
                                                <div key={key} className="group">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Icon className={cn('w-3 h-3', color)} />
                                                        <span className="text-xs font-medium text-surface-500">{label}</span>
                                                    </div>
                                                    {recipe ? (
                                                        <div className="relative p-2 rounded-lg bg-surface-50 dark:bg-surface-700 group">
                                                            <Link to={`/recipes/${recipe.slug || recipe._id}`}>
                                                                <p className="text-xs font-medium text-surface-900 dark:text-white truncate hover:text-primary-500 transition-colors">
                                                                    {recipe.title}
                                                                </p>
                                                            </Link>
                                                            {recipe.totalTime && (
                                                                <p className="text-[10px] text-surface-400 flex items-center gap-0.5 mt-0.5">
                                                                    <Clock className="w-2.5 h-2.5" />{recipe.totalTime}m
                                                                </p>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemoveRecipe(dateStr, key)}
                                                                className="absolute top-1 right-1 p-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowRecipePicker({ date: dateStr, mealType: key })}
                                                            className="w-full p-2 rounded-lg border border-dashed border-surface-200 dark:border-surface-600 text-surface-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3 mx-auto" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recipe Picker Modal */}
            {showRecipePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRecipePicker(null)}>
                    <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3">Add Recipe</h3>
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                            />
                        </div>
                        <div className="p-4 overflow-y-auto max-h-96 space-y-2">
                            {recipes.length === 0 ? (
                                <p className="text-center py-8 text-surface-500">No recipes found</p>
                            ) : (
                                recipes.map((recipe: any) => (
                                    <button
                                        key={recipe._id}
                                        onClick={() => handleAddRecipe(recipe._id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-left"
                                    >
                                        {recipe.images?.[0]?.url ? (
                                            <img src={recipe.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                                <ChefHat className="w-5 h-5 text-primary-500" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium text-surface-900 dark:text-white truncate">{recipe.title}</p>
                                            <p className="text-xs text-surface-500">{recipe.totalTime}min · {recipe.servings} servings</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlannerPage;
