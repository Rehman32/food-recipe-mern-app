import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  User,
  Recipe,
  Collection,
  PaginatedResponse,
  RecipeFilters
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshed = await useAuthStore.getState().refreshAuth();
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return response.data;
  },
  
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  
  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
  
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (username: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${username}`);
    return response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return response.data;
  },
  
  updatePreferences: async (preferences: Partial<User['preferences']>): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/preferences', preferences);
    return response.data;
  },
  
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  follow: async (userId: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/users/${userId}/follow`);
    return response.data;
  },
  
  unfollow: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/users/${userId}/follow`);
    return response.data;
  },

  getRecipes: async (username: string): Promise<ApiResponse<{ recipes: Recipe[] }>> => {
    const response = await api.get<ApiResponse<{ recipes: Recipe[] }>>(`/users/${username}/recipes`);
    return response.data;
  },

  getCollections: async (username: string): Promise<ApiResponse<{ collections: Collection[] }>> => {
    const response = await api.get<ApiResponse<{ collections: Collection[] }>>(`/users/${username}/collections`);
    return response.data;
  },
};

// Recipe API
export const recipeApi = {
  getAll: async (filters?: RecipeFilters): Promise<ApiResponse<PaginatedResponse<Recipe>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Recipe>>>('/recipes', { params: filters });
    return response.data;
  },
  
  getBySlug: async (slug: string): Promise<ApiResponse<{ recipe: Recipe }>> => {
    const response = await api.get<ApiResponse<{ recipe: Recipe }>>(`/recipes/${slug}`);
    return response.data;
  },
  
  getFeatured: async (): Promise<ApiResponse<{ recipes: Recipe[] }>> => {
    const response = await api.get<ApiResponse<{ recipes: Recipe[] }>>('/recipes/featured');
    return response.data;
  },
  
  getTrending: async (): Promise<ApiResponse<{ recipes: Recipe[] }>> => {
    const response = await api.get<ApiResponse<{ recipes: Recipe[] }>>('/recipes/trending');
    return response.data;
  },
  
  create: async (data: Partial<Recipe>): Promise<ApiResponse<{ recipe: Recipe }>> => {
    const response = await api.post<ApiResponse<{ recipe: Recipe }>>('/recipes', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Recipe>): Promise<ApiResponse<{ recipe: Recipe }>> => {
    const response = await api.put<ApiResponse<{ recipe: Recipe }>>(`/recipes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/recipes/${id}`);
    return response.data;
  },
  
  save: async (id: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/recipes/${id}/save`);
    return response.data;
  },
  
  unsave: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/recipes/${id}/save`);
    return response.data;
  },
};

// Collection API
export const collectionApi = {
  getAll: async (): Promise<ApiResponse<{ collections: Collection[] }>> => {
    const response = await api.get<ApiResponse<{ collections: Collection[] }>>('/collections');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<{ collection: Collection }>> => {
    const response = await api.get<ApiResponse<{ collection: Collection }>>(`/collections/${id}`);
    return response.data;
  },
  
  create: async (data: { name: string; description?: string; isPublic?: boolean }): Promise<ApiResponse<{ collection: Collection }>> => {
    const response = await api.post<ApiResponse<{ collection: Collection }>>('/collections', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Collection>): Promise<ApiResponse<{ collection: Collection }>> => {
    const response = await api.put<ApiResponse<{ collection: Collection }>>(`/collections/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/collections/${id}`);
    return response.data;
  },
  
  addRecipe: async (collectionId: string, recipeId: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/collections/${collectionId}/recipes`, { recipeId });
    return response.data;
  },
  
  removeRecipe: async (collectionId: string, recipeId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/collections/${collectionId}/recipes/${recipeId}`);
    return response.data;
  },
};

export default api;
