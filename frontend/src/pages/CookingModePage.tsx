import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Play, Pause, ChevronLeft, ChevronRight, CheckCircle2,
    Timer, ChefHat, Volume2, VolumeX, SkipForward, Clock,
} from 'lucide-react';
import { recipeApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { cn, formatTime } from '../utils/helpers';

const CookingModePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerTarget, setTimerTarget] = useState(0);
    const [wakeLock, setWakeLock] = useState<any>(null);

    // Fetch recipe
    const { data, isLoading } = useQuery({
        queryKey: ['recipe', slug],
        queryFn: () => recipeApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const recipe = data?.data?.recipe;
    const instructions = recipe?.instructions || recipe?.steps || [];
    const steps = instructions.map((inst: any, idx: number) =>
        typeof inst === 'string' ? { step: idx + 1, text: inst } : inst
    );

    // Keep screen awake
    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const lock = await (navigator as any).wakeLock.request('screen');
                    setWakeLock(lock);
                }
            } catch (e) { /* silently fail */ }
        };
        requestWakeLock();
        return () => { if (wakeLock) wakeLock.release(); };
    }, []);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds((s) => {
                    if (s <= 1) {
                        setTimerRunning(false);
                        // Play notification sound
                        try {
                            const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAsLCws');
                            audio.play();
                        } catch (e) { /* ignore */ }
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    const toggleStep = (step: number) => {
        setCompletedSteps((prev) => {
            const next = new Set(prev);
            if (next.has(step)) next.delete(step);
            else next.add(step);
            return next;
        });
    };

    const startTimer = (minutes: number) => {
        setTimerTarget(minutes * 60);
        setTimerSeconds(minutes * 60);
        setTimerRunning(true);
    };

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="min-h-screen bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Recipe not found</h2>
                    <Link to="/recipes"><Button>Browse Recipes</Button></Link>
                </div>
            </div>
        );
    }

    const step = steps[currentStep];
    const progress = steps.length > 0 ? ((completedSteps.size) / steps.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-surface-950 text-white flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
                <Link to={`/recipes/${slug}`} className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Exit
                </Link>
                <div className="text-center">
                    <p className="text-sm text-surface-400">Step {currentStep + 1} of {steps.length}</p>
                    <h2 className="font-semibold text-white truncate max-w-xs">{recipe.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-primary-400">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-surface-800">
                <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                {step && (
                    <>
                        {/* Step number */}
                        <div
                            className={cn(
                                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-8 transition-all cursor-pointer',
                                completedSteps.has(step.step)
                                    ? 'bg-green-500'
                                    : 'bg-primary-500/20 text-primary-400 border-2 border-primary-500'
                            )}
                            onClick={() => toggleStep(step.step)}
                        >
                            {completedSteps.has(step.step) ? <CheckCircle2 className="w-8 h-8" /> : step.step}
                        </div>

                        {/* Step text */}
                        <p className="text-xl md:text-2xl text-center leading-relaxed mb-8 text-surface-200">
                            {step.text}
                        </p>

                        {/* Tips */}
                        {step.tips && (
                            <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl px-6 py-4 mb-6 w-full">
                                <p className="text-primary-300 text-sm">💡 <span className="font-medium">Tip:</span> {step.tips}</p>
                            </div>
                        )}

                        {/* Step timer */}
                        {step.duration && !timerRunning && timerSeconds === 0 && (
                            <button
                                onClick={() => startTimer(step.duration)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 transition-colors mb-6"
                            >
                                <Timer className="w-5 h-5 text-primary-400" />
                                <span>Start {step.duration}-minute timer</span>
                            </button>
                        )}
                    </>
                )}

                {/* Active Timer */}
                {(timerRunning || timerSeconds > 0) && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface-800 border border-surface-700 rounded-2xl px-8 py-4 flex items-center gap-6 shadow-2xl">
                        <div className="text-center">
                            <p className="text-4xl font-mono font-bold text-primary-400">{formatTimer(timerSeconds)}</p>
                            <p className="text-xs text-surface-500 mt-1">
                                {timerSeconds === 0 ? '⏰ Timer complete!' : 'remaining'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                            >
                                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                                className="p-3 rounded-full bg-surface-700 text-surface-300 hover:bg-surface-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Completion state */}
                {completedSteps.size === steps.length && steps.length > 0 && (
                    <div className="text-center mt-8 animate-in fade-in duration-500">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <ChefHat className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Recipe Complete! 🎉</h3>
                        <p className="text-surface-400 mb-6">Great job! You've finished all the steps.</p>
                        <Link to={`/recipes/${slug}`}>
                            <Button>Back to Recipe</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="border-t border-surface-800 px-4 py-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    leftIcon={<ChevronLeft className="w-5 h-5" />}
                >
                    Previous
                </Button>

                {/* Step dots */}
                <div className="flex gap-1.5 overflow-x-auto max-w-[200px]">
                    {steps.map((_: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentStep(idx)}
                            className={cn(
                                'w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all',
                                idx === currentStep
                                    ? 'bg-primary-500 w-6'
                                    : completedSteps.has(idx + 1)
                                        ? 'bg-green-500'
                                        : 'bg-surface-700 hover:bg-surface-600'
                            )}
                        />
                    ))}
                </div>

                <Button
                    variant="ghost"
                    disabled={currentStep >= steps.length - 1}
                    onClick={() => {
                        toggleStep(steps[currentStep].step);
                        setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
                    }}
                >
                    Next <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
            </div>
        </div>
    );
};

// X icon for timer close
const X: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

export default CookingModePage;
