import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface FilterOption { value: string; label: string; }

interface RecipeFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    category: string;
    onCategoryChange: (category: string) => void;
    cuisine: string;
    onCuisineChange: (cuisine: string) => void;
    difficulty: string;
    onDifficultyChange: (difficulty: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    onClearFilters: () => void;
    activeFiltersCount: number;
}

const categories: FilterOption[] = [
    { value: '', label: 'All Categories' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main-course', label: 'Main Course' },
    { value: 'side-dish', label: 'Side Dish' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'soup', label: 'Soup' },
    { value: 'salad', label: 'Salad' },
];

const cuisines: FilterOption[] = [
    { value: '', label: 'All Cuisines' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'indian', label: 'Indian' },
    { value: 'thai', label: 'Thai' },
    { value: 'french', label: 'French' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'american', label: 'American' },
    { value: 'korean', label: 'Korean' },
    { value: 'pakistani', label: 'Pakistani' },
    { value: 'middle-eastern', label: 'Middle Eastern' },
];

const difficulties: FilterOption[] = [
    { value: '', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
];

const sortOptions: FilterOption[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'time', label: 'Quickest' },
];

const selectClass = 'px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
    searchQuery, onSearchChange, category, onCategoryChange, cuisine, onCuisineChange,
    difficulty, onDifficultyChange, sortBy, onSortChange, showFilters, onToggleFilters,
    onClearFilters, activeFiltersCount,
}) => (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
                <Input
                    type="search"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    rightIcon={searchQuery ? <button onClick={() => onSearchChange('')}><X className="w-4 h-4" /></button> : undefined}
                />
            </div>
            <div className="flex gap-2">
                <Button variant={showFilters ? 'primary' : 'secondary'} onClick={onToggleFilters} leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
                    Filters{activeFiltersCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">{activeFiltersCount}</span>}
                </Button>
                <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>

        {showFilters && (
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 animate-slide-down">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Category</label>
                        <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className={`w-full ${selectClass}`}>
                            {categories.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Cuisine</label>
                        <select value={cuisine} onChange={(e) => onCuisineChange(e.target.value)} className={`w-full ${selectClass}`}>
                            {cuisines.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Difficulty</label>
                        <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)} className={`w-full ${selectClass}`}>
                            {difficulties.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
                {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                        <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear all filters</Button>
                    </div>
                )}
            </div>
        )}
    </div>
);

export default RecipeFilters;
