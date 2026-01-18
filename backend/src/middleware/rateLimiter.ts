import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '../types';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for anonymous users
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?._id?.toString() || req.ip || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting for authenticated users (they get higher limits)
    return !!req.user;
  },
});

// Stricter rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authenticated users (higher limits)
export const authUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window for authenticated users
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?._id?.toString() || req.ip || 'unknown';
  },
});

// Strict rate limiter for AI endpoints (expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour
  message: {
    success: false,
    error: 'AI request limit reached, please try again later',
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?._id?.toString() || req.ip || 'unknown';
  },
});
