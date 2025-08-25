export type SourceType = 'rss' | 'api' | 'scraper';
export type SourceCategory = 'mainstream' | 'alternative' | 'libertarian' | 'financial' | 'tech' | 'international';

export interface NewsSource {
  sourceId: string;
  name: string;
  description?: string;
  url: string;
  type: SourceType;
  category: SourceCategory;
  logoUrl?: string;
  isActive: boolean;
  isPublic: boolean; // Available to all users
  addedByUserId?: string; // User who added custom source
  fetchConfig: {
    headers?: Record<string, string>;
    apiKey?: string; // Encrypted
    rateLimit?: number; // Requests per minute
    selector?: string; // For scraper type
  };
  reliability: {
    score: number; // 0-100
    lastSuccessfulFetch?: string;
    lastFailedFetch?: string;
    failureCount: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  entityType: 'news-source';
}

export interface CreateNewsSourceInput {
  name: string;
  description?: string;
  url: string;
  type: SourceType;
  category: SourceCategory;
  logoUrl?: string;
  fetchConfig?: {
    headers?: Record<string, string>;
    apiKey?: string;
    rateLimit?: number;
    selector?: string;
  };
  tags?: string[];
}

export interface UpdateNewsSourceInput {
  name?: string;
  description?: string;
  url?: string;
  category?: SourceCategory;
  logoUrl?: string;
  isActive?: boolean;
  fetchConfig?: {
    headers?: Record<string, string>;
    apiKey?: string;
    rateLimit?: number;
    selector?: string;
  };
  tags?: string[];
}

// Pre-configured news sources
export const defaultNewsSources: Partial<NewsSource>[] = [
  {
    name: 'Reason Magazine',
    description: 'Free minds and free markets',
    url: 'https://reason.com/feed/',
    type: 'rss',
    category: 'libertarian',
    tags: ['libertarian', 'politics', 'economics']
  },
  {
    name: 'Mises Institute',
    description: 'Austrian economics, freedom, and peace',
    url: 'https://mises.org/feed/articles',
    type: 'rss',
    category: 'libertarian',
    tags: ['austrian-economics', 'libertarian', 'philosophy']
  },
  {
    name: 'Liberty Fund',
    description: 'Educational foundation for liberty',
    url: 'https://www.libertyfund.org/feed/',
    type: 'rss',
    category: 'libertarian',
    tags: ['education', 'liberty', 'philosophy']
  },
  {
    name: 'Reuters',
    description: 'International news organization',
    url: 'https://www.reuters.com/rssFeed/topNews',
    type: 'rss',
    category: 'mainstream',
    tags: ['news', 'international', 'mainstream']
  },
  {
    name: 'BBC News',
    description: 'British Broadcasting Corporation',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    type: 'rss',
    category: 'mainstream',
    tags: ['news', 'international', 'mainstream']
  },
  {
    name: 'The Intercept',
    description: 'Adversarial journalism',
    url: 'https://theintercept.com/feed/',
    type: 'rss',
    category: 'alternative',
    tags: ['investigative', 'alternative', 'civil-liberties']
  },
  {
    name: 'Zero Hedge',
    description: 'Financial and political analysis',
    url: 'https://feeds.feedburner.com/zerohedge/feed',
    type: 'rss',
    category: 'financial',
    tags: ['finance', 'economics', 'alternative']
  },
  {
    name: 'Ars Technica',
    description: 'Technology news and analysis',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    type: 'rss',
    category: 'tech',
    tags: ['technology', 'science', 'policy']
  }
];
