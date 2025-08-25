export interface Article {
    articleId: string
    sourceId: string
    sourceName: string
    originalUrl: string
    title: string
    summary: string
    content: string
    author?: string
    publishedAt: string
    fetchedAt: string
    tags: string[]
    imageUrl?: string
    createdAt: string
    updatedAt: string
    type: 'article'
}

export interface CreateArticleInput {
    sourceId: string
    sourceName: string
    originalUrl: string
    title: string
    summary: string
    content: string
    author?: string
    publishedAt: string
    tags?: string[]
    imageUrl?: string
}

export interface ArticleSearchParams {
    sourceId?: string
    tags?: string[]
    startDate?: string
    endDate?: string
    cursor?: string
    limit?: number
}
