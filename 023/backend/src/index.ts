import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import operationsRouter from './routes/operations';
import { notFoundHandler, globalErrorHandler } from './utils/errorHandler';

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;
const NODE_ENV: string = process.env.NODE_ENV || 'development';

app.use(cors({
  origin: NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || '*'
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/operations', operationsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pet Shop API is running!',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  🐾 Pet Shop API Server`);
  console.log(`  🚀 Environment: ${NODE_ENV}`);
  console.log(`  🌐 Server running on port ${PORT}`);
  console.log(`  🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`========================================\n`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION!', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

export default app;
