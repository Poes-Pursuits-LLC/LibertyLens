import { getTTL, handleAsync } from "../utils";
import { DynamoCache } from "../cache/cache.dynamo";
import { DynamoNewsSource } from "./news-source.dynamo";
import type {
  NewsSource,
  CreateNewsSourceInput,
  UpdateNewsSourceInput,
  SourceCategory,
} from "./news-source.model";
import { defaultNewsSources } from "./news-source.model";

const getNewsSourceById = async (sourceId: string) => {
  const cacheKey = `news-source:${sourceId}`;
  const { data: cached } = await DynamoCache()
    .get({ cacheKey, type: "cache" })
    .go();
  if (cached?.cached) return cached.cached as NewsSource;

  const { data: source } = await DynamoNewsSource()
    .get({ sourceId, entityType: "news-source" })
    .go();

  if (source) {
    await DynamoCache()
      .put({
        cacheKey,
        cached: source,
        expireAt: getTTL(24), // Cache for 24 hours
        type: "cache",
      })
      .go();
  }

  return source || null;
};

const getPublicNewsSources = async (category?: SourceCategory) => {
  const cacheKey = `public-sources:${category || "all"}`;
  const { data: cached } = await DynamoCache()
    .get({ cacheKey, type: "cache" })
    .go();
  if (cached?.cached) return cached.cached as NewsSource[];

  let sources: NewsSource[];

  if (category) {
    const { data } = await DynamoNewsSource()
      .query.byCategory({ category })
      .go();
    sources = data.filter((s) => s?.isPublic) as NewsSource[];
  } else {
    const { data } = await DynamoNewsSource().find({ isPublic: true }).go();
    sources = data.filter((s) => s?.isPublic) as NewsSource[];
  }

  await DynamoCache()
    .put({
      cacheKey,
      cached: sources,
      expireAt: getTTL(6), // Cache for 6 hours
    })
    .go();

  return sources;
};

const getUserNewsSources = async (userId: string) => {
  const cacheKey = `user-sources:${userId}`;
  const { data: cached } = await DynamoCache()
    .get({ cacheKey, type: "cache" })
    .go();
  if (cached?.cached) return cached.cached as NewsSource[];

  const { data: sources } = await DynamoNewsSource().scan.go();

  const userSources = sources.filter(
    (s) => s?.addedByUserId === userId
  ) as NewsSource[];

  await DynamoCache()
    .put({
      cacheKey,
      cached: userSources,
      expireAt: getTTL(1), // Cache for 1 hour
    })
    .go();

  return userSources;
};

const createNewsSource = async (
  input: CreateNewsSourceInput & { userId?: string }
) => {
  const newsSourceData = {
    name: input.name,
    description: input.description,
    url: input.url,
    type: input.type,
    category: input.category,
    logoUrl: input.logoUrl,
    fetchConfig: input.fetchConfig,
    tags: input.tags || [],
    addedByUserId: input.userId || undefined,
    isPublic: !input.userId,
    isActive: true,
  };

  const [source, error] = await handleAsync(
    DynamoNewsSource().put(newsSourceData).go()
  );

  if (source?.data) {
    await Promise.all(
      [
        DynamoCache()
          .delete({ cacheKey: `public-sources:all`, type: "cache" })
          .go(),
        DynamoCache()
          .delete({
            cacheKey: `public-sources:${input.category}`,
            type: "cache",
          })
          .go(),
        input.userId &&
          DynamoCache()
            .delete({ cacheKey: `user-sources:${input.userId}`, type: "cache" })
            .go(),
      ].filter(Boolean)
    );
  }

  return [source?.data || null, error];
};

const updateNewsSource = async (
  sourceId: string,
  updates: UpdateNewsSourceInput,
  userId?: string
) => {
  // Verify ownership if userId provided
  if (userId) {
    const existing = await getNewsSourceById(sourceId);
    if (
      !existing ||
      (existing.addedByUserId && existing.addedByUserId !== userId)
    ) {
      return [null, new Error("Source not found or unauthorized")];
    }
  }

  // Clear caches
  await Promise.all(
    [
      DynamoCache()
        .delete({ cacheKey: `news-source:${sourceId}`, type: "cache" })
        .go(),
      DynamoCache()
        .delete({ cacheKey: `public-sources:all`, type: "cache" })
        .go(),
      userId &&
        DynamoCache()
          .delete({ cacheKey: `user-sources:${userId}`, type: "cache" })
          .go(),
    ].filter(Boolean)
  );

  const [source, error] = await handleAsync(
    DynamoNewsSource()
      .update({ sourceId, entityType: "news-source" })
      .set(updates)
      .go({ response: "all_new" })
  );

  return [source?.data || null, error];
};

const markFetchSuccess = async (sourceId: string) => {
  await DynamoCache()
    .delete({ cacheKey: `news-source:${sourceId}`, type: "cache" })
    .go();

  const [source] = await handleAsync(
    DynamoNewsSource()
      .update({ sourceId, entityType: "news-source" })
      .set({
        reliability: {
          lastSuccessfulFetch: new Date().toISOString(),
          failureCount: 0,
          score: 100,
        },
      })
      .go({ response: "all_new" })
  );

  return source?.data || null;
};

const markFetchFailure = async (sourceId: string, error: string) => {
  await DynamoCache()
    .delete({ cacheKey: `news-source:${sourceId}`, type: "cache" })
    .go();

  const current = await getNewsSourceById(sourceId);
  if (!current) return null;

  const newFailureCount = (current.reliability.failureCount || 0) + 1;
  const newScore = Math.max(0, 100 - newFailureCount * 10);

  const [source] = await handleAsync(
    DynamoNewsSource()
      .update({ sourceId, entityType: "news-source" })
      .set({
        reliability: {
          ...current.reliability,
          lastFailedFetch: new Date().toISOString(),
          failureCount: newFailureCount,
          score: newScore,
        },
      })
      .go({ response: "all_new" })
  );

  if (newScore <= 30) {
    await updateNewsSource(sourceId, { isActive: false });
  }

  return source || null;
};

const getActiveSourcesForFetching = async (limit = 50) => {
  console.log("=== getActiveSourcesForFetching START ===");
  console.log(`Querying database for active sources with limit: ${limit}`);

  const { data } = await DynamoNewsSource()
    .find({ isActive: true })
    .go({ limit });

  console.log(
    `Database query returned ${data.length} sources with isActive: true`
  );
  console.log("Database results before reliability filtering:");
  data.forEach((source, index) => {
    console.log(`DB source ${index + 1}:`, {
      sourceId: source.sourceId,
      name: source.name,
      isActive: source.isActive,
      reliabilityScore: source.reliability?.score,
      failureCount: source.reliability?.failureCount,
      category: source.category,
    });
  });

  const activeSources = data.filter((s: any) => s?.reliability?.score >= 50);

  console.log(
    `After reliability filtering (score >= 50): ${activeSources.length} sources`
  );
  console.log("Sources after reliability filtering:");
  activeSources.forEach((source, index) => {
    console.log(`Filtered source ${index + 1}:`, {
      sourceId: source.sourceId,
      name: source.name,
      isActive: source.isActive,
      reliabilityScore: source.reliability?.score,
      failureCount: source.reliability?.failureCount,
      category: source.category,
    });
  });

  console.log("=== getActiveSourcesForFetching END ===");
  return activeSources;
};

const initializeDefaultSources = async () => {
  const existingPublicSources = await getPublicNewsSources();
  const existingNames = new Set(existingPublicSources.map((s) => s.name));

  const sourcesToCreate = defaultNewsSources.filter(
    (source) => !existingNames.has(source.name!)
  );

  if (sourcesToCreate.length === 0) {
    return { created: 0, message: "All default sources already exist" };
  }

  const createPromises = sourcesToCreate.map((source) =>
    createNewsSource({
      name: source.name!,
      description: source.description,
      url: source.url!,
      type: source.type!,
      category: source.category!,
      tags: source.tags,
    })
  );

  const results = await Promise.all(createPromises);
  const successCount = results.filter(([data]) => data !== null).length;

  return {
    created: successCount,
    message: `Created ${successCount} out of ${sourcesToCreate.length} default sources`,
  };
};

const deleteNewsSource = async (sourceId: string, userId?: string) => {
  if (userId) {
    const existing = await getNewsSourceById(sourceId);
    if (
      !existing ||
      (existing.addedByUserId && existing.addedByUserId !== userId)
    ) {
      return [null, new Error("Source not found or unauthorized")];
    }
  }

  await Promise.all(
    [
      DynamoCache()
        .delete({ cacheKey: `news-source:${sourceId}`, type: "cache" })
        .go(),
      DynamoCache()
        .delete({ cacheKey: `public-sources:all`, type: "cache" })
        .go(),
      userId &&
        DynamoCache()
          .delete({ cacheKey: `user-sources:${userId}`, type: "cache" })
          .go(),
    ].filter(Boolean)
  );

  const [result, error] = await handleAsync(
    DynamoNewsSource().delete({ sourceId, entityType: "news-source" }).go()
  );

  return [result?.data || null, error];
};

const recordFetchSuccess = async (sourceId: string) => {
  return markFetchSuccess(sourceId);
};

const recordFetchFailure = async (sourceId: string, error: string) => {
  return markFetchFailure(sourceId, error);
};

export const newsSourceService = {
  getNewsSourceById,
  getPublicNewsSources,
  getUserNewsSources,
  createNewsSource,
  updateNewsSource,
  markFetchSuccess,
  markFetchFailure,
  getActiveSourcesForFetching,
  initializeDefaultSources,
  deleteNewsSource,
  recordFetchSuccess,
  recordFetchFailure,
};
