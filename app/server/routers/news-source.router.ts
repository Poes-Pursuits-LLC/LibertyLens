import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@clerk/backend';
import type { NewsSource, CreateNewsSourceInput, UpdateNewsSourceInput } from '~/core/news-source/news-source.model';
import { defaultNewsSources } from '~/core/news-source/news-source.model';

// Validation schemas
const createNewsSourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url(),
  type: z.enum(['rss', 'api', 'scraper']),
  category: z.enum(['mainstream', 'alternative', 'libertarian', 'financial', 'tech', 'international']),
  logoUrl: z.string().url().optional(),
  fetchConfig: z.object({
    headers: z.record(z.string()).optional(),
    apiKey: z.string().optional(),
    rateLimit: z.number().min(1).max(60).optional(),
    selector: z.string().optional()
  }).optional(),
  tags: z.array(z.string()).optional()
});

const updateNewsSourceSchema = createNewsSourceSchema.partial().extend({
  isActive: z.boolean().optional()
});

const newsSourceRouter = new Hono();

// TODO: Replace with actual DynamoDB calls
const mockSourceDb = new Map<string, NewsSource>();

// Initialize with default sources
let initialized = false;
function initializeDefaultSources() {
  if (initialized) return;
  
  defaultNewsSources.forEach((source, index) => {
    const newsSource: NewsSource = {
      sourceId: `source_default_${index}`,
      name: source.name!,
      description: source.description,
      url: source.url!,
      type: source.type!,
      category: source.category!,
      logoUrl: source.logoUrl,
      isActive: true,
      isPublic: true,
      fetchConfig: {},
      reliability: {
        score: 95,
        failureCount: 0
      },
      tags: source.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'news-source'
    };
    mockSourceDb.set(newsSource.sourceId, newsSource);
  });
  
  initialized = true;
}

// Middleware to check authentication
async function requireAuth(c: any, next: any) {
  const auth = getAuth(c.req);
  
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('userId', auth.userId);
  await next();
}

// Get all available news sources (public + user's custom sources)
newsSourceRouter.get('/', requireAuth, async (c) => {
  initializeDefaultSources();
  
  const userId = c.get('userId');
  const category = c.req.query('category');
  const isActive = c.req.query('active') !== 'false';
  
  let sources = Array.from(mockSourceDb.values())
    .filter(source => 
      source.isActive === isActive &&
      (source.isPublic || source.addedByUserId === userId)
    );
  
  // Filter by category if provided
  if (category) {
    sources = sources.filter(source => source.category === category);
  }
  
  // Sort by reliability score and name
  sources.sort((a, b) => {
    if (b.reliability.score !== a.reliability.score) {
      return b.reliability.score - a.reliability.score;
    }
    return a.name.localeCompare(b.name);
  });
  
  return c.json({
    sources,
    count: sources.length,
    categories: ['mainstream', 'alternative', 'libertarian', 'financial', 'tech', 'international']
  });
});

// Get a specific news source
newsSourceRouter.get('/:sourceId', requireAuth, async (c) => {
  initializeDefaultSources();
  
  const userId = c.get('userId');
  const sourceId = c.req.param('sourceId');
  
  const source = mockSourceDb.get(sourceId);
  
  if (!source) {
    return c.json({ error: 'News source not found' }, 404);
  }
  
  // Check access rights
  if (!source.isPublic && source.addedByUserId !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  return c.json(source);
});

// Create a custom news source
newsSourceRouter.post('/', requireAuth, zValidator('json', createNewsSourceSchema), async (c) => {
  const userId = c.get('userId');
  const input = c.req.valid('json');
  
  // Check if user has reached custom source limit (e.g., 5 for free tier)
  const userSourceCount = Array.from(mockSourceDb.values())
    .filter(source => source.addedByUserId === userId && source.isActive).length;
  
  if (userSourceCount >= 5) {
    return c.json({ error: 'Custom source limit reached. Upgrade to add more sources.' }, 403);
  }
  
  // Check if URL already exists
  const existingSource = Array.from(mockSourceDb.values())
    .find(source => source.url === input.url);
  
  if (existingSource) {
    return c.json({ 
      error: 'A source with this URL already exists',
      existingSourceId: existingSource.sourceId 
    }, 409);
  }
  
  const newsSource: NewsSource = {
    sourceId: `source_custom_${Date.now()}`,
    name: input.name,
    description: input.description,
    url: input.url,
    type: input.type,
    category: input.category,
    logoUrl: input.logoUrl,
    isActive: true,
    isPublic: false,
    addedByUserId: userId,
    fetchConfig: input.fetchConfig || {},
    reliability: {
      score: 50, // Start with neutral score
      failureCount: 0
    },
    tags: input.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: 'news-source'
  };
  
  mockSourceDb.set(newsSource.sourceId, newsSource);
  
  return c.json(newsSource, 201);
});

// Update a custom news source
newsSourceRouter.patch('/:sourceId', requireAuth, zValidator('json', updateNewsSourceSchema), async (c) => {
  const userId = c.get('userId');
  const sourceId = c.req.param('sourceId');
  const updates = c.req.valid('json');
  
  const source = mockSourceDb.get(sourceId);
  
  if (!source) {
    return c.json({ error: 'News source not found' }, 404);
  }
  
  // Only allow updating custom sources owned by the user
  if (source.isPublic || source.addedByUserId !== userId) {
    return c.json({ error: 'Cannot modify this news source' }, 403);
  }
  
  // Apply updates
  Object.assign(source, {
    ...updates,
    fetchConfig: updates.fetchConfig
      ? { ...source.fetchConfig, ...updates.fetchConfig }
      : source.fetchConfig,
    updatedAt: new Date().toISOString()
  });
  
  mockSourceDb.set(sourceId, source);
  
  return c.json(source);
});

// Delete a custom news source
newsSourceRouter.delete('/:sourceId', requireAuth, async (c) => {
  const userId = c.get('userId');
  const sourceId = c.req.param('sourceId');
  
  const source = mockSourceDb.get(sourceId);
  
  if (!source) {
    return c.json({ error: 'News source not found' }, 404);
  }
  
  // Only allow deleting custom sources owned by the user
  if (source.isPublic || source.addedByUserId !== userId) {
    return c.json({ error: 'Cannot delete this news source' }, 403);
  }
  
  // Soft delete
  source.isActive = false;
  source.updatedAt = new Date().toISOString();
  mockSourceDb.set(sourceId, source);
  
  return c.json({ message: 'News source deleted successfully' });
});

// Test a news source URL
newsSourceRouter.post('/test', requireAuth, async (c) => {
  const { url, type } = await c.req.json();
  
  if (!url || !type) {
    return c.json({ error: 'URL and type are required' }, 400);
  }
  
  // TODO: Implement actual URL testing logic
  // For now, just simulate a test
  const isValid = url.startsWith('http');
  
  return c.json({
    url,
    type,
    isValid,
    message: isValid ? 'Source URL is accessible' : 'Failed to access source URL',
    testTimestamp: new Date().toISOString()
  });
});

export { newsSourceRouter };
