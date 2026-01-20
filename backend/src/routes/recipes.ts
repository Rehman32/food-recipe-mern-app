import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Recipe, { IRecipe } from '../models/Recipe';
import User from '../models/User';
import { protect, optionalAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { uploadRecipeImages, deleteImage } from '../config/cloudinary';
import { ApiResponse, RecipeFilters, PaginatedResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes with filtering, sorting, and pagination
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response<ApiResponse<PaginatedResponse<IRecipe>>>) => {
    const {
      q,
      category,
      cuisine,
      difficulty,
      dietary,
      maxTime,
      minRating,
      ingredients,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    const query: any = { status: 'published' };

    // Text search
    if (q) {
      query.$text = { $search: q as string };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Cuisine filter
    if (cuisine) {
      query.cuisine = cuisine;
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Dietary filters (array)
    if (dietary) {
      const dietaryArray = Array.isArray(dietary) ? dietary : [dietary];
      query.dietary = { $all: dietaryArray };
    }

    // Max total time filter
    if (maxTime) {
      query.totalTime = { $lte: Number(maxTime) };
    }

    // Min rating filter
    if (minRating) {
      query['stats.avgRating'] = { $gte: Number(minRating) };
    }

    // Ingredients filter (must contain all specified ingredients)
    if (ingredients) {
      const ingredientArray = Array.isArray(ingredients) ? ingredients : [ingredients];
      query['ingredients.item'] = {
        $all: ingredientArray.map((ing) => new RegExp(ing as string, 'i')),
      };
    }

    // Sorting
    let sortOption: any = {};
    switch (sort) {
      case 'popular':
        sortOption = { 'stats.views': -1 };
        break;
      case 'rating':
        sortOption = { 'stats.avgRating': -1, 'stats.reviewCount': -1 };
        break;
      case 'time':
        sortOption = { totalTime: 1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [recipes, totalItems] = await Promise.all([
      Recipe.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Recipe.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: {
        data: recipes,
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
 * @route   GET /api/recipes/featured
 * @desc    Get featured recipes
 * @access  Public
 */
router.get(
  '/featured',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipes = await Recipe.find({ featured: true, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: { recipes },
    });
  })
);

/**
 * @route   GET /api/recipes/trending
 * @desc    Get trending recipes (most viewed in last 7 days)
 * @access  Public
 */
router.get(
  '/trending',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipes = await Recipe.find({ status: 'published' })
      .sort({ 'stats.views': -1, 'stats.saves': -1 })
      .limit(10);

    res.json({
      success: true,
      data: { recipes },
    });
  })
);

/**
 * @route   GET /api/recipes/categories
 * @desc    Get all categories with counts
 * @access  Public
 */
router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const categories = await Recipe.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: { categories },
    });
  })
);

/**
 * @route   GET /api/recipes/:slug
 * @desc    Get recipe by slug
 * @access  Public
 */
router.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipe = await Recipe.findOne({ 
      slug: req.params.slug,
      status: 'published' 
    });

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Increment view count
    await Recipe.findByIdAndUpdate(recipe._id, {
      $inc: { 'stats.views': 1 },
    });

    res.json({
      success: true,
      data: { recipe },
    });
  })
);

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Private
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipeData = {
      ...req.body,
      author: req.user!._id,
    };

    const recipe = await Recipe.create(recipeData);

    // Update user's recipe count
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { 'stats.recipesSubmitted': 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipe },
    });
  })
);

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe
 * @access  Private (author only)
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Check ownership
    if (recipe.author._id.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      throw new AppError('Not authorized to update this recipe', 403);
    }

    // Fields that can't be updated
    delete req.body.author;
    delete req.body.stats;
    delete req.body.slug;

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: { recipe },
    });
  })
);

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe
 * @access  Private (author only)
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Check ownership
    if (recipe.author._id.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      throw new AppError('Not authorized to delete this recipe', 403);
    }

    // Delete images from Cloudinary
    for (const image of recipe.images) {
      await deleteImage(image.publicId);
    }

    await Recipe.findByIdAndDelete(req.params.id);

    // Update user's recipe count
    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { 'stats.recipesSubmitted': -1 },
    });

    res.json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  })
);

/**
 * @route   POST /api/recipes/:id/images
 * @desc    Upload images to a recipe
 * @access  Private (author only)
 */
router.post(
  '/:id/images',
  protect,
  uploadRecipeImages.array('images', 5),
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Check ownership
    if (recipe.author._id.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized to update this recipe', 403);
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError('Please upload at least one image', 400);
    }

    // Add new images
    const newImages = files.map((file: any, index: number) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: recipe.images.length === 0 && index === 0,
    }));

    recipe.images.push(...newImages);
    await recipe.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images: recipe.images },
    });
  })
);

/**
 * @route   DELETE /api/recipes/:id/images/:imageId
 * @desc    Delete an image from a recipe
 * @access  Private (author only)
 */
router.delete(
  '/:id/images/:publicId',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    // Check ownership
    if (recipe.author._id.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized to update this recipe', 403);
    }

    const imageIndex = recipe.images.findIndex(
      (img) => img.publicId === req.params.publicId
    );

    if (imageIndex === -1) {
      throw new AppError('Image not found', 404);
    }

    // Delete from Cloudinary
    await deleteImage(recipe.images[imageIndex].publicId);

    // Remove from recipe
    recipe.images.splice(imageIndex, 1);

    // If deleted image was primary, make first image primary
    if (recipe.images.length > 0 && !recipe.images.some((img) => img.isPrimary)) {
      recipe.images[0].isPrimary = true;
    }

    await recipe.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: { images: recipe.images },
    });
  })
);

/**
 * @route   POST /api/recipes/:id/save
 * @desc    Save a recipe to user's collection
 * @access  Private
 */
router.post(
  '/:id/save',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    const user = await User.findById(req.user!._id);

    if (user!.savedRecipes.includes(recipe._id)) {
      throw new AppError('Recipe already saved', 400);
    }

    await User.findByIdAndUpdate(req.user!._id, {
      $push: { savedRecipes: recipe._id },
    });

    await Recipe.findByIdAndUpdate(recipe._id, {
      $inc: { 'stats.saves': 1 },
    });

    res.json({
      success: true,
      message: 'Recipe saved successfully',
    });
  })
);

/**
 * @route   DELETE /api/recipes/:id/save
 * @desc    Remove a recipe from saved
 * @access  Private
 */
router.delete(
  '/:id/save',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await User.findByIdAndUpdate(req.user!._id, {
      $pull: { savedRecipes: req.params.id },
    });

    await Recipe.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.saves': -1 },
    });

    res.json({
      success: true,
      message: 'Recipe removed from saved',
    });
  })
);

/**
 * @route   POST /api/recipes/:id/made-it
 * @desc    Mark recipe as made
 * @access  Private
 */
router.post(
  '/:id/made-it',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await Recipe.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.madeIt': 1 },
    });

    await User.findByIdAndUpdate(req.user!._id, {
      $inc: { 'stats.recipesCooked': 1 },
    });

    res.json({
      success: true,
      message: 'Marked as made!',
    });
  })
);

export default router;
