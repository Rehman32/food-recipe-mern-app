import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp, Camera, Send, ChefHat } from 'lucide-react';
import { reviewApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';
import { Review } from '../../types';

interface ReviewSectionProps {
    recipeId: string;
}

const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={cn(
                            'w-7 h-7 transition-colors',
                            star <= (hover || value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-surface-300 dark:text-surface-600'
                        )}
                    />
                </button>
            ))}
        </div>
    );
};

const RatingBar: React.FC<{ stars: number; count: number; total: number }> = ({ stars, count, total }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-4 text-right text-surface-500">{stars}</span>
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-surface-400">{count}</span>
        </div>
    );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ recipeId }) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [page, setPage] = useState(1);

    // Fetch reviews
    const { data, isLoading } = useQuery({
        queryKey: ['reviews', recipeId, page],
        queryFn: () => reviewApi.getForRecipe(recipeId, { page, limit: 5 }),
        enabled: !!recipeId,
    });

    const reviews: Review[] = data?.data?.reviews || [];
    const ratingDist = data?.data?.ratingDistribution || [];
    const pagination = data?.data?.pagination;
    const totalReviews = pagination?.totalItems || 0;

    // Submit review
    const submitMutation = useMutation({
        mutationFn: () => reviewApi.create({ recipeId, rating, title, text }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', recipeId] });
            queryClient.invalidateQueries({ queryKey: ['recipe'] });
            setRating(0);
            setTitle('');
            setText('');
        },
    });

    // Helpful vote
    const helpfulMutation = useMutation({
        mutationFn: (reviewId: string) => reviewApi.helpful(reviewId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', recipeId] }),
    });

    const getDistCount = (stars: number) => {
        const found = ratingDist.find((d: any) => d._id === stars);
        return found?.count || 0;
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Reviews {totalReviews > 0 && `(${totalReviews})`}
            </h2>

            {/* Rating Distribution */}
            {totalReviews > 0 && (
                <div className="bg-white dark:bg-surface-800 rounded-xl p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-5xl font-bold text-surface-900 dark:text-white">
                                {(reviews.length > 0 ? ratingDist.reduce((sum: number, d: any) => sum + d._id * d.count, 0) / totalReviews : 0).toFixed(1)}
                            </p>
                            <div className="flex mt-2 mb-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={cn('w-5 h-5', s <= Math.round(ratingDist.reduce((sum: number, d: any) => sum + d._id * d.count, 0) / Math.max(totalReviews, 1)) ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300')} />
                                ))}
                            </div>
                            <p className="text-sm text-surface-500">{totalReviews} reviews</p>
                        </div>
                        <div className="space-y-1.5">
                            {[5, 4, 3, 2, 1].map((s) => (
                                <RatingBar key={s} stars={s} count={getDistCount(s)} total={totalReviews} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Write Review */}
            {user && (
                <div className="bg-white dark:bg-surface-800 rounded-xl p-6">
                    <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Write a Review</h3>
                    <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm text-surface-600 dark:text-surface-400 mb-2">Your Rating</label>
                            <StarInput value={rating} onChange={setRating} />
                        </div>
                        <input
                            type="text"
                            placeholder="Review title (optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <textarea
                            placeholder="Share your experience with this recipe..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={rating === 0 || !text.trim() || submitMutation.isPending} leftIcon={<Send className="w-4 h-4" />}>
                                {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                        {submitMutation.isError && (
                            <p className="text-sm text-red-500">Failed to submit. You may have already reviewed this recipe.</p>
                        )}
                    </form>
                </div>
            )}

            {/* Review List */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-surface-800 rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-full mb-2" />
                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-surface-500">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const authorName = typeof review.author === 'object' ? review.author.name : 'Anonymous';
                        const authorAvatar = typeof review.author === 'object' ? review.author.avatar : undefined;
                        const helpfulCount = review.helpful?.length || 0;
                        const isHelpful = user && review.helpful?.includes(user._id);

                        return (
                            <div key={review._id} className="bg-white dark:bg-surface-800 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {authorAvatar ? (
                                            <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                <ChefHat className="w-5 h-5 text-primary-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-surface-900 dark:text-white">{authorName}</p>
                                            <p className="text-xs text-surface-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={cn('w-4 h-4', s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-surface-300 dark:text-surface-600')} />
                                        ))}
                                    </div>
                                </div>

                                {review.title && (
                                    <h4 className="font-semibold text-surface-900 dark:text-white mb-2">{review.title}</h4>
                                )}
                                <p className="text-surface-600 dark:text-surface-400 mb-4">{review.text}</p>

                                {/* Review images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto">
                                        {review.images.map((img, idx) => (
                                            <img key={idx} src={img} alt="Made this" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                                        ))}
                                    </div>
                                )}

                                {/* Helpful button */}
                                {user && (
                                    <button
                                        onClick={() => helpfulMutation.mutate(review._id)}
                                        className={cn(
                                            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors',
                                            isHelpful
                                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'
                                        )}
                                    >
                                        <ThumbsUp className={cn('w-4 h-4', isHelpful && 'fill-current')} />
                                        Helpful{helpfulCount > 0 && ` (${helpfulCount})`}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button variant="secondary" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                            <span className="flex items-center px-3 text-sm text-surface-500">{pagination.currentPage} / {pagination.totalPages}</span>
                            <Button variant="secondary" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
