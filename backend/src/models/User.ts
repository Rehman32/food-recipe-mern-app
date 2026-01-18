import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User preferences sub-schema interface
export interface IUserPreferences {
  dietary: string[];
  cuisines: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  theme: 'light' | 'dark' | 'system';
}

// User stats sub-schema interface
export interface IUserStats {
  recipesSubmitted: number;
  recipesCooked: number;
  followers: number;
  following: number;
}

// Main User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  googleId?: string;
  preferences: IUserPreferences;
  stats: IUserStats;
  savedRecipes: mongoose.Types.ObjectId[];
  isVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  refreshToken?: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicProfile(): Partial<IUser>;
}

// Static methods interface
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    dietary: {
      type: [String],
      default: [],
      enum: ['vegan', 'vegetarian', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
    },
    cuisines: {
      type: [String],
      default: [],
      enum: ['italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 'french', 'mediterranean', 'american', 'korean', 'vietnamese', 'middle-eastern', 'african', 'caribbean'],
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
  },
  { _id: false }
);

const userStatsSchema = new Schema<IUserStats>(
  {
    recipesSubmitted: { type: Number, default: 0 },
    recipesCooked: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
    stats: {
      type: userStatsSchema,
      default: () => ({}),
    },
    savedRecipes: [{
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Return public profile (hide sensitive data)
userSchema.methods.toPublicProfile = function (): Partial<IUser> {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    avatar: this.avatar,
    bio: this.bio,
    location: this.location,
    stats: this.stats,
    createdAt: this.createdAt,
  };
};

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
