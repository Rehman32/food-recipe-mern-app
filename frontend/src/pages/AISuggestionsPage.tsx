import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, ChefHat, Clock, Users, Flame, Shuffle,
    Leaf, Globe, Gauge, ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/helpers';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Chinese', 'French'];
const DIETARY = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Dairy-Free'];
const TIMES = [
    { label: 'Any Time', value: 0 },
    { label: '< 15 min', value: 15 },
    { label: '< 30 min', value: 30 },
    { label: '< 60 min', value: 60 },
];

const AISuggestionsPage: React.FC = () => {
    const [cuisine, setCuisine] = useState('Any');
    const [dietary, setDietary] = useState('None');
    const [maxTime, setMaxTime] = useState(0);
    const [difficulty, setDifficulty] = useState<string>('');
    const [showResults, setShowResults] = useState(false);
    const [queryKey, setQueryKey] = useState(0);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['aiSuggestions', queryKey],
        queryFn: () =>
            recipeApi.getAll({
                cuisine: cuisine !== 'Any' ? cuisine.toLowerCase() : undefined,
                dietary: dietary !== 'None' ? [dietary.toLowerCase()] : undefined,
                maxTime: maxTime > 0 ? maxTime : undefined,
                difficulty: difficulty || undefined,
                limit: 6,
                sort: 'rating',
            } as any),
        enabled: showResults,
    });

    const recipes = data?.data?.recipes || data?.data?.data || [];

    const handleGenerate = () => {
        setShowResults(true);
        setQueryKey((k) => k + 1);
    };

    const handleShuffle = () => {
        setQueryKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                <div className="container mx-auto px-4 py-12 relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">AI Recipe Suggestions</h1>
                    </div>
                    <p className="text-white/80 text-lg ml-14">Tell us your preferences and we'll find the perfect recipes for you</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Preferences Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft sticky top-20 space-y-6">
                            <h2 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-500" /> Preferences
                            </h2>

                            {/* Cuisine */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    <Globe className="w-4 h-4 text-primary-500" /> Cuisine
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCuisine(c)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                cuisine === c
                                                    ? 'bg-primary-500 text-white shadow-sm'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    <Leaf className="w-4 h-4 text-green-500" /> Dietary
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDietary(d)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                dietary === d
                                                    ? 'bg-green-500 text-white shadow-sm'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    <Clock className="w-4 h-4 text-blue-500" /> Max Cook Time
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TIMES.map((t) => (
                                        <button
                                            key={t.value}
                                            onClick={() => setMaxTime(t.value)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                                maxTime === t.value
                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                    <Gauge className="w-4 h-4 text-amber-500" /> Difficulty
                                </label>
                                <div className="flex gap-2">
                                    {['', 'easy', 'medium', 'hard'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
                                                difficulty === d
                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                    : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                            )}
                                        >
                                            {d || 'Any'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full" onClick={handleGenerate} leftIcon={<Sparkles className="w-4 h-4" />}>
                                {isLoading || isFetching ? 'Finding Recipes...' : 'Get Suggestions'}
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2">
                        {!showResults ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mx-auto mb-6 flex items-center justify-center">
                                    <ChefHat className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Ready to discover recipes?</h3>
                                <p className="text-surface-500 max-w-md mx-auto">Set your preferences on the left and click "Get Suggestions" to find recipes tailored just for you.</p>
                            </div>
                        ) : isLoading || isFetching ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-surface-800 rounded-2xl animate-pulse overflow-hidden">
                                        <div className="h-44 bg-surface-200 dark:bg-surface-700" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recipes.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-surface-500 text-lg mb-4">No recipes match your criteria. Try broader preferences.</p>
                                <Button variant="secondary" onClick={() => { setCuisine('Any'); setDietary('None'); setMaxTime(0); setDifficulty(''); }}>
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                                        {recipes.length} Recipes Found
                                    </h2>
                                    <Button variant="ghost" size="sm" onClick={handleShuffle} leftIcon={<Shuffle className="w-4 h-4" />}>
                                        Shuffle
                                    </Button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {recipes.map((recipe: any) => {
                                        const imageUrl = recipe.images?.[0]?.url || recipe.image;
                                        return (
                                            <Link
                                                key={recipe._id}
                                                to={`/recipes/${recipe.slug || recipe._id}`}
                                                className="group bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                            >
                                                <div className="relative h-44 overflow-hidden">
                                                    {imageUrl ? (
                                                        <img src={imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                                                            <ChefHat className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <span className={cn(
                                                            'px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm capitalize',
                                                            recipe.difficulty === 'easy' && 'bg-green-500/90 text-white',
                                                            recipe.difficulty === 'medium' && 'bg-yellow-500/90 text-white',
                                                            recipe.difficulty === 'hard' && 'bg-red-500/90 text-white'
                                                        )}>
                                                            {recipe.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors mb-2 line-clamp-1">
                                                        {recipe.title}
                                                    </h3>
                                                    <p className="text-sm text-surface-500 line-clamp-2 mb-3">{recipe.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-surface-400">
                                                        {recipe.totalTime && (
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{recipe.totalTime}m</span>
                                                        )}
                                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{recipe.servings} serv</span>
                                                        {recipe.nutrition?.calories && (
                                                            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{recipe.nutrition.calories} cal</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center text-primary-500 text-sm font-medium group-hover:gap-2 transition-all">
                                                        View Recipe <ArrowRight className="w-4 h-4 ml-1" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISuggestionsPage;
