import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  recipe: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  text: string;
  images: string[];
  helpful: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Review must be for a recipe'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 5,
        message: 'Cannot upload more than 5 images',
      },
    },
    helpful: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ recipe: 1, createdAt: -1 });
reviewSchema.index({ author: 1 });
reviewSchema.index({ recipe: 1, author: 1 }, { unique: true }); // One review per user per recipe

// Populate author on find
reviewSchema.pre(/^find/, function (next) {
  (this as any).populate({
    path: 'author',
    select: 'name username avatar',
  });
  next();
});

// Update recipe stats after save
reviewSchema.post('save', async function () {
  await updateRecipeStats(this.recipe);
});

// Update recipe stats after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await updateRecipeStats(doc.recipe);
  }
});

// Helper function to update recipe stats
async function updateRecipeStats(recipeId: mongoose.Types.ObjectId) {
  const Recipe = mongoose.model('Recipe');
  const Review = mongoose.model<IReview>('Review');

  const stats = await Review.aggregate([
    { $match: { recipe: recipeId } },
    {
      $group: {
        _id: '$recipe',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Recipe.findByIdAndUpdate(recipeId, {
      'stats.avgRating': Math.round(stats[0].avgRating * 10) / 10,
      'stats.reviewCount': stats[0].reviewCount,
    });
  } else {
    await Recipe.findByIdAndUpdate(recipeId, {
      'stats.avgRating': 0,
      'stats.reviewCount': 0,
    });
  }
}

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
