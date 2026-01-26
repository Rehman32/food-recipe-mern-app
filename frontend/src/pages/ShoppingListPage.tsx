import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Check, Printer, ChevronLeft, Package } from 'lucide-react';
import { mealPlanApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/helpers';

const ShoppingListPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const { data, isLoading } = useQuery({
        queryKey: ['shoppingList', id],
        queryFn: () => mealPlanApi.getShoppingList(id!),
        enabled: !!id && !!user,
    });

    const shoppingList = data?.data?.shoppingList || [];
    const planName = data?.data?.planName || 'Meal Plan';

    const toggleItem = (key: string) => {
        setCheckedItems((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const checkedCount = checkedItems.size;
    const totalCount = shoppingList.length;
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

    const handlePrint = () => window.print();

    // Group items by first letter
    const grouped: Record<string, typeof shoppingList> = {};
    shoppingList.forEach((item: any) => {
        const letter = item.item.charAt(0).toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(item);
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Sign in to view shopping lists</h2>
                    <Link to="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 print:bg-white">
            {/* Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 print:border-none">
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <div className="flex items-center gap-2 text-sm text-surface-500 mb-4 print:hidden">
                        <Link to="/meal-planner" className="hover:text-primary-500 flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Meal Planner
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-7 h-7 text-primary-500" />
                            <div>
                                <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Shopping List</h1>
                                <p className="text-surface-600 dark:text-surface-400">{planName}</p>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />} className="print:hidden">Print</Button>
                    </div>

                    {/* Progress */}
                    {totalCount > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-surface-500">{checkedCount} of {totalCount} items</span>
                                <span className="text-sm font-medium text-primary-500">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-4 animate-pulse h-12" />
                        ))}
                    </div>
                ) : shoppingList.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl">
                        <Package className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No items yet</h3>
                        <p className="text-surface-500 mb-4">Add recipes to your meal plan to generate a shopping list</p>
                        <Link to="/meal-planner"><Button>Go to Meal Planner</Button></Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).sort().map(([letter, items]) => (
                            <div key={letter}>
                                <h3 className="text-sm font-bold text-primary-500 mb-2 print:text-black">{letter}</h3>
                                <div className="space-y-1">
                                    {items.map((item: any) => {
                                        const key = `${item.item}_${item.unit}`;
                                        const isChecked = checkedItems.has(key);

                                        return (
                                            <div
                                                key={key}
                                                onClick={() => toggleItem(key)}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all',
                                                    isChecked
                                                        ? 'bg-surface-50 dark:bg-surface-800/50'
                                                        : 'bg-white dark:bg-surface-800 hover:shadow-sm'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                                        isChecked
                                                            ? 'bg-primary-500 border-primary-500'
                                                            : 'border-surface-300 dark:border-surface-600'
                                                    )}
                                                >
                                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span
                                                    className={cn(
                                                        'flex-1 text-surface-900 dark:text-surface-100 transition-all',
                                                        isChecked && 'line-through text-surface-400 dark:text-surface-500'
                                                    )}
                                                >
                                                    {item.item}
                                                </span>
                                                <span className={cn(
                                                    'text-sm text-surface-500 font-medium',
                                                    isChecked && 'line-through text-surface-300 dark:text-surface-600'
                                                )}>
                                                    {item.quantity > 0 && `${item.quantity} ${item.unit}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingListPage;
