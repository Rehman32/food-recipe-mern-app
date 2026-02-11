import { Router, Request, Response } from 'express';
import User from '../models/User';
import Recipe from '../models/Recipe';
import Collection from '../models/Collection';
import { protect, optionalAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { uploadAvatar } from '../config/cloudinary';
import { ApiResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/users/:username/recipes
 * @desc    Get a user's published recipes
 * @access  Public
 */
router.get(
  '/:username/recipes',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new AppError('User not found', 404);

    const recipes = await Recipe.find({ author: user._id, status: 'published' })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { recipes } });
  })
);

/**
 * @route   GET /api/users/:username/collections
 * @desc    Get a user's public collections
 * @access  Public
 */
router.get(
  '/:username/collections',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new AppError('User not found', 404);

    const collections = await Collection.find({ owner: user._id, isPublic: true })
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: { collections } });
  })
);

/**
 * @route   GET /api/users/:username
 * @desc    Get user public profile
 * @access  Public
 */
router.get(
  '/:username',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: user.toPublicProfile(),
      },
    });
  })
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const allowedFields = ['name', 'bio', 'location'];
    const updates: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  })
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences (dietary, cuisines, skill level, theme)
 * @access  Private
 */
router.put(
  '/preferences',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { dietary, cuisines, skillLevel, theme } = req.body;

    const updates: Record<string, any> = {};

    if (dietary !== undefined) {
      updates['preferences.dietary'] = dietary;
    }
    if (cuisines !== undefined) {
      updates['preferences.cuisines'] = cuisines;
    }
    if (skillLevel !== undefined) {
      updates['preferences.skillLevel'] = skillLevel;
    }
    if (theme !== undefined) {
      updates['preferences.theme'] = theme;
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user },
    });
  })
);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  '/avatar',
  protect,
  uploadAvatar.single('avatar'),
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    if (!req.file) {
      throw new AppError('Please upload an image', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { avatar: (req.file as any).path },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user?.avatar,
      },
    });
  })
);

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post(
  '/:id/follow',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    if (targetUserId === currentUserId.toString()) {
      throw new AppError('You cannot follow yourself', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Update follower count for target user
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { 'stats.followers': 1 },
    });

    // Update following count for current user
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { 'stats.following': 1 },
    });

    res.json({
      success: true,
      message: `You are now following ${targetUser.name}`,
    });
  })
);

/**
 * @route   DELETE /api/users/:id/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete(
  '/:id/follow',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const targetUserId = req.params.id;
    const currentUserId = req.user!._id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    // Update follower count for target user
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { 'stats.followers': -1 },
    });

    // Update following count for current user
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { 'stats.following': -1 },
    });

    res.json({
      success: true,
      message: `You have unfollowed ${targetUser.name}`,
    });
  })
);

export default router;
