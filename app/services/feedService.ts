import { hc } from "hono/client";
import type { CreateFeedInput, Feed } from "~/core/feed/feed.model";
import type { AppType } from "~/server/main";

const getClient = () => {
  return hc<AppType>(process.env.SERVER_URL! || "");
};

export const feedService = {
  async getFeeds(userId: string): Promise<{ feeds: Feed[]; count: number }> {
    const client = getClient();
    const response = await client.feeds.$get({
      query: { userId },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feeds");
    }

    return await response.json();
  },

  async getFeedById(feedId: string, userId: string): Promise<Feed> {
    const client = getClient();
    const response = await (client.feeds as any)[feedId].$get({
      query: { userId },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feed");
    }

    return await response.json();
  },

  async createFeed(input: CreateFeedInput & { userId: string }): Promise<Feed> {
    const client = getClient();
    const { userId, ...feedInput } = input;
    const response = await client.feeds.$post({
      query: { userId },
      json: feedInput,
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error || "Failed to create feed");
    }

    return await response.json();
  },

  async updateFeed(
    feedId: string,
    updates: Partial<Feed> & { userId: string }
  ): Promise<Feed> {
    const client = getClient();
    const { userId, ...feedUpdates } = updates;
    const response = await (client.feeds as any)[feedId].$patch({
      query: { userId },
      json: feedUpdates,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update feed");
    }

    return await response.json();
  },

  async addSourcesToFeed(
    feedId: string,
    sources: string[],
    userId: string
  ): Promise<Feed> {
    return this.updateFeed(feedId, { sources, userId });
  },

  async deleteFeed(
    feedId: string,
    userId: string
  ): Promise<{ message: string }> {
    const client = getClient();
    const response = await (client.feeds as any)[feedId].$delete({
      query: { userId },
    });

    if (!response.ok) {
      throw new Error("Failed to delete feed");
    }

    return await response.json();
  },

  async refreshFeed(
    feedId: string,
    userId: string
  ): Promise<{ message: string; feedId: string; lastRefreshedAt: string }> {
    const client = getClient();
    const response = await (client.feeds as any)[feedId].refresh.$post({
      json: { userId },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to refresh feed");
    }

    return await response.json();
  },
};
