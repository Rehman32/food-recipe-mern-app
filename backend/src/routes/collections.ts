import { Router, Request, Response } from 'express';
import Collection from '../models/Collection';
import Recipe from '../models/Recipe';
import { protect } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import '../types'; // Ensure Express type augmentation is loaded

const router = Router();

/**
 * @route   GET /api/collections
 * @desc    Get current user's collections
 * @access  Private
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    let collections = await Collection.find({ owner: req.user!._id })
      .sort({ isDefault: -1, updatedAt: -1 });

    // Auto-create default collections if none exist
    if (collections.length === 0) {
      const defaults = await Collection.insertMany([
        { owner: req.user!._id, name: 'Saved Recipes', description: 'Your saved recipes', isDefault: true },
        { owner: req.user!._id, name: 'Favorites', description: 'Your favorite recipes', isDefault: true },
      ]);
      collections = defaults;
    }

    res.json({ success: true, data: { collections } });
  })
);

/**
 * @route   GET /api/collections/:id
 * @desc    Get a single collection with populated recipes
 * @access  Public (if public) / Private (if private, owner only)
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const collection = await Collection.findById(req.params.id)
      .populate({
        path: 'recipes',
        populate: { path: 'author', select: 'name username avatar' },
      });

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    // If private, only owner can view
    if (!collection.isPublic) {
      if (!req.user || collection.owner.toString() !== req.user._id.toString()) {
        throw new AppError('This collection is private', 403);
      }
    }

    res.json({ success: true, data: { collection } });
  })
);

/**
 * @route   POST /api/collections
 * @desc    Create a new collection
 * @access  Private
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { name, description, isPublic } = req.body;

    const collection = await Collection.create({
      owner: req.user!._id,
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: { collection },
    });
  })
);

/**
 * @route   PUT /api/collections/:id
 * @desc    Update a collection
 * @access  Private (owner only)
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    let collection = await Collection.findById(req.params.id);

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    const { name, description, isPublic, coverImage } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (coverImage !== undefined) updates.coverImage = coverImage;

    // Can't rename default collections
    if (collection.isDefault && name) {
      throw new AppError('Cannot rename default collections', 400);
    }

    collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Collection updated',
      data: { collection },
    });
  })
);

/**
 * @route   DELETE /api/collections/:id
 * @desc    Delete a collection
 * @access  Private (owner only, non-default)
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (collection.isDefault) {
      throw new AppError('Cannot delete default collections', 400);
    }

    await Collection.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Collection deleted' });
  })
);

/**
 * @route   POST /api/collections/:id/recipes
 * @desc    Add a recipe to a collection
 * @access  Private (owner only)
 */
router.post(
  '/:id/recipes',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    const { recipeId } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }

    if (collection.recipes.some((r) => r.toString() === recipeId)) {
      throw new AppError('Recipe already in this collection', 400);
    }

    collection.recipes.push(recipeId);
    await collection.save();

    res.json({
      success: true,
      message: 'Recipe added to collection',
      data: { collection },
    });
  })
);

/**
 * @route   DELETE /api/collections/:id/recipes/:recipeId
 * @desc    Remove a recipe from a collection
 * @access  Private (owner only)
 */
router.delete(
  '/:id/recipes/:recipeId',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    if (collection.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    collection.recipes = collection.recipes.filter(
      (r) => r.toString() !== req.params.recipeId
    ) as any;
    await collection.save();

    res.json({
      success: true,
      message: 'Recipe removed from collection',
    });
  })
);

export default router;
