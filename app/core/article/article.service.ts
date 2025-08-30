import { getTTL, handleAsync } from "../utils";
import { DynamoCache } from "../cache/cache.dynamo";
import { DynamoArticle } from "./article.dynamo";
import type {
  Article,
  CreateArticleInput,
  ArticleSearchParams,
} from "./article.model";

const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    const cacheKey = `article:${articleId}`;
    const cacheResult = await DynamoCache()
      .get({ cacheKey, type: "cache" })
      .go();

    if (cacheResult.data && cacheResult.data.cached) {
      return cacheResult.data.cached as Article;
    }

    const articleResult = await DynamoArticle()
      .get({ articleId, type: "article" })
      .go();

    if (articleResult.data) {
      await DynamoCache()
        .put({
          cacheKey,
          cached: articleResult.data,
          expireAt: getTTL(24), // Cache for 24 hours
        })
        .go();

      return articleResult.data as Article;
    }

    return null;
  } catch (error) {
    console.error("Error getting article by ID:", error);
    return null;
  }
};

const getArticleByUrl = async (
  originalUrl: string
): Promise<Article | null> => {
  try {
    const result = await DynamoArticle().find({ originalUrl }).go();

    return (result.data?.[0] as Article) || null;
  } catch (error) {
    console.error("Error getting article by URL:", error);
    return null;
  }
};

const createArticle = async (
  input: CreateArticleInput
): Promise<[Article | null, any]> => {
  try {
    const existing = await getArticleByUrl(input.originalUrl);
    if (existing) {
      return [existing, null];
    }

    const result = await DynamoArticle()
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
      .go({ response: "all_new" });

    return [result.data as Article, null];
  } catch (error) {
    return [null, error];
  }
};

const createArticlesBatch = async (
  articles: CreateArticleInput[]
): Promise<[Article[], any]> => {
  try {
    // Filter out articles that already exist
    const existingChecks = await Promise.all(
      articles.map((article) => getArticleByUrl(article.originalUrl))
    );

    const newArticles = articles.filter((_, index) => !existingChecks[index]);

    if (newArticles.length === 0) {
      return [[], null]; // All articles already exist
    }

    // ElectroDB batch operations
    const items = newArticles.map((article) => ({
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
    }));

    const savedArticles: Article[] = [];
    const results = await Promise.allSettled(
      items.map((item) => DynamoArticle().put(item).go({ response: "all_new" }))
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.data) {
        savedArticles.push(result.value.data as Article);
      } else if (result.status === "rejected") {
        console.error(
          `Failed to save article ${items[index].title}:`,
          result.reason
        );
      }
    });

    return [savedArticles, null];
  } catch (error) {
    console.error("Error creating articles batch:", error);
    return [[], error];
  }
};

const getArticlesBySource = async (
  sourceId: string,
  startDate?: string,
  endDate?: string,
  cursor?: string,
  limit = 10
): Promise<[{ articles: Article[]; cursor: string | null }, any]> => {
  try {
    let query = DynamoArticle().query.bySource({ sourceId });

    // Only apply where clause if there are date filters
    if (startDate || endDate) {
      query = query.where((attr, op) => {
        if (startDate && endDate) {
          return op.between(attr.publishedAt, startDate, endDate);
        } else if (startDate) {
          return op.gte(attr.publishedAt, startDate);
        } else if (endDate) {
          return op.lte(attr.publishedAt, endDate);
        }
        // This should never be reached due to the outer if condition
        return true;
      });
    }

    const result = await query.go({
      limit,
      cursor: cursor ? cursor : undefined,
    });

    return [
      {
        articles: (result.data || []) as Article[],
        cursor: result.cursor || null,
      },
      null,
    ];
  } catch (error) {
    console.error("Error getting articles by source:", error);
    return [
      {
        articles: [],
        cursor: null,
      },
      error,
    ];
  }
};

const getRecentArticles = async (
  hours = 24,
  cursor?: string,
  limit = 10
): Promise<[{ articles: Article[]; cursor: string | null }, any]> => {
  try {
    const startDate = new Date(
      Date.now() - hours * 60 * 60 * 1000
    ).toISOString();

    const result = await DynamoArticle()
      .find({ type: "article" })
      .where((attr, op) => op.gte(attr.publishedAt, startDate))
      .go({
        limit,
        cursor: cursor ? cursor : undefined,
      });

    return [
      {
        articles: (result.data || []) as Article[],
        cursor: result.cursor || null,
      },
      null,
    ];
  } catch (error) {
    console.error("Error getting recent articles:", error);
    return [
      {
        articles: [],
        cursor: null,
      },
      error,
    ];
  }
};

const searchArticles = async (
  params: ArticleSearchParams
): Promise<[{ articles: Article[]; cursor: string | null }, any]> => {
  try {
    const { sourceId, tags, startDate, endDate, cursor, limit = 10 } = params;

    if (sourceId) {
      return getArticlesBySource(sourceId, startDate, endDate, cursor, limit);
    }

    let query = DynamoArticle().find({ type: "article" });

    // Only apply where clause if there are date filters
    if (startDate || endDate) {
      query = query.where((attr, op) => {
        if (startDate && endDate) {
          return op.between(attr.publishedAt, startDate, endDate);
        } else if (startDate) {
          return op.gte(attr.publishedAt, startDate);
        } else if (endDate) {
          return op.lte(attr.publishedAt, endDate);
        }
        // This should never be reached due to the outer if condition
        return true;
      });
    }

    const result = await query.go({
      limit,
      cursor: cursor ? cursor : undefined,
    });

    let filteredArticles = (result.data || []) as Article[];
    if (tags && tags.length > 0) {
      filteredArticles = filteredArticles.filter((article) =>
        tags.some((tag) => article.tags.includes(tag))
      );
    }

    return [
      {
        articles: filteredArticles,
        cursor: result.cursor || null,
      },
      null,
    ];
  } catch (error) {
    console.error("Error searching articles:", error);
    return [
      {
        articles: [],
        cursor: null,
      },
      error,
    ];
  }
};

const updateArticleTags = async (
  articleId: string,
  tags: string[]
): Promise<[Article | null, any]> => {
  try {
    // Clear cache
    await DynamoCache()
      .delete({ cacheKey: `article:${articleId}`, type: "cache" })
      .go();

    const result = await DynamoArticle()
      .update({ articleId, type: "article" })
      .set({ tags })
      .go({ response: "all_new" });

    return [result.data as Article, null];
  } catch (error) {
    console.error("Error updating article tags:", error);
    return [null, error];
  }
};

const deleteArticle = async (
  articleId: string
): Promise<[Article | null, any]> => {
  try {
    // Clear cache
    await DynamoCache()
      .delete({ cacheKey: `article:${articleId}`, type: "cache" })
      .go();

    const result = await DynamoArticle()
      .delete({ articleId, type: "article" })
      .go({ response: "all_old" });

    return [result.data as Article, null];
  } catch (error) {
    console.error("Error deleting article:", error);
    return [null, error];
  }
};

const saveFetchedArticles = async (
  sourceId: string,
  articles: CreateArticleInput[]
): Promise<
  [{ saved: number; total: number; errors: string[] } | null, any]
> => {
  try {
    if (articles.length === 0) {
      return [{ saved: 0, total: 0, errors: [] }, null];
    }

    const [savedArticles, error] = await createArticlesBatch(articles);

    if (error) {
      return [null, error];
    }

    const stats = {
      saved: Array.isArray(savedArticles) ? savedArticles.length : 0,
      total: articles.length,
      errors: [] as string[],
    };

    return [stats, null];
  } catch (error) {
    console.error("Error saving fetched articles:", error);
    return [null, error];
  }
};

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
  saveFetchedArticles,
};
