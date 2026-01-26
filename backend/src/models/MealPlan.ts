import mongoose, { Document, Schema } from 'mongoose';

export interface IMealSlot {
  recipe: mongoose.Types.ObjectId;
  servings: number;
  notes?: string;
}

export interface IMealDay {
  date: Date;
  breakfast?: IMealSlot;
  lunch?: IMealSlot;
  dinner?: IMealSlot;
  snacks: IMealSlot[];
}

export interface IMealPlan extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  days: IMealDay[];
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mealSlotSchema = new Schema<IMealSlot>(
  {
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    servings: { type: Number, default: 2 },
    notes: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const mealDaySchema = new Schema<IMealDay>(
  {
    date: { type: Date, required: true },
    breakfast: mealSlotSchema,
    lunch: mealSlotSchema,
    dinner: mealSlotSchema,
    snacks: [mealSlotSchema],
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'My Meal Plan',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: [mealDaySchema],
    notes: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
mealPlanSchema.index({ owner: 1, isActive: 1 });
mealPlanSchema.index({ owner: 1, startDate: -1 });

const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);

export default MealPlan;
