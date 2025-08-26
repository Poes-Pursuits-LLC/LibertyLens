import { getTTL, handleAsync } from "../utils";
import { DynamoCache } from "../cache/cache.dynamo";
import { DynamoAnalysis } from "./analysis.dynamo";
import type { Analysis, AnalysisFilter, Sentiment } from "./analysis.model";

const getAnalysisById = async (analysisId: string) => {
  const cacheKey = `analysis:${analysisId}`;
  const { data: cached } = await DynamoCache()
    .get({ cacheKey, type: "cache" })
    .go();
  if (cached?.cached) return cached.cached as Analysis;

  const { data: analysis } = await DynamoAnalysis()
    .get({ analysisId, type: "analysis" })
    .go();

  if (analysis) {
    await DynamoCache()
      .put({
        cacheKey,
        cached: analysis,
        expireAt: getTTL(24), // Cache for 24 hours
      })
      .go();
  }

  return analysis || null;
};

const getAnalysisByArticle = async (articleId: string): Promise<Analysis[]> => {
  try {
    const cacheKey = `analysis:article:${articleId}`;
    const cacheResult = await DynamoCache()
      .get({ cacheKey, type: "cache" })
      .go();

    if (cacheResult.data && cacheResult.data.cached) {
      return cacheResult.data.cached as Analysis[];
    }

    const analysesResult = await DynamoAnalysis()
      .query.byArticle({ articleId })
      .go();

    const analyses = (analysesResult.data || []) as Analysis[];

    await DynamoCache()
      .put({
        cacheKey,
        cached: analyses,
        expireAt: getTTL(12), // Cache for 12 hours
        type: "cache",
      })
      .go();

    return analyses;
  } catch (error) {
    console.error("Error getting analysis by article:", error);
    return [];
  }
};

const createAnalysis = async (
  analysisData: Omit<
    Analysis,
    "analysisId" | "createdAt" | "updatedAt" | "type"
  >
): Promise<[Analysis | null, any]> => {
  try {
    const result = await DynamoAnalysis().put(analysisData).go();

    if (result?.data) {
      // Clear related caches
      await Promise.all([
        DynamoCache()
          .delete({
            cacheKey: `analysis:article:${analysisData.articleId}`,
            type: "cache",
          })
          .go(),
        DynamoCache()
          .delete({
            cacheKey: `user-analyses:${analysisData.userId}`,
            type: "cache",
          })
          .go(),
        DynamoCache()
          .delete({
            cacheKey: `feed-analyses:${analysisData.feedId}`,
            type: "cache",
          })
          .go(),
      ]);
    }

    return [result?.data as Analysis, null];
  } catch (error) {
    console.error("Error creating analysis:", error);
    return [null, error];
  }
};

const getUserAnalyses = async (
  userId: string,
  filter?: Partial<AnalysisFilter>,
  cursor?: string,
  limit = 20
): Promise<[{ analyses: Analysis[]; cursor: string | null }, any]> => {
  try {
    const cacheKey = `user-analyses:${userId}:${JSON.stringify(filter || {})}`;

    if (!cursor) {
      // Only use cache for first page
      const cacheResult = await DynamoCache()
        .get({ cacheKey, type: "cache" })
        .go();
      if (cacheResult.data && cacheResult.data.cached) {
        return cacheResult.data.cached as [
          { analyses: Analysis[]; cursor: string | null },
          any,
        ];
      }
    }

    const result = await DynamoAnalysis()
      .query.byUser({ userId })
      .go({
        limit,
        cursor: cursor ? cursor : undefined,
      });

    let filteredAnalyses = (result.data || []) as Analysis[];

    // Apply filters
    if (filter) {
      if (filter.minScore !== undefined) {
        filteredAnalyses = filteredAnalyses.filter(
          (a: Analysis) => a.libertarianScore >= filter.minScore!
        );
      }
      if (filter.maxScore !== undefined) {
        filteredAnalyses = filteredAnalyses.filter(
          (a: Analysis) => a.libertarianScore <= filter.maxScore!
        );
      }
      if (filter.sentiment) {
        filteredAnalyses = filteredAnalyses.filter(
          (a: Analysis) => a.sentiment === filter.sentiment
        );
      }
      if (filter.createdAfter) {
        filteredAnalyses = filteredAnalyses.filter(
          (a: Analysis) => a.createdAt >= filter.createdAfter!
        );
      }
      if (filter.createdBefore) {
        filteredAnalyses = filteredAnalyses.filter(
          (a: Analysis) => a.createdAt <= filter.createdBefore!
        );
      }
    }

    const response = {
      analyses: filteredAnalyses,
      cursor: result.cursor || null,
    };

    // Cache first page results
    if (!cursor) {
      await DynamoCache()
        .put({
          cacheKey,
          cached: response,
          expireAt: getTTL(1), // Cache for 1 hour
          type: "cache",
        })
        .go();
    }

    return [response, null];
  } catch (error) {
    console.error("Error getting user analyses:", error);
    return [
      {
        analyses: [],
        cursor: null,
      },
      error,
    ];
  }
};

const getFeedAnalyses = async (
  feedId: string,
  startDate?: string,
  endDate?: string,
  cursor?: string,
  limit = 20
): Promise<[{ analyses: Analysis[]; cursor: string | null }, any]> => {
  try {
    const result = await DynamoAnalysis()
      .query.byFeed({ feedId })
      .where((attr, op) => {
        if (startDate && endDate) {
          return op.between(attr.createdAt, startDate, endDate);
        } else if (startDate) {
          return op.gte(attr.createdAt, startDate);
        } else if (endDate) {
          return op.lte(attr.createdAt, endDate);
        }
        return op.eq(attr.createdAt, attr.createdAt);
      })
      .go({
        limit,
        cursor: cursor ? cursor : undefined,
      });

    return [
      {
        analyses: (result.data || []) as Analysis[],
        cursor: result.cursor || null,
      },
      null,
    ];
  } catch (error) {
    console.error("Error getting feed analyses:", error);
    return [
      {
        analyses: [],
        cursor: null,
      },
      error,
    ];
  }
};

const getTopScoringAnalyses = async (
  minScore = 80,
  limit = 10
): Promise<Analysis[]> => {
  try {
    const result = await DynamoAnalysis()
      .query.byScore({ type: "analysis" })
      .where((attr, op) => op.gte(attr.libertarianScore, minScore))
      .go({
        limit,
      });

    return (result.data || []) as Analysis[];
  } catch (error) {
    console.error("Error getting top scoring analyses:", error);
    return [];
  }
};

const updateAnalysisSentiment = async (
  analysisId: string,
  sentiment: Sentiment
): Promise<[Analysis | null, any]> => {
  try {
    await DynamoCache()
      .delete({ cacheKey: `analysis:${analysisId}`, type: "cache" })
      .go();

    const result = await DynamoAnalysis()
      .update({ analysisId, type: "analysis" })
      .set({ sentiment })
      .go({ response: "all_new" });

    return [result?.data as Analysis, null];
  } catch (error) {
    console.error("Error updating analysis sentiment:", error);
    return [null, error];
  }
};

const getAnalysisStats = async (userId?: string, feedId?: string) => {
  try {
    let analyses: Analysis[] = [];

    if (userId) {
      const result = await DynamoAnalysis().query.byUser({ userId }).go();
      analyses = (result.data || []) as Analysis[];
    } else if (feedId) {
      const result = await DynamoAnalysis().query.byFeed({ feedId }).go();
      analyses = (result.data || []) as Analysis[];
    } else {
      // Get recent analyses for overall stats
      const result = await DynamoAnalysis()
        .query.byScore({ type: "analysis" })
        .go({
          limit: 100,
        });
      analyses = (result.data || []) as Analysis[];
    }

    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        sentimentDistribution: { positive: 0, neutral: 0, critical: 0 },
        topPrinciples: [],
      };
    }

    const totalScore = analyses.reduce((sum, a) => sum + a.libertarianScore, 0);
    const sentimentCounts = analyses.reduce(
      (acc, a) => {
        acc[a.sentiment] = (acc[a.sentiment] || 0) + 1;
        return acc;
      },
      {} as Record<Sentiment, number>
    );

    const principleCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      a.principles.forEach((p) => {
        principleCounts[p.name] = (principleCounts[p.name] || 0) + 1;
      });
    });

    const topPrinciples = Object.entries(principleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalAnalyses: analyses.length,
      averageScore: Math.round(totalScore / analyses.length),
      sentimentDistribution: {
        positive: sentimentCounts.positive || 0,
        neutral: sentimentCounts.neutral || 0,
        critical: sentimentCounts.critical || 0,
      },
      topPrinciples,
    };
  } catch (error) {
    console.error("Error getting analysis stats:", error);
    return {
      totalAnalyses: 0,
      averageScore: 0,
      sentimentDistribution: { positive: 0, neutral: 0, critical: 0 },
      topPrinciples: [],
    };
  }
};

export const analysisService = {
  getAnalysisById,
  getAnalysisByArticle,
  createAnalysis,
  getUserAnalyses,
  getFeedAnalyses,
  getTopScoringAnalyses,
  updateAnalysisSentiment,
  getAnalysisStats,
};
