import axios, { AxiosInstance } from 'axios';

// Simple in-memory cache
interface CacheEntry {
  data: any;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

class SpoonacularService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY || '';
    this.api = axios.create({
      baseURL: 'https://api.spoonacular.com',
      params: { apiKey: this.apiKey },
    });
  }

  // ─── Search Recipes (complexSearch) ──────────────────────
  async searchRecipes(params: {
    query?: string;
    cuisine?: string;
    diet?: string;
    intolerances?: string;
    type?: string;           // meal type: main course, dessert, etc.
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
  }) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get('/recipes/complexSearch', {
      params: {
        ...params,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        fillIngredients: true,
        number: params.number || 12,
      },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Get Recipe Details ──────────────────────────────────
  async getRecipeById(id: number) {
    const cacheKey = `recipe:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get(`/recipes/${id}/information`, {
      params: {
        includeNutrition: true,
        addTasteData: true,
      },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Get Nutrition Data ──────────────────────────────────
  async getRecipeNutrition(id: number) {
    const cacheKey = `nutrition:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get(`/recipes/${id}/nutritionWidget.json`);

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Get Similar Recipes ─────────────────────────────────
  async getSimilarRecipes(id: number, number: number = 6) {
    const cacheKey = `similar:${id}:${number}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get(`/recipes/${id}/similar`, {
      params: { number },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Get Random Recipes ──────────────────────────────────
  async getRandomRecipes(tags?: string, number: number = 10) {
    const cacheKey = `random:${tags || 'all'}:${number}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get('/recipes/random', {
      params: {
        tags,
        number,
        // include full nutrition info
      },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Autocomplete Search ─────────────────────────────────
  async autocompleteSearch(query: string, number: number = 10) {
    const cacheKey = `autocomplete:${query}:${number}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get('/recipes/autocomplete', {
      params: { query, number },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Generate Meal Plan ──────────────────────────────────
  async generateMealPlan(params: {
    timeFrame?: 'day' | 'week';
    targetCalories?: number;
    diet?: string;
    exclude?: string;
  }) {
    // Don't cache meal plans — they should be fresh
    const response = await this.api.get('/mealplanner/generate', {
      params: {
        timeFrame: params.timeFrame || 'day',
        targetCalories: params.targetCalories || 2000,
        diet: params.diet,
        exclude: params.exclude,
      },
    });

    return response.data;
  }

  // ─── Search by Ingredients ───────────────────────────────
  async searchByIngredients(ingredients: string, number: number = 12, ranking: number = 1) {
    const cacheKey = `byIngredients:${ingredients}:${number}:${ranking}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get('/recipes/findByIngredients', {
      params: { ingredients, number, ranking, ignorePantry: true },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Search by Nutrients ─────────────────────────────────
  async searchByNutrients(params: {
    minCalories?: number;
    maxCalories?: number;
    minProtein?: number;
    maxProtein?: number;
    minCarbs?: number;
    maxCarbs?: number;
    minFat?: number;
    maxFat?: number;
    number?: number;
  }) {
    const cacheKey = `byNutrients:${JSON.stringify(params)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get('/recipes/findByNutrients', {
      params: { ...params, number: params.number || 12 },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }

  // ─── Get Analyzed Instructions ───────────────────────────
  async getAnalyzedInstructions(id: number) {
    const cacheKey = `instructions:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await this.api.get(`/recipes/${id}/analyzedInstructions`, {
      params: { stepBreakdown: true },
    });

    setCache(cacheKey, response.data);
    return response.data;
  }
}

export const spoonacularService = new SpoonacularService();
