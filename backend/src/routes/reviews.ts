import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Recipe from '../models/Recipe';
import { protect } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { uploadRecipeImages } from '../config/cloudinary';
import { ApiResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/reviews/recipe/:recipeId
 * @desc    Get all reviews for a recipe
 * @access  Public
 */
router.get(
  '/recipe/:recipeId',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'helpful':
        sortOption = { helpful: -1 };
        break;
      case 'rating-high':
        sortOption = { rating: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const recipeObjectId = new mongoose.Types.ObjectId(req.params.recipeId);

    const [reviews, totalItems] = await Promise.all([
      Review.find({ recipe: recipeObjectId })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments({ recipe: recipeObjectId }),
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { recipe: recipeObjectId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  })
);

/**
 * @route   POST /api/reviews
 * @desc    Create a review for a recipe
 * @access  Private
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { recipeId, rating, title, text } = req.body;
    const userId = req.user!._id;

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      author: userId,
      recipe: recipeId,
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this recipe', 400);
    }

    const review = await Review.create({
      author: userId,
      recipe: recipeId,
      rating,
      title,
      text,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  })
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (author only)
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const userId = req.user!._id.toString();
    let review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership - author may be populated or ObjectId
    const authorId = typeof review.author === 'object' && 'id' in review.author
      ? (review.author as any)._id?.toString()
      : review.author.toString();

    if (authorId !== userId) {
      throw new AppError('Not authorized to update this review', 403);
    }

    const { rating, title, text } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, title, text },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review },
    });
  })
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (author only)
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    const authorId = typeof review.author === 'object' && '_id' in review.author
      ? (review.author as any)._id?.toString()
      : review.author.toString();

    if (authorId !== userId && userRole !== 'admin') {
      throw new AppError('Not authorized to delete this review', 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  })
);

/**
 * @route   POST /api/reviews/:id/images
 * @desc    Add "Made This" images to a review
 * @access  Private (author only)
 */
router.post(
  '/:id/images',
  protect,
  uploadRecipeImages.array('images', 5),
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const userId = req.user!._id.toString();
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    const authorId = typeof review.author === 'object' && '_id' in review.author
      ? (review.author as any)._id?.toString()
      : review.author.toString();

    if (authorId !== userId) {
      throw new AppError('Not authorized to update this review', 403);
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('Please upload at least one image', 400);
    }

    const newImages = files.map((file: any) => file.path);

    if (review.images.length + newImages.length > 5) {
      throw new AppError('Cannot have more than 5 images per review', 400);
    }

    review.images.push(...newImages);
    await review.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images: review.images },
    });
  })
);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @access  Private
 */
router.post(
  '/:id/helpful',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const userId = req.user!._id;
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const hasVoted = review.helpful.some(
      (id) => id.toString() === userId.toString()
    );

    if (hasVoted) {
      // Remove helpful vote
      await Review.findByIdAndUpdate(req.params.id, {
        $pull: { helpful: userId },
      });

      res.json({
        success: true,
        message: 'Removed helpful vote',
      });
    } else {
      // Add helpful vote
      await Review.findByIdAndUpdate(req.params.id, {
        $push: { helpful: userId },
      });

      res.json({
        success: true,
        message: 'Marked as helpful',
      });
    }
  })
);

export default router;
