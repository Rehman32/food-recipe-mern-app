import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ChefHat,
    Search,
    Sparkles,
    CalendarDays,
    BookOpen,
    ArrowRight,
    Clock,
    Users,
    TrendingUp,
    Flame,
} from 'lucide-react';
import { recipeApi } from '../services/api';
import { Button } from '../components/ui/Button';
import RecipeGrid from '../components/recipe/RecipeGrid';

const HomePage: React.FC = () => {
    // Fetch featured/recent recipes
    const { data, isLoading } = useQuery({
        queryKey: ['recipes', 'homepage'],
        queryFn: () => recipeApi.getAll({ limit: 6, sort: 'newest' }),
    });

    const recipes = data?.data?.data || data?.data?.recipes || [];

    const features = [
        {
            icon: Sparkles,
            title: 'AI Recipe Suggestions',
            description: 'Get personalized recipe ideas based on your taste, dietary needs, and available time.',
            link: '/ai-suggestions',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Search,
            title: 'Smart Search',
            description: 'Find exactly what you\'re craving with powerful filters for cuisine, difficulty, and more.',
            link: '/search',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: CalendarDays,
            title: 'Meal Planner',
            description: 'Plan your weekly meals, generate shopping lists, and track your nutrition effortlessly.',
            link: '/meal-planner',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: BookOpen,
            title: 'Cooking Mode',
            description: 'Step-by-step guided cooking with built-in timers and a distraction-free experience.',
            link: '/recipes',
            color: 'from-orange-500 to-red-500',
        },
    ];

    const stats = [
        { icon: BookOpen, value: '500+', label: 'Recipes' },
        { icon: Users, value: '1K+', label: 'Community' },
        { icon: TrendingUp, value: '50+', label: 'Cuisines' },
        { icon: Flame, value: '24/7', label: 'Cooking Tips' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Recipe Platform
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display leading-tight">
                            Cook Smarter,
                            <br />
                            <span className="text-white/80">Eat Better</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                            Discover thousands of recipes, plan your meals with AI,
                            and enjoy guided cooking experiences — all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/recipes">
                                <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90 shadow-lg px-8">
                                    Browse Recipes
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/ai-suggestions">
                                <Button size="lg" variant="ghost" className="text-white border-2 border-white/30 hover:bg-white/10 px-8">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Try AI Chef
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-black/10 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat) => (
                                <div key={stat.label} className="flex items-center gap-3 justify-center">
                                    <stat.icon className="w-5 h-5 text-white/70" />
                                    <div>
                                        <p className="text-xl font-bold text-white">{stat.value}</p>
                                        <p className="text-xs text-white/60">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-surface-50 dark:bg-surface-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white mb-4 font-display">
                            Everything You Need to Cook
                        </h2>
                        <p className="text-surface-600 dark:text-surface-400 max-w-lg mx-auto">
                            From discovering recipes to planning meals — our platform has it all.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <Link
                                key={feature.title}
                                to={feature.link}
                                className="group bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-surface-200/50 dark:border-surface-700/50"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Recipes Section */}
            <section className="py-20 bg-white dark:bg-surface-900">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-surface-900 dark:text-white font-display">
                                Latest Recipes
                            </h2>
                            <p className="text-surface-600 dark:text-surface-400 mt-1">
                                Fresh from our community of food lovers
                            </p>
                        </div>
                        <Link to="/recipes">
                            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                View All
                            </Button>
                        </Link>
                    </div>

                    <RecipeGrid
                        recipes={recipes}
                        isLoading={isLoading}
                        emptyMessage="No recipes yet — be the first to share one!"
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-surface-900 to-surface-800 dark:from-surface-950 dark:to-surface-900">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-6">
                        <Clock className="w-4 h-4" />
                        Start cooking in minutes
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                        Ready to Transform Your Kitchen?
                    </h2>
                    <p className="text-surface-400 max-w-lg mx-auto mb-8">
                        Join our community, discover amazing recipes, and let AI help you plan the perfect meal.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/feed">
                            <Button size="lg" className="px-8">
                                Explore the Feed
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link to="/search">
                            <Button size="lg" variant="ghost" className="text-white border-2 border-surface-600 hover:bg-surface-800 px-8">
                                <Search className="w-5 h-5 mr-2" />
                                Smart Search
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
