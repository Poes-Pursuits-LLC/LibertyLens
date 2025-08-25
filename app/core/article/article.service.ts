import { getTTL, handleAsync } from '../utils'
import { DynamoCache } from '../cache/cache.dynamo'
import { DynamoArticle } from './article.dynamo'
import type { Article, CreateArticleInput, ArticleSearchParams } from './article.model'

const getArticleById = async (articleId: string): Promise<Article | null> => {
    const cacheKey = `article:${articleId}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as Article

    const { data: article } = await DynamoArticle()
        .get({ articleId, type: 'article' })
        .go()

    if (article) {
        await DynamoCache()
            .put({
                cacheKey,
                cached: article,
                expireAt: getTTL(24), // Cache for 24 hours
            })
            .go()
    }

    return article || null
}

const getArticleByUrl = async (originalUrl: string): Promise<Article | null> => {
    const { data } = await DynamoArticle()
        .query.byUrl({ originalUrl, type: 'article' })
        .go()

    return data?.[0] || null
}

const createArticle = async (input: CreateArticleInput) => {
    // Check if article already exists with this URL
    const existing = await getArticleByUrl(input.originalUrl)
    if (existing) {
        return [existing, null] // Return existing article, no error
    }

    const [article, error] = await handleAsync(
        DynamoArticle()
            .put({
                sourceId: input.sourceId,
                sourceName: input.sourceName,
                originalUrl: input.originalUrl,
                title: input.title,
                summary: input.summary,
                content: input.content,
                author: input.author,
                publishedAt: input.publishedAt,
                tags: input.tags || [],
                imageUrl: input.imageUrl,
            })
            .go(),
    )

    return [article?.data || null, error]
}

const createArticlesBatch = async (articles: CreateArticleInput[]) => {
    // Filter out articles that already exist
    const existingChecks = await Promise.all(
        articles.map(article => getArticleByUrl(article.originalUrl))
    )
    
    const newArticles = articles.filter((_, index) => !existingChecks[index])
    
    if (newArticles.length === 0) {
        return [[], null] // All articles already exist
    }

    const [results, error] = await handleAsync(
        DynamoArticle()
            .put(
                newArticles.map(article => ({
                    sourceId: article.sourceId,
                    sourceName: article.sourceName,
                    originalUrl: article.originalUrl,
                    title: article.title,
                    summary: article.summary,
                    content: article.content,
                    author: article.author,
                    publishedAt: article.publishedAt,
                    tags: article.tags || [],
                    imageUrl: article.imageUrl,
                }))
            )
            .go(),
    )

    return [results?.data || [], error]
}

const getArticlesBySource = async (
    sourceId: string,
    startDate?: string,
    endDate?: string,
    cursor?: string,
    limit = 20,
) => {
    let query = DynamoArticle().query.bySource({ sourceId })

    if (startDate && endDate) {
        query = query.between(
            { sourceId, publishedAt: startDate },
            { sourceId, publishedAt: endDate },
        )
    } else if (startDate) {
        query = query.gte({ sourceId, publishedAt: startDate })
    } else if (endDate) {
        query = query.lte({ sourceId, publishedAt: endDate })
    }

    if (cursor) {
        query = query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    return [
        {
            articles: result?.data || [],
            cursor: result?.cursor || null,
        },
        error,
    ]
}

const getRecentArticles = async (
    hours = 24,
    cursor?: string,
    limit = 20,
) => {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    let query = DynamoArticle()
        .query.byPublishedDate({ type: 'article' })
        .gte({ type: 'article', publishedAt: startDate })

    if (cursor) {
        query = query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    return [
        {
            articles: result?.data || [],
            cursor: result?.cursor || null,
        },
        error,
    ]
}

const searchArticles = async (params: ArticleSearchParams) => {
    const {
        sourceId,
        tags,
        startDate,
        endDate,
        cursor,
        limit = 20,
    } = params

    // If sourceId is provided, use the bySource index
    if (sourceId) {
        return getArticlesBySource(sourceId, startDate, endDate, cursor, limit)
    }

    // Otherwise, use the byPublishedDate index
    let query = DynamoArticle().query.byPublishedDate({ type: 'article' })

    if (startDate && endDate) {
        query = query.between(
            { type: 'article', publishedAt: startDate },
            { type: 'article', publishedAt: endDate },
        )
    } else if (startDate) {
        query = query.gte({ type: 'article', publishedAt: startDate })
    } else if (endDate) {
        query = query.lte({ type: 'article', publishedAt: endDate })
    }

    if (cursor) {
        query = query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    // Filter by tags if provided (post-query filtering)
    let filteredArticles = result?.data || []
    if (tags && tags.length > 0) {
        filteredArticles = filteredArticles.filter(article =>
            tags.some(tag => article.tags.includes(tag))
        )
    }

    return [
        {
            articles: filteredArticles,
            cursor: result?.cursor || null,
        },
        error,
    ]
}

const updateArticleTags = async (articleId: string, tags: string[]) => {
    // Clear cache
    await DynamoCache().delete({ cacheKey: `article:${articleId}` }).go()

    const [article, error] = await handleAsync(
        DynamoArticle()
            .update({ articleId, type: 'article' })
            .set({ tags })
            .go({ response: 'all_new' }),
    )

    return [article?.data || null, error]
}

const deleteArticle = async (articleId: string) => {
    // Clear cache
    await DynamoCache().delete({ cacheKey: `article:${articleId}` }).go()

    const [result, error] = await handleAsync(
        DynamoArticle()
            .delete({ articleId, type: 'article' })
            .go(),
    )

    return [result?.data || null, error]
}

export const articleService = {
    getArticleById,
    getArticleByUrl,
    createArticle,
    createArticlesBatch,
    getArticlesBySource,
    getRecentArticles,
    searchArticles,
    updateArticleTags,
    deleteArticle,
}
