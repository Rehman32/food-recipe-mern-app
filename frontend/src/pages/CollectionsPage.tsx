import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderOpen, Lock, Globe } from 'lucide-react';
import { collectionApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

const CollectionsPage: React.FC = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPublic, setNewPublic] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ['myCollections'],
        queryFn: () => collectionApi.getAll(),
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: () => collectionApi.create({ name: newName, description: newDesc, isPublic: newPublic }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myCollections'] });
            setShowCreate(false);
            setNewName('');
            setNewDesc('');
        },
    });

    const collections = data?.data?.collections || [];

    if (!user) {
        return (
            <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Sign in to view your collections</h2>
                    <Link to="/"><Button>Go Home</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Header */}
            <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                <div className="container mx-auto px-4 py-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">My Collections</h1>
                        <p className="text-surface-600 dark:text-surface-400">Organize your favorite recipes</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>New Collection</Button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white dark:bg-surface-800 animate-pulse h-56" />
                        ))}
                    </div>
                ) : collections.length === 0 ? (
                    <div className="text-center py-16">
                        <FolderOpen className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                        <p className="text-lg text-surface-500">No collections yet. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection: any) => (
                            <Link
                                key={collection._id}
                                to={`/collections/${collection._id}`}
                                className="group block rounded-2xl overflow-hidden bg-white dark:bg-surface-800 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-36 bg-gradient-to-br from-primary-400 to-accent-400 relative overflow-hidden">
                                    {collection.coverImage && (
                                        <img src={collection.coverImage} alt="" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {collection.isDefault && (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-white/90 dark:bg-surface-800/90 rounded-full">Default</span>
                                        )}
                                        <span className="p-1.5 rounded-full bg-white/90 dark:bg-surface-800/90">
                                            {collection.isPublic ? <Globe className="w-3.5 h-3.5 text-green-600" /> : <Lock className="w-3.5 h-3.5 text-surface-500" />}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 transition-colors">{collection.name}</h3>
                                    {collection.description && (
                                        <p className="text-sm text-surface-500 mt-1 line-clamp-1">{collection.description}</p>
                                    )}
                                    <p className="text-sm text-surface-400 mt-2">{collection.recipeCount || collection.recipes?.length || 0} recipes</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Collection Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Collection">
                <form
                    onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
                    className="space-y-4"
                >
                    <Input label="Collection Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Quick Weeknight Dinners" required />
                    <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Description</label>
                        <textarea
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="What kind of recipes go here?"
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
                        <span className="text-sm text-surface-700 dark:text-surface-300">Make this collection public</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button type="submit" disabled={!newName.trim() || createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CollectionsPage;
