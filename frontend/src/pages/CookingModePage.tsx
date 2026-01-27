import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    ArrowRight,
    ChefHat,
    Clock,
    Check,
    Maximize,
    Minimize,
    Play,
    Pause,
    RotateCcw,
    Utensils,
    AlertTriangle,
} from 'lucide-react';
import { spoonacularApi } from '../services/api';
import { SpoonacularRecipe, InstructionStep } from '../types';

const CookingModePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timer, setTimer] = useState<number>(0);
    const [timerRunning, setTimerRunning] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['cookingRecipe', id],
        queryFn: () => spoonacularApi.getRecipe(Number(id)),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });

    const recipe: SpoonacularRecipe | null = data?.data || null;
    const steps: InstructionStep[] = recipe?.analyzedInstructions?.[0]?.steps || [];

    // Timer
    useEffect(() => {
        let interval: any;
        if (timerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((t) => {
                    if (t <= 1) {
                        setTimerRunning(false);
                        // Alert or chime
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Timer Done!', { body: 'Your cooking timer has finished.' });
                        }
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timer]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const goToStep = (step: number) => {
        if (step >= 0 && step < steps.length) setCurrentStep(step);
    };

    const markComplete = () => {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const setTimerFromStep = (step: InstructionStep) => {
        if (step.length) {
            const seconds = step.length.unit === 'minutes' ? step.length.number * 60 : step.length.number;
            setTimer(seconds);
            setTimerRunning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (error || !recipe || steps.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">
                        {steps.length === 0 ? 'No cooking instructions available' : 'Recipe not found'}
                    </h2>
                    <Link to={`/recipes/${id}`} className="text-red-400 hover:text-red-300">
                        ← Back to recipe
                    </Link>
                </div>
            </div>
        );
    }

    const currentStepData = steps[currentStep];
    const progress = ((completedSteps.size) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                <Link
                    to={`/recipes/${id}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Exit Cooking Mode
                </Link>
                <h1 className="text-sm font-semibold text-white truncate max-w-md">
                    <ChefHat className="w-4 h-4 inline mr-1" />
                    {recipe.title}
                </h1>
                <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-800">
                <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Step Content (Main) */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 lg:py-12">
                    {/* Step Number */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 ${completedSteps.has(currentStep)
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-br from-red-500 to-pink-600 text-white'
                        }`}>
                        {completedSteps.has(currentStep) ? <Check className="w-8 h-8" /> : currentStepData.number}
                    </div>

                    {/* Step Text */}
                    <p className="text-xl sm:text-2xl text-center max-w-2xl leading-relaxed mb-8">
                        {currentStepData.step}
                    </p>

                    {/* Equipment */}
                    {currentStepData.equipment && currentStepData.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {currentStepData.equipment.map((eq) => (
                                <span key={eq.id} className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                    <Utensils className="w-3 h-3" /> {eq.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Timer (if step has a length) */}
                    {currentStepData.length && (
                        <div className="bg-gray-800 rounded-2xl p-6 mb-6 text-center">
                            <p className="text-sm text-gray-400 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                This step takes ~{currentStepData.length.number} {currentStepData.length.unit}
                            </p>
                            <p className="text-5xl font-mono font-bold text-white mb-4">{formatTime(timer)}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setTimerFromStep(currentStepData)}
                                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 flex items-center gap-1"
                                >
                                    <RotateCcw className="w-4 h-4" /> Set
                                </button>
                                <button
                                    onClick={() => setTimerRunning(!timerRunning)}
                                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1 ${timerRunning
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                        } text-white`}
                                >
                                    {timerRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => goToStep(currentStep - 1)}
                            disabled={currentStep === 0}
                            className="bg-gray-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-30 hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Previous
                        </button>

                        <button
                            onClick={markComplete}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${completedSteps.has(currentStep)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg'
                                }`}
                        >
                            {completedSteps.has(currentStep) ? (
                                <><Check className="w-5 h-5" /> Done</>
                            ) : currentStep === steps.length - 1 ? (
                                <><ChefHat className="w-5 h-5" /> Finish!</>
                            ) : (
                                <><Check className="w-5 h-5" /> Mark Done & Next</>
                            )}
                        </button>

                        <button
                            onClick={() => goToStep(currentStep + 1)}
                            disabled={currentStep === steps.length - 1}
                            className="bg-gray-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-30 hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Step counter */}
                    <p className="text-sm text-gray-500 mt-4">
                        Step {currentStep + 1} of {steps.length} · {completedSteps.size}/{steps.length} completed
                    </p>
                </div>

                {/* Sidebar: Step List + Ingredients */}
                <div className="lg:w-80 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 overflow-y-auto max-h-screen">
                    {/* Ingredients Quick Reference */}
                    {recipe.extendedIngredients && (
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-1">
                                <Utensils className="w-3 h-3" /> Ingredients
                            </h3>
                            <ul className="space-y-1">
                                {recipe.extendedIngredients.map((ing, i) => (
                                    <li key={`${ing.id}-${i}`} className="text-xs text-gray-400">
                                        <span className="text-white font-medium">{ing.measures?.us?.amount} {ing.measures?.us?.unitShort}</span>{' '}
                                        {ing.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Step List */}
                    <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-300 mb-3">All Steps</h3>
                        <div className="space-y-2">
                            {steps.map((step, i) => (
                                <button
                                    key={step.number}
                                    onClick={() => setCurrentStep(i)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${i === currentStep
                                            ? 'bg-indigo-600 text-white'
                                            : completedSteps.has(i)
                                                ? 'bg-green-900/30 text-green-400 border border-green-800'
                                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${completedSteps.has(i) ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                                            }`}>
                                            {completedSteps.has(i) ? '✓' : step.number}
                                        </span>
                                        <span className="line-clamp-2">{step.step}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion Screen */}
            {completedSteps.size === steps.length && steps.length > 0 && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 max-w-md text-center shadow-2xl">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-white mb-2">You did it!</h2>
                        <p className="text-gray-400 mb-6">
                            All {steps.length} steps completed for {recipe.title}. Enjoy your meal!
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link
                                to={`/recipes/${id}`}
                                className="bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors"
                            >
                                Back to Recipe
                            </Link>
                            <Link
                                to="/recipes"
                                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all"
                            >
                                Explore More
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookingModePage;
