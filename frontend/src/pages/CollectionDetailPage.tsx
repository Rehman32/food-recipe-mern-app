import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2, Globe, Lock } from 'lucide-react';
import { collectionApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import RecipeGrid from '../components/recipe/RecipeGrid';
import { Button } from '../components/ui/Button';

const CollectionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['collection', id],
        queryFn: () => collectionApi.getById(id!),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: () => collectionApi.delete(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myCollections'] });
            navigate('/collections');
        },
    });

    const collection = data?.data?.collection;
    const isOwner = user && collection && collection.owner?.toString() === user._id;
    const recipes = collection?.recipes || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
                <div className="h-48 bg-gradient-to-r from-primary-400 to-accent-400 animate-pulse" />
                <div className="container mx-auto px-4 py-8">
                    <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-64 animate-pulse mb-4" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-96 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Collection not found</h2>
                    <Link to="/collections"><Button>Browse Collections</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Hero */}
            <div className="h-48 bg-gradient-to-br from-primary-500 to-accent-500 relative">
                {collection.coverImage && (
                    <img src={collection.coverImage} alt="" className="w-full h-full object-cover absolute inset-0" />
                )}
                <div className="absolute inset-0 bg-black/30" />
                <Link to="/collections" className="absolute top-4 left-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Collection Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">{collection.name}</h1>
                            <span className="p-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
                                {collection.isPublic ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-surface-500" />}
                            </span>
                            {collection.isDefault && (
                                <span className="px-2.5 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">Default</span>
                            )}
                        </div>
                        {collection.description && (
                            <p className="text-surface-600 dark:text-surface-400">{collection.description}</p>
                        )}
                        <p className="text-sm text-surface-500 mt-2">{recipes.length} recipes</p>
                    </div>

                    {isOwner && !collection.isDefault && (
                        <div className="flex gap-2">
                            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => {
                                if (window.confirm('Delete this collection? Recipes will not be deleted.')) {
                                    deleteMutation.mutate();
                                }
                            }}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Recipe Grid */}
                <RecipeGrid
                    recipes={recipes as any}
                    isLoading={false}
                    emptyMessage="No recipes in this collection yet"
                />
            </div>
        </div>
    );
};

export default CollectionDetailPage;
