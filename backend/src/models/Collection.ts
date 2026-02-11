import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  coverImage: string;
  recipes: mongoose.Types.ObjectId[];
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collection must have an owner'],
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    recipes: [{
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    isDefault: {
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

// Indexes
collectionSchema.index({ owner: 1 });
collectionSchema.index({ owner: 1, name: 1 }, { unique: true });
collectionSchema.index({ isPublic: 1, updatedAt: -1 });

// Virtual: recipe count
collectionSchema.virtual('recipeCount').get(function () {
  return this.recipes?.length || 0;
});

// Prevent deletion of default collections
collectionSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc?.isDefault) {
    throw new Error('Cannot delete default collections');
  }
  next();
});

const Collection = mongoose.model<ICollection>('Collection', collectionSchema);

export default Collection;
