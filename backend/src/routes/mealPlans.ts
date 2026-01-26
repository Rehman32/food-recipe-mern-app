import { Router, Request, Response } from 'express';
import MealPlan from '../models/MealPlan';
import Recipe from '../models/Recipe';
import { protect } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/meal-plans
 * @desc    Get current user's meal plans
 * @access  Private
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const plans = await MealPlan.find({ owner: req.user!._id })
      .sort({ startDate: -1 })
      .limit(20);

    res.json({ success: true, data: { plans } });
  })
);

/**
 * @route   GET /api/meal-plans/current
 * @desc    Get the current active meal plan
 * @access  Private
 */
router.get(
  '/current',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const now = new Date();
    let plan = await MealPlan.findOne({
      owner: req.user!._id,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).populate({
      path: 'days.breakfast.recipe days.lunch.recipe days.dinner.recipe days.snacks.recipe',
      select: 'title slug images nutrition totalTime servings ingredients',
    });

    res.json({ success: true, data: { plan } });
  })
);

/**
 * @route   GET /api/meal-plans/:id
 * @desc    Get a specific meal plan
 * @access  Private (owner only)
 */
router.get(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const plan = await MealPlan.findById(req.params.id).populate({
      path: 'days.breakfast.recipe days.lunch.recipe days.dinner.recipe days.snacks.recipe',
      select: 'title slug images nutrition totalTime servings ingredients',
    });

    if (!plan) throw new AppError('Meal plan not found', 404);
    if (plan.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    res.json({ success: true, data: { plan } });
  })
);

/**
 * @route   POST /api/meal-plans
 * @desc    Create a new meal plan
 * @access  Private
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { name, startDate, endDate, notes } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate empty days
    const days: any[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push({ date: new Date(current), snacks: [] });
      current.setDate(current.getDate() + 1);
    }

    const plan = await MealPlan.create({
      owner: req.user!._id,
      name: name || 'My Meal Plan',
      startDate: start,
      endDate: end,
      days,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Meal plan created',
      data: { plan },
    });
  })
);

/**
 * @route   PUT /api/meal-plans/:id/day
 * @desc    Update a specific day's meal slot
 * @access  Private
 */
router.put(
  '/:id/day',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { date, mealType, recipeId, servings, notes } = req.body;

    const plan = await MealPlan.findById(req.params.id);
    if (!plan) throw new AppError('Meal plan not found', 404);
    if (plan.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    // Verify recipe exists
    if (recipeId) {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) throw new AppError('Recipe not found', 404);
    }

    const targetDate = new Date(date).toISOString().split('T')[0];
    const day = plan.days.find(
      (d) => new Date(d.date).toISOString().split('T')[0] === targetDate
    );

    if (!day) throw new AppError('Day not found in this meal plan', 404);

    if (mealType === 'snacks') {
      if (recipeId) {
        day.snacks.push({ recipe: recipeId, servings: servings || 1, notes });
      }
    } else if (['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      if (recipeId) {
        (day as any)[mealType] = { recipe: recipeId, servings: servings || 2, notes };
      } else {
        (day as any)[mealType] = undefined; // Clear the slot
      }
    } else {
      throw new AppError('Invalid meal type', 400);
    }

    await plan.save();

    // Re-fetch with populated recipes
    const updated = await MealPlan.findById(plan._id).populate({
      path: 'days.breakfast.recipe days.lunch.recipe days.dinner.recipe days.snacks.recipe',
      select: 'title slug images nutrition totalTime servings ingredients',
    });

    res.json({
      success: true,
      message: 'Meal plan updated',
      data: { plan: updated },
    });
  })
);

/**
 * @route   GET /api/meal-plans/:id/shopping-list
 * @desc    Generate a shopping list from a meal plan
 * @access  Private
 */
router.get(
  '/:id/shopping-list',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const plan = await MealPlan.findById(req.params.id).populate({
      path: 'days.breakfast.recipe days.lunch.recipe days.dinner.recipe days.snacks.recipe',
      select: 'ingredients servings',
    });

    if (!plan) throw new AppError('Meal plan not found', 404);
    if (plan.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    // Aggregate all ingredients across the plan
    const ingredientMap = new Map<string, { item: string; quantity: number; unit: string }>();

    const processSlot = (slot: any) => {
      if (!slot?.recipe?.ingredients) return;
      const recipeServings = slot.recipe.servings || 1;
      const multiplier = (slot.servings || 2) / recipeServings;

      slot.recipe.ingredients.forEach((ing: any) => {
        const key = `${ing.item.toLowerCase()}_${ing.unit?.toLowerCase() || ''}`;
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.quantity += (ing.quantity || 0) * multiplier;
        } else {
          ingredientMap.set(key, {
            item: ing.item,
            quantity: (ing.quantity || 0) * multiplier,
            unit: ing.unit || '',
          });
        }
      });
    };

    plan.days.forEach((day) => {
      processSlot(day.breakfast);
      processSlot(day.lunch);
      processSlot(day.dinner);
      day.snacks.forEach(processSlot);
    });

    const shoppingList = Array.from(ingredientMap.values())
      .sort((a, b) => a.item.localeCompare(b.item))
      .map((item) => ({
        ...item,
        quantity: Math.round(item.quantity * 10) / 10,
      }));

    res.json({
      success: true,
      data: { shoppingList, planName: plan.name },
    });
  })
);

/**
 * @route   DELETE /api/meal-plans/:id
 * @desc    Delete a meal plan
 * @access  Private
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const plan = await MealPlan.findById(req.params.id);
    if (!plan) throw new AppError('Meal plan not found', 404);
    if (plan.owner.toString() !== req.user!._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    await MealPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meal plan deleted' });
  })
);

export default router;
