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

// Spoonacular types
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  sourceName?: string;
  summary?: string;
  instructions?: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  healthScore: number;
  spoonacularScore?: number;
  pricePerServing?: number;
  cheap?: boolean;
  dairyFree: boolean;
  glutenFree: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  sustainable?: boolean;
  lowFodmap?: boolean;
  weightWatcherSmartPoints?: number;
  gaps?: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  aggregateLikes?: number;
  creditsText?: string;
  license?: string;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: AnalyzedInstruction[];
  nutrition?: SpoonacularNutrition;
}

export interface SpoonacularIngredient {
  id: number;
  aisle: string;
  image: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  measures?: {
    us: { amount: number; unitShort: string; unitLong: string };
    metric: { amount: number; unitShort: string; unitLong: string };
  };
}

export interface AnalyzedInstruction {
  name: string;
  steps: InstructionStep[];
}

export interface InstructionStep {
  number: number;
  step: string;
  ingredients: { id: number; name: string; image: string }[];
  equipment: { id: number; name: string; image: string }[];
  length?: { number: number; unit: string };
}

export interface SpoonacularNutrition {
  nutrients: NutrientInfo[];
  properties?: NutrientInfo[];
  flavonoids?: NutrientInfo[];
  ingredients?: any[];
  caloricBreakdown?: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
  weightPerServing?: {
    amount: number;
    unit: string;
  };
}

export interface NutrientInfo {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface SpoonacularSearchResult {
  offset: number;
  number: number;
  results: SpoonacularRecipe[];
  totalResults: number;
}

export interface MealPlanDay {
  meals: {
    id: number;
    title: string;
    imageType: string;
    readyInMinutes: number;
    servings: number;
    sourceUrl: string;
  }[];
  nutrients: {
    calories: number;
    carbohydrates: number;
    fat: number;
    protein: number;
  };
}

export interface SpoonacularAutocomplete {
  id: number;
  title: string;
  imageType: string;
}

export interface IngredientSearchResult {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: { name: string; amount: number; unit: string; image: string }[];
  usedIngredients: { name: string; amount: number; unit: string; image: string }[];
  likes: number;
}

// Spoonacular filter types
export interface SpoonacularFilters {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
  sort?: string;
  sortDirection?: string;
  offset?: number;
  number?: number;
  includeIngredients?: string;
  excludeIngredients?: string;
}
