import { getTTL, handleAsync } from '../utils'
import { DynamoCache } from '../cache/cache.dynamo'
import { DynamoAnalysis } from './analysis.dynamo'
import type { Analysis, AnalysisFilter, Sentiment } from './analysis.model'

const getAnalysisById = async (analysisId: string): Promise<Analysis | null> => {
    const cacheKey = `analysis:${analysisId}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as Analysis

    const { data: analysis } = await DynamoAnalysis()
        .get({ analysisId, type: 'analysis' })
        .go()

    if (analysis) {
        await DynamoCache()
            .put({
                cacheKey,
                cached: analysis,
                expireAt: getTTL(24), // Cache for 24 hours
            })
            .go()
    }

    return analysis || null
}

const getAnalysisByArticle = async (articleId: string): Promise<Analysis[]> => {
    const cacheKey = `analysis:article:${articleId}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as Analysis[]

    const { data: analyses } = await DynamoAnalysis()
        .query.byArticle({ articleId })
        .go()

    await DynamoCache()
        .put({
            cacheKey,
            cached: analyses,
            expireAt: getTTL(12), // Cache for 12 hours
        })
        .go()

    return analyses
}

const createAnalysis = async (analysisData: Omit<Analysis, 'analysisId' | 'createdAt' | 'updatedAt' | 'type'>) => {
    const [analysis, error] = await handleAsync(
        DynamoAnalysis()
            .put(analysisData)
            .go(),
    )

    if (analysis?.data) {
        // Clear related caches
        await Promise.all([
            DynamoCache().delete({ cacheKey: `analysis:article:${analysisData.articleId}` }).go(),
            DynamoCache().delete({ cacheKey: `user-analyses:${analysisData.userId}` }).go(),
            DynamoCache().delete({ cacheKey: `feed-analyses:${analysisData.feedId}` }).go(),
        ])
    }

    return [analysis?.data || null, error]
}

const getUserAnalyses = async (
    userId: string,
    filter?: Partial<AnalysisFilter>,
    cursor?: string,
    limit = 20,
) => {
    const cacheKey = `user-analyses:${userId}:${JSON.stringify(filter || {})}`
    
    if (!cursor) { // Only use cache for first page
        const { data: cached } = await DynamoCache().get({ cacheKey }).go()
        if (cached?.cached) return cached.cached as { analyses: Analysis[], cursor: string | null }
    }

    let query = DynamoAnalysis().query.byUser({ userId })

    if (cursor) {
        query = query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    let filteredAnalyses = result?.data || []

    // Apply filters
    if (filter) {
        if (filter.minScore !== undefined) {
            filteredAnalyses = filteredAnalyses.filter(a => a.libertarianScore >= filter.minScore!)
        }
        if (filter.maxScore !== undefined) {
            filteredAnalyses = filteredAnalyses.filter(a => a.libertarianScore <= filter.maxScore!)
        }
        if (filter.sentiment) {
            filteredAnalyses = filteredAnalyses.filter(a => a.sentiment === filter.sentiment)
        }
        if (filter.createdAfter) {
            filteredAnalyses = filteredAnalyses.filter(a => a.createdAt >= filter.createdAfter!)
        }
        if (filter.createdBefore) {
            filteredAnalyses = filteredAnalyses.filter(a => a.createdAt <= filter.createdBefore!)
        }
    }

    const response = {
        analyses: filteredAnalyses,
        cursor: result?.cursor || null,
    }

    // Cache first page results
    if (!cursor) {
        await DynamoCache()
            .put({
                cacheKey,
                cached: response,
                expireAt: getTTL(1), // Cache for 1 hour
            })
            .go()
    }

    return [response, error]
}

const getFeedAnalyses = async (
    feedId: string,
    startDate?: string,
    endDate?: string,
    cursor?: string,
    limit = 20,
) => {
    let query = DynamoAnalysis().query.byFeed({ feedId })

    if (startDate && endDate) {
        query = query.between(
            { feedId, createdAt: startDate },
            { feedId, createdAt: endDate },
        )
    } else if (startDate) {
        query = query.gte({ feedId, createdAt: startDate })
    } else if (endDate) {
        query = query.lte({ feedId, createdAt: endDate })
    }

    if (cursor) {
        query = query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    return [
        {
            analyses: result?.data || [],
            cursor: result?.cursor || null,
        },
        error,
    ]
}

const getTopScoringAnalyses = async (
    minScore = 80,
    hours = 24,
    limit = 10,
) => {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data } = await DynamoAnalysis()
        .query.byScore({ type: 'analysis' })
        .gte({ type: 'analysis', libertarianScore: minScore, createdAt: startDate })
        .limit(limit)
        .go()

    return data
}

const updateAnalysisSentiment = async (analysisId: string, sentiment: Sentiment) => {
    await DynamoCache().delete({ cacheKey: `analysis:${analysisId}` }).go()

    const [analysis, error] = await handleAsync(
        DynamoAnalysis()
            .update({ analysisId, type: 'analysis' })
            .set({ sentiment })
            .go({ response: 'all_new' }),
    )

    return [analysis?.data || null, error]
}

const getAnalysisStats = async (userId?: string, feedId?: string) => {
    let analyses: Analysis[] = []

    if (userId) {
        const { data } = await DynamoAnalysis().query.byUser({ userId }).go()
        analyses = data
    } else if (feedId) {
        const { data } = await DynamoAnalysis().query.byFeed({ feedId }).go()
        analyses = data
    } else {
        // Get recent analyses for overall stats
        const { data } = await DynamoAnalysis()
            .query.byScore({ type: 'analysis' })
            .limit(100)
            .go()
        analyses = data
    }

    if (analyses.length === 0) {
        return {
            totalAnalyses: 0,
            averageScore: 0,
            sentimentDistribution: { positive: 0, neutral: 0, critical: 0 },
            topPrinciples: [],
        }
    }

    const totalScore = analyses.reduce((sum, a) => sum + a.libertarianScore, 0)
    const sentimentCounts = analyses.reduce((acc, a) => {
        acc[a.sentiment] = (acc[a.sentiment] || 0) + 1
        return acc
    }, {} as Record<Sentiment, number>)

    const principleCounts: Record<string, number> = {}
    analyses.forEach(a => {
        a.principles.forEach(p => {
            principleCounts[p.name] = (principleCounts[p.name] || 0) + 1
        })
    })

    const topPrinciples = Object.entries(principleCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

    return {
        totalAnalyses: analyses.length,
        averageScore: Math.round(totalScore / analyses.length),
        sentimentDistribution: {
            positive: sentimentCounts.positive || 0,
            neutral: sentimentCounts.neutral || 0,
            critical: sentimentCounts.critical || 0,
        },
        topPrinciples,
    }
}

export const analysisService = {
    getAnalysisById,
    getAnalysisByArticle,
    createAnalysis,
    getUserAnalyses,
    getFeedAnalyses,
    getTopScoringAnalyses,
    updateAnalysisSentiment,
    getAnalysisStats,
}
