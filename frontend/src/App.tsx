import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Legacy pages
import Home from './pages/home';
import RecipeList from './pages/RecipeList';
import RecipeDetails from './components/RecipeDetail';
import AddRecipes from './pages/AddRecipes';
import ContactUs from './pages/ContactUs';

// New pages (Sprint 2 & 3)
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ProfilePage from './pages/ProfilePage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';

// New pages (Sprint 4)
import NotificationsPage from './pages/NotificationsPage';
import ActivityFeedPage from './pages/ActivityFeedPage';

// New pages (Sprint 5)
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';

// Auth callback page for Google OAuth
const AuthCallback: React.FC = () => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            // Store tokens in zustand (will be handled by authStore)
            const authData = { accessToken, refreshToken };
            localStorage.setItem('recipe-platform-auth', JSON.stringify({
                state: {
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                },
            }));
            window.location.href = '/';
        } else {
            window.location.href = '/login?error=auth_failed';
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
    );
};

const App: React.FC = () => {
    const { theme, resolvedTheme } = useThemeStore();

    // Apply theme on mount
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);

    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        {/* New recipe pages (Sprint 2) */}
                        <Route path="/recipes" element={<RecipeListPage />} />
                        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
                        {/* User profile & collections (Sprint 3) */}
                        <Route path="/profile/:username" element={<ProfilePage />} />
                        <Route path="/collections" element={<CollectionsPage />} />
                        <Route path="/collections/:id" element={<CollectionDetailPage />} />
                        {/* Social & engagement (Sprint 4) */}
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/feed" element={<ActivityFeedPage />} />
                        {/* Meal planning (Sprint 5) */}
                        <Route path="/meal-planner" element={<MealPlannerPage />} />
                        <Route path="/shopping-list/:id" element={<ShoppingListPage />} />
                        {/* Legacy routes */}
                        <Route path="/add-recipe" element={<AddRecipes />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
};

export default App;
