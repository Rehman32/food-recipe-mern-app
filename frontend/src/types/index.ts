// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  preferences: UserPreferences;
  stats: UserStats;
  savedRecipes: string[];
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  createdAt: string;
}

export interface UserPreferences {
  dietary: string[];
  cuisines: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  theme: 'light' | 'dark' | 'system';
}

export interface UserStats {
  recipesSubmitted: number;
  recipesCooked: number;
  followers: number;
  following: number;
}

// Auth types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Recipe types
export interface Recipe {
  _id: string;
  id?: number; // For backward compatibility
  author: User | string;
  title: string;
  slug: string;
  description: string;
  images: RecipeImage[];
  image?: string; // For backward compatibility
  category: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  dietary: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutrition: Nutrition;
  equipment: string[];
  stats: RecipeStats;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  name?: string;
  steps?: string[];
}

export interface RecipeImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface Ingredient {
  item: string;
  quantity: number;
  unit: string;
  notes?: string;
  group?: string;
}

export interface Instruction {
  step: number;
  text: string;
  duration?: number;
  image?: string;
  tips?: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface RecipeStats {
  views: number;
  saves: number;
  madeIt: number;
  avgRating: number;
  reviewCount: number;
}

// Review types
export interface Review {
  _id: string;
  author: User;
  recipe: string;
  rating: number;
  title: string;
  text: string;
  images: string[];
  helpful: string[];
  createdAt: string;
}

// Collection types
export interface Collection {
  _id: string;
  owner: User | string;
  name: string;
  description: string;
  coverImage: string;
  recipes: Recipe[] | string[];
  isPublic: boolean;
  isDefault: boolean;
  recipeCount?: number;
  createdAt: string;
}

// Notification types
export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: 'new_review' | 'new_follower' | 'recipe_liked' | 'recipe_saved' | 'made_it';
  recipe?: { _id: string; title: string; slug: string };
  review?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
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

// Filter types
export interface RecipeFilters {
  q?: string;
  category?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dietary?: string[];
  maxTime?: number;
  minRating?: number;
  sort?: 'popular' | 'newest' | 'rating' | 'time';
  page?: number;
  limit?: number;
}
