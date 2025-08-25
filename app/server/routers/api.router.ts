import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { z } from 'zod';
import { feedRouter } from './feed.router';
import { newsSourceRouter } from './news-source.router';
import { articleRouter } from './article.router';
import { analysisRouter } from './analysis.router';

const apiRouter = new Hono();

// Middleware
apiRouter.use('*', cors());
apiRouter.use('*', logger());

// Health check
apiRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info
apiRouter.get('/', (c) => {
  return c.json({
    name: 'Liberty Lens API',
    version: '1.0.0',
    description: 'AI-powered news analysis through a libertarian lens',
    endpoints: {
      feeds: '/api/feeds',
      sources: '/api/sources',
      articles: '/api/articles',
      analyses: '/api/analyses'
    }
  });
});

// Mount entity routers
apiRouter.route('/feeds', feedRouter);
apiRouter.route('/sources', newsSourceRouter);
apiRouter.route('/articles', articleRouter);
apiRouter.route('/analyses', analysisRouter);

// 404 handler
apiRouter.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested API endpoint does not exist'
  }, 404);
});

// Global error handler
apiRouter.onError((err, c) => {
  console.error('API Error:', err);
  
  if (err instanceof z.ZodError) {
    return c.json({
      error: 'Validation Error',
      details: err.errors
    }, 400);
  }
  
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  }, 500);
});

export { apiRouter };
