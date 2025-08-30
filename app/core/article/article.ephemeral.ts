export interface EphemeralArticle {
  id: string
  originalUrl: string
  title?: string
  summary?: string
  content?: string
  author?: string
  publishedAt?: string
  tags?: string[]
  imageUrl?: string
  sourceId: string
  sourceName: string
}

export interface EphemeralSourceCacheEntry {
  items: EphemeralArticle[]
  fetchedAt: string
}

