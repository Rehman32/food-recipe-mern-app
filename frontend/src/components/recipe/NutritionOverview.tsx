import React from 'react';
import { Flame, Droplets, Wheat, Beef } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface NutritionData {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

interface NutritionOverviewProps {
    nutrition: NutritionData;
    servings?: number;
    className?: string;
}

const macros = [
    { key: 'calories', label: 'Calories', unit: 'kcal', icon: Flame, color: 'from-orange-500 to-red-500', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    { key: 'protein', label: 'Protein', unit: 'g', icon: Beef, color: 'from-red-500 to-pink-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    { key: 'carbs', label: 'Carbs', unit: 'g', icon: Wheat, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    { key: 'fat', label: 'Fat', unit: 'g', icon: Droplets, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
];

const micros = [
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'mg' },
];

const NutritionOverview: React.FC<NutritionOverviewProps> = ({ nutrition, servings = 1, className }) => {
    if (!nutrition || Object.values(nutrition).every((v) => !v)) return null;

    // Calculate macro percentages for the donut-style display
    const totalMacroGrams = (nutrition.protein || 0) + (nutrition.carbs || 0) + (nutrition.fat || 0);

    return (
        <div className={cn('space-y-6', className)}>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Nutrition per Serving</h3>

            {/* Main macros */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {macros.map(({ key, label, unit, icon: Icon, bg, text }) => {
                    const value = (nutrition as any)[key] || 0;
                    return (
                        <div key={key} className="bg-white dark:bg-surface-800 rounded-xl p-4 text-center">
                            <div className={cn('w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center', bg)}>
                                <Icon className={cn('w-5 h-5', text)} />
                            </div>
                            <p className="text-2xl font-bold text-surface-900 dark:text-white">{Math.round(value)}</p>
                            <p className="text-xs text-surface-500">{unit}</p>
                            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Macro breakdown bar */}
            {totalMacroGrams > 0 && (
                <div>
                    <p className="text-sm text-surface-500 mb-2">Macro Breakdown</p>
                    <div className="h-3 rounded-full overflow-hidden flex">
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${((nutrition.protein || 0) / totalMacroGrams) * 100}%` }}
                            title={`Protein ${Math.round(((nutrition.protein || 0) / totalMacroGrams) * 100)}%`}
                        />
                        <div
                            className="bg-amber-500 transition-all"
                            style={{ width: `${((nutrition.carbs || 0) / totalMacroGrams) * 100}%` }}
                            title={`Carbs ${Math.round(((nutrition.carbs || 0) / totalMacroGrams) * 100)}%`}
                        />
                        <div
                            className="bg-blue-500 transition-all"
                            style={{ width: `${((nutrition.fat || 0) / totalMacroGrams) * 100}%` }}
                            title={`Fat ${Math.round(((nutrition.fat || 0) / totalMacroGrams) * 100)}%`}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-surface-500 mt-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Protein {Math.round(((nutrition.protein || 0) / totalMacroGrams) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Carbs {Math.round(((nutrition.carbs || 0) / totalMacroGrams) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Fat {Math.round(((nutrition.fat || 0) / totalMacroGrams) * 100)}%</span>
                    </div>
                </div>
            )}

            {/* Micros */}
            {micros.some(({ key }) => (nutrition as any)[key]) && (
                <div className="grid grid-cols-3 gap-3">
                    {micros.map(({ key, label, unit }) => {
                        const value = (nutrition as any)[key];
                        if (!value) return null;
                        return (
                            <div key={key} className="bg-white dark:bg-surface-800 rounded-lg p-3 text-center">
                                <p className="text-lg font-bold text-surface-900 dark:text-white">{Math.round(value)}{unit}</p>
                                <p className="text-xs text-surface-500">{label}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NutritionOverview;
