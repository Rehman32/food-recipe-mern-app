import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId;
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Recipe filter types
export interface RecipeFilters {
  q?: string;
  category?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dietary?: string[];
  maxTime?: number;
  minRating?: number;
  ingredients?: string[];
}

// Auth types
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// User preferences
export interface UserPreferences {
  dietary: string[];
  cuisines: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  theme: 'light' | 'dark' | 'system';
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;
