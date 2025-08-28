import Parser from 'rss-parser';
import type { NewsSource } from '../news-source/news-source.model';
import type { CreateArticleInput } from './article.model';

// Custom parser with extended fields
interface CustomFeed extends Parser.Output<CustomItem> { }
interface CustomItem extends Parser.Item {
  'media:content'?: { $?: { url?: string } };
  'media:thumbnail'?: { $?: { url?: string } };
  enclosure?: { url: string; type: string };
  'content:encoded'?: string;
  date?: string;
  description?: string;
  author?: string;
}

const parser = new Parser<CustomFeed, CustomItem>({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'Liberty Lens RSS Reader/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      'enclosure',
    ],
  },
});

/**
 * Extract the main image URL from an RSS item
 */
function extractImageUrl(item: CustomItem): string | undefined {
  // Try media:thumbnail first (most common)
  if (item['media:thumbnail']?.$?.url) {
    return item['media:thumbnail'].$.url;
  }

  // Then try media:content
  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url;
  }

  // Then try enclosure if it's an image
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }

  // Try to find image in content
  const contentHtml = item.content || item['content:encoded'] || '';
  const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) {
    return imgMatch[1];
  }

  return undefined;
}

/**
 * Parse published date from various formats
 */
function parsePublishedDate(item: CustomItem): string {
  const dateStr = item.pubDate || item.isoDate || item.date;
  if (!dateStr) {
    return new Date().toISOString();
  }

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Extract tags from categories
 */
function extractTags(item: CustomItem): string[] {
  if (!item.categories || !Array.isArray(item.categories)) {
    return [];
  }

  return item.categories
    .filter((cat): cat is string => typeof cat === 'string')
    .map(cat => cat.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'))
    .filter(tag => tag.length > 0 && tag.length < 50);
}

/**
 * Generate a stable URL for articles that might have tracking parameters
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Fetch and parse articles from an RSS feed
 */
export async function fetchRSSArticles(
  source: NewsSource
): Promise<[CreateArticleInput[], Error | null]> {
  try {
    // Add custom headers if configured
    const customParser = source.fetchConfig?.headers
      ? new Parser<CustomFeed, CustomItem>({
        headers: {
          ...source.fetchConfig.headers,
        },
      })
      : parser;

    const feed = await customParser.parseURL(source.url);

    if (!feed.items || feed.items.length === 0) {
      return [[], null];
    }

    const articles: CreateArticleInput[] = feed.items
      .filter(item => item.link && item.title) // Must have at least link and title
      .map(item => {
        const normalizedUrl = normalizeUrl(item.link!);
        const summary = item.contentSnippet || item.summary || item.description || '';
        const content = item.content || item['content:encoded'] || summary;

        return {
          sourceId: source.sourceId,
          sourceName: source.name,
          originalUrl: normalizedUrl,
          title: item.title!.trim(),
          summary: summary.substring(0, 500), // Limit summary length
          content,
          author: item.creator || item.author || source.name,
          publishedAt: parsePublishedDate(item),
          tags: [...extractTags(item), ...source.tags].slice(0, 10), // Max 10 tags
          imageUrl: extractImageUrl(item),
        };
      });

    return [articles, null];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return [
      [],
      new Error(`Failed to fetch RSS from ${source.name}: ${errorMessage}`),
    ];
  }
}

/**
 * Fetch articles from multiple sources with concurrency control
 */
export async function fetchMultipleSources(
  sources: NewsSource[],
  concurrency = 5
): Promise<Map<string, [CreateArticleInput[], Error | null]>> {
  const results = new Map<string, [CreateArticleInput[], Error | null]>();

  // Process in batches to respect concurrency limit
  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (source) => {
        const result = await fetchRSSArticles(source);
        return { sourceId: source.sourceId, result };
      })
    );

    batchResults.forEach(({ sourceId, result }) => {
      results.set(sourceId, result);
    });
  }

  return results;
}
