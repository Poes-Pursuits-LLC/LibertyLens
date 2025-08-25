import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@clerk/backend';
import type { Article, ArticleSearchParams } from '~/core/article/article.model';

// Validation schemas
const articleSearchSchema = z.object({
  sourceId: z.string().optional(),
  feedId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasAnalysis: z.boolean().optional(),
  searchTerm: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['publishedAt', 'fetchedAt', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

const articleRouter = new Hono();

// TODO: Replace with actual DynamoDB calls
const mockArticleDb = new Map<string, Article>();

// Middleware to check authentication
async function requireAuth(c: any, next: any) {
  const auth = getAuth(c.req);
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('userId', auth.userId);
  await next();
}

// Helper to check if user has access to an article
function hasArticleAccess(article: Article, userId: string, userFeedIds: string[]): boolean {
  // For now, check if article belongs to one of user's feeds
  // TODO: Implement proper access control with feed ownership check
  return userFeedIds.includes(article.articleId);
}

// Get articles for user's feeds
articleRouter.get('/', requireAuth, zValidator('query', articleSearchSchema), async (c) => {
  const userId = c.get('userId');
  const params = c.req.valid('query');
  
  // TODO: Get user's feed IDs from feed service
  const userFeedIds: string[] = []; // Placeholder
  
  let articles = Array.from(mockArticleDb.values());
  
  // Filter by feed/source
  if (params.feedId) {
    articles = articles.filter(a => a.articleId === params.feedId); // TODO: Fix this - should be feedId
  }
  if (params.sourceId) {
    articles = articles.filter(a => a.sourceId === params.sourceId);
  }
  
  // Filter by date range
  if (params.startDate) {
    articles = articles.filter(a => a.publishedAt >= params.startDate);
  }
  if (params.endDate) {
    articles = articles.filter(a => a.publishedAt <= params.endDate);
  }
  
  // Filter by tags
  if (params.tags && params.tags.length > 0) {
    articles = articles.filter(a => 
      params.tags!.some(tag => a.tags.includes(tag))
    );
  }
  
  // Search in title and content
  if (params.searchTerm) {
    const searchLower = params.searchTerm.toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(searchLower) ||
      a.summary.toLowerCase().includes(searchLower) ||
      a.content.toLowerCase().includes(searchLower)
    );
  }
  
  // Sort articles
  const sortBy = params.sortBy || 'publishedAt';
  const sortOrder = params.sortOrder || 'desc';
  
  articles.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'publishedAt':
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'fetchedAt':
        comparison = new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime();
        break;
      case 'relevance':
        // TODO: Implement relevance scoring
        comparison = 0;
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  // Pagination
  const limit = params.limit || 20;
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const paginatedArticles = articles.slice(startIndex, startIndex + limit);
  
  // Generate next cursor
  const nextCursor = startIndex + limit < articles.length 
    ? String(startIndex + limit) 
    : null;
  
  return c.json({
    articles: paginatedArticles,
    nextCursor,
    totalCount: articles.length,
    hasMore: nextCursor !== null
  });
});

// Get a specific article
articleRouter.get('/:articleId', requireAuth, async (c) => {
  const userId = c.get('userId');
  const articleId = c.req.param('articleId');
  
  const article = mockArticleDb.get(articleId);
  
  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }
  
  // TODO: Check if user has access to this article
  // For now, we'll assume all authenticated users can read articles
  
  return c.json(article);
});

// Get articles by feed
articleRouter.get('/feed/:feedId', requireAuth, async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  const limit = parseInt(c.req.query('limit') || '20');
  const cursor = c.req.query('cursor');
  
  // TODO: Verify user owns this feed
  
  let articles = Array.from(mockArticleDb.values())
    .filter(a => a.articleId === feedId) // TODO: Fix this - should check feedId
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Pagination
  const startIndex = cursor ? parseInt(cursor) : 0;
  const paginatedArticles = articles.slice(startIndex, startIndex + limit);
  
  const nextCursor = startIndex + limit < articles.length 
    ? String(startIndex + limit) 
    : null;
  
  return c.json({
    articles: paginatedArticles,
    feedId,
    nextCursor,
    hasMore: nextCursor !== null
  });
});

// Get trending articles (most analyzed in libertarian community)
articleRouter.get('/trending', requireAuth, async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  const timeframe = c.req.query('timeframe') || '24h'; // 24h, 7d, 30d
  
  // Calculate cutoff date based on timeframe
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeframe) {
    case '24h':
      cutoffDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
  }
  
  // TODO: Implement actual trending logic based on:
  // - Number of analyses
  // - User engagement
  // - Libertarian relevance score
  
  const trendingArticles = Array.from(mockArticleDb.values())
    .filter(a => new Date(a.publishedAt) >= cutoffDate)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
  
  return c.json({
    articles: trendingArticles,
    timeframe,
    count: trendingArticles.length
  });
});

// Mark article as read (for tracking)
articleRouter.post('/:articleId/read', requireAuth, async (c) => {
  const userId = c.get('userId');
  const articleId = c.req.param('articleId');
  
  const article = mockArticleDb.get(articleId);
  
  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }
  
  // TODO: Track user read history
  
  return c.json({
    message: 'Article marked as read',
    articleId,
    timestamp: new Date().toISOString()
  });
});

// Save article for later
articleRouter.post('/:articleId/save', requireAuth, async (c) => {
  const userId = c.get('userId');
  const articleId = c.req.param('articleId');
  
  const article = mockArticleDb.get(articleId);
  
  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }
  
  // TODO: Implement saved articles functionality
  
  return c.json({
    message: 'Article saved',
    articleId,
    timestamp: new Date().toISOString()
  });
});

// Remove saved article
articleRouter.delete('/:articleId/save', requireAuth, async (c) => {
  const userId = c.get('userId');
  const articleId = c.req.param('articleId');
  
  // TODO: Implement remove from saved articles
  
  return c.json({
    message: 'Article removed from saved',
    articleId
  });
});

export { articleRouter };
