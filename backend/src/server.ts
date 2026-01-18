import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import connectDB from './config/db';
import passport from './config/passport';
import { notFound, errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Initialize Passport
app.use(passport.initialize());

// Rate limiting
app.use('/api', apiLimiter);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Recipe Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// TODO: Add these routes in Sprint 2
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/collections', collectionRoutes);
// app.use('/api/meal-plans', mealPlanRoutes);
// app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Recipe Platform API v1.0',
    docs: '/api-docs',
    health: '/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📍 Local: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
