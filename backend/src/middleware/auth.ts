import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { JwtPayload, ApiResponse } from '../types';

// Extend Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware to protect routes - requires valid JWT token
 */
export const protect = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized - no token provided',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback-secret'
    ) as JwtPayload;

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized - user not found',
      });
      return;
    }

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired - please refresh',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * Optional auth - attaches user if token present, continues if not
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'fallback-secret'
      ) as JwtPayload;

      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Token invalid, continue without user
    next();
  }
};

/**
 * Restrict access to specific roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource',
      });
      return;
    }

    next();
  };
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (user: IUser): { accessToken: string; refreshToken: string } => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as JwtPayload;
  } catch {
    return null;
  }
};
