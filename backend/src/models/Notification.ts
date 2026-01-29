import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'new_review' | 'new_follower' | 'recipe_liked' | 'recipe_saved' | 'made_it';
  recipe?: mongoose.Types.ObjectId;
  review?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['new_review', 'new_follower', 'recipe_liked', 'recipe_saved', 'made_it'],
      required: true,
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Auto-populate sender
notificationSchema.pre(/^find/, function (next) {
  (this as any).populate({ path: 'sender', select: 'name username avatar' });
  (this as any).populate({ path: 'recipe', select: 'title slug' });
  next();
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
