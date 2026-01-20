import mongoose, { Document, Schema, Model } from 'mongoose';

// Sub-schema interfaces
export interface IRecipeImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface IIngredient {
  item: string;
  quantity: number;
  unit: string;
  notes?: string;
  group?: string;
}

export interface IInstruction {
  step: number;
  text: string;
  duration?: number;
  image?: string;
  tips?: string;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface IRecipeStats {
  views: number;
  saves: number;
  madeIt: number;
  avgRating: number;
  reviewCount: number;
}

// Main Recipe interface
export interface IRecipe extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  images: IRecipeImage[];
  category: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  dietary: string[];
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  nutrition: INutrition;
  equipment: string[];
  stats: IRecipeStats;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface
export interface IRecipeModel extends Model<IRecipe> {
  findBySlug(slug: string): Promise<IRecipe | null>;
}

// Sub-schemas
const recipeImageSchema = new Schema<IRecipeImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ingredientSchema = new Schema<IIngredient>(
  {
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    notes: { type: String },
    group: { type: String },
  },
  { _id: false }
);

const instructionSchema = new Schema<IInstruction>(
  {
    step: { type: Number, required: true },
    text: { type: String, required: true },
    duration: { type: Number },
    image: { type: String },
    tips: { type: String },
  },
  { _id: false }
);

const nutritionSchema = new Schema<INutrition>(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { _id: false }
);

const recipeStatsSchema = new Schema<IRecipeStats>(
  {
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    madeIt: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { _id: false }
);

// Main Recipe schema
const recipeSchema = new Schema<IRecipe, IRecipeModel>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe must have an author'],
    },
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: {
      type: [recipeImageSchema],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'appetizer', 'main-course', 'side-dish', 'dessert', 'breakfast',
        'lunch', 'dinner', 'snack', 'beverage', 'soup', 'salad', 'bread',
        'sauce', 'marinade', 'other'
      ],
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine is required'],
      enum: [
        'italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai',
        'french', 'mediterranean', 'american', 'korean', 'vietnamese',
        'middle-eastern', 'african', 'caribbean', 'greek', 'spanish',
        'british', 'german', 'pakistani', 'other'
      ],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    dietary: {
      type: [String],
      enum: [
        'vegan', 'vegetarian', 'pescatarian', 'keto', 'paleo',
        'gluten-free', 'dairy-free', 'nut-free', 'low-carb',
        'low-fat', 'high-protein', 'sugar-free', 'halal', 'kosher'
      ],
      default: [],
    },
    prepTime: {
      type: Number,
      required: [true, 'Prep time is required'],
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Cook time is required'],
      min: [0, 'Cook time cannot be negative'],
    },
    totalTime: {
      type: Number,
      default: 0,
    },
    servings: {
      type: Number,
      required: [true, 'Number of servings is required'],
      min: [1, 'Must have at least 1 serving'],
    },
    ingredients: {
      type: [ingredientSchema],
      required: [true, 'At least one ingredient is required'],
      validate: {
        validator: (v: IIngredient[]) => v.length > 0,
        message: 'Recipe must have at least one ingredient',
      },
    },
    instructions: {
      type: [instructionSchema],
      required: [true, 'At least one instruction is required'],
      validate: {
        validator: (v: IInstruction[]) => v.length > 0,
        message: 'Recipe must have at least one instruction',
      },
    },
    nutrition: {
      type: nutritionSchema,
      default: () => ({}),
    },
    equipment: {
      type: [String],
      default: [],
    },
    stats: {
      type: recipeStatsSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
recipeSchema.index({ slug: 1 });
recipeSchema.index({ author: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ status: 1 });
recipeSchema.index({ featured: 1, createdAt: -1 });
recipeSchema.index({ 'stats.avgRating': -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Generate slug before saving
recipeSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for unique slug
    let slug = baseSlug;
    let counter = 1;
    const Recipe = this.constructor as IRecipeModel;

    while (await Recipe.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Calculate total time
  this.totalTime = (this.prepTime || 0) + (this.cookTime || 0);

  next();
});

// Virtual for primary image
recipeSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary?.url || this.images[0]?.url || null;
});

// Static method to find by slug
recipeSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, status: 'published' });
};

// Add populated author in responses
recipeSchema.pre('find', function (next) {
  this.populate({
    path: 'author',
    select: 'name username avatar',
  });
  next();
});

recipeSchema.pre('findOne', function (next) {
  this.populate({
    path: 'author',
    select: 'name username avatar',
  });
  next();
});

const Recipe = mongoose.model<IRecipe, IRecipeModel>('Recipe', recipeSchema);

export default Recipe;
