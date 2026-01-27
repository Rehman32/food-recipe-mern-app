import { Router, Request, Response } from 'express';
import { spoonacularService } from '../services/spoonacular';

const router = Router();

// ─── Search Recipes ────────────────────────────────────────
// GET /api/spoonacular/search?query=pasta&cuisine=italian&diet=vegetarian...
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      query, cuisine, diet, intolerances, type,
      maxReadyTime, minCalories, maxCalories,
      minProtein, maxProtein, minCarbs, maxCarbs,
      minFat, maxFat, sort, sortDirection,
      offset, number, includeIngredients, excludeIngredients,
    } = req.query;

    const data = await spoonacularService.searchRecipes({
      query: query as string,
      cuisine: cuisine as string,
      diet: diet as string,
      intolerances: intolerances as string,
      type: type as string,
      maxReadyTime: maxReadyTime ? Number(maxReadyTime) : undefined,
      minCalories: minCalories ? Number(minCalories) : undefined,
      maxCalories: maxCalories ? Number(maxCalories) : undefined,
      minProtein: minProtein ? Number(minProtein) : undefined,
      maxProtein: maxProtein ? Number(maxProtein) : undefined,
      minCarbs: minCarbs ? Number(minCarbs) : undefined,
      maxCarbs: maxCarbs ? Number(maxCarbs) : undefined,
      minFat: minFat ? Number(minFat) : undefined,
      maxFat: maxFat ? Number(maxFat) : undefined,
      sort: sort as string,
      sortDirection: sortDirection as string,
      offset: offset ? Number(offset) : undefined,
      number: number ? Number(number) : 12,
      includeIngredients: includeIngredients as string,
      excludeIngredients: excludeIngredients as string,
    });

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Spoonacular search error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to search recipes',
    });
  }
});

// ─── Get Recipe by ID ──────────────────────────────────────
// GET /api/spoonacular/recipe/:id
router.get('/recipe/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await spoonacularService.getRecipeById(id);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Spoonacular recipe error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch recipe',
    });
  }
});

// ─── Get Recipe Nutrition ──────────────────────────────────
// GET /api/spoonacular/recipe/:id/nutrition
router.get('/recipe/:id/nutrition', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await spoonacularService.getRecipeNutrition(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch nutrition data',
    });
  }
});

// ─── Get Similar Recipes ───────────────────────────────────
// GET /api/spoonacular/recipe/:id/similar
router.get('/recipe/:id/similar', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const number = Number(req.query.number) || 6;
    const data = await spoonacularService.getSimilarRecipes(id, number);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch similar recipes',
    });
  }
});

// ─── Get Random Recipes ────────────────────────────────────
// GET /api/spoonacular/random?tags=vegetarian&number=6
router.get('/random', async (req: Request, res: Response) => {
  try {
    const tags = req.query.tags as string;
    const number = Number(req.query.number) || 10;
    const data = await spoonacularService.getRandomRecipes(tags, number);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch random recipes',
    });
  }
});

// ─── Autocomplete Search ───────────────────────────────────
// GET /api/spoonacular/autocomplete?query=chick
router.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const number = Number(req.query.number) || 10;
    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }
    const data = await spoonacularService.autocompleteSearch(query, number);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to autocomplete',
    });
  }
});

// ─── Generate Meal Plan ────────────────────────────────────
// GET /api/spoonacular/meal-plan?timeFrame=day&targetCalories=2000&diet=vegetarian
router.get('/meal-plan', async (req: Request, res: Response) => {
  try {
    const { timeFrame, targetCalories, diet, exclude } = req.query;
    const data = await spoonacularService.generateMealPlan({
      timeFrame: (timeFrame as 'day' | 'week') || 'day',
      targetCalories: targetCalories ? Number(targetCalories) : 2000,
      diet: diet as string,
      exclude: exclude as string,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to generate meal plan',
    });
  }
});

// ─── Search by Ingredients ─────────────────────────────────
// GET /api/spoonacular/search-by-ingredients?ingredients=chicken,tomato,garlic
router.get('/search-by-ingredients', async (req: Request, res: Response) => {
  try {
    const ingredients = req.query.ingredients as string;
    const number = Number(req.query.number) || 12;
    const ranking = Number(req.query.ranking) || 1;
    if (!ingredients) {
      res.json({ success: true, data: [] });
      return;
    }
    const data = await spoonacularService.searchByIngredients(ingredients, number, ranking);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to search by ingredients',
    });
  }
});

// ─── Search by Nutrients ───────────────────────────────────
// GET /api/spoonacular/search-by-nutrients?minCalories=100&maxCalories=500
router.get('/search-by-nutrients', async (req: Request, res: Response) => {
  try {
    const {
      minCalories, maxCalories, minProtein, maxProtein,
      minCarbs, maxCarbs, minFat, maxFat, number,
    } = req.query;

    const data = await spoonacularService.searchByNutrients({
      minCalories: minCalories ? Number(minCalories) : undefined,
      maxCalories: maxCalories ? Number(maxCalories) : undefined,
      minProtein: minProtein ? Number(minProtein) : undefined,
      maxProtein: maxProtein ? Number(maxProtein) : undefined,
      minCarbs: minCarbs ? Number(minCarbs) : undefined,
      maxCarbs: maxCarbs ? Number(maxCarbs) : undefined,
      minFat: minFat ? Number(minFat) : undefined,
      maxFat: maxFat ? Number(maxFat) : undefined,
      number: number ? Number(number) : 12,
    });

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to search by nutrients',
    });
  }
});

// ─── Get Analyzed Instructions ─────────────────────────────
// GET /api/spoonacular/recipe/:id/instructions
router.get('/recipe/:id/instructions', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await spoonacularService.getAnalyzedInstructions(id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch instructions',
    });
  }
});

export default router;
