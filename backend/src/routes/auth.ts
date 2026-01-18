import { Router, Request, Response } from 'express';
import passport from 'passport';
import User, { IUser } from '../models/User';
import { protect, generateTokens, verifyRefreshToken } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { ApiResponse, RegisterInput, LoginInput } from '../types';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email/password
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req: Request<{}, ApiResponse, RegisterInput>, res: Response<ApiResponse>) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new AppError('Please provide name, email and password', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Generate username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      username,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          preferences: user.preferences,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req: Request<{}, ApiResponse, LoginInput>, res: Response<ApiResponse>) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user has password (could be OAuth only)
    if (!user.password) {
      throw new AppError('Please login with Google', 400);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          preferences: user.preferences,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and invalidate refresh token
 * @access  Private
 */
router.post(
  '/logout',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const user = await User.findById(req.user!._id).select('+refreshToken');
    
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  })
);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUser;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  })
);

export default router;
