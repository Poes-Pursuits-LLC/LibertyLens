import { describe, it, expect, vi, beforeEach } from "vitest";
import { testClient } from "hono/testing";
import { Hono } from "hono";
import { feedRouter } from "./feed.router";
import { feedService } from "~/core/feed/feed.service";

vi.mock("~/core/feed/feed.service", () => ({
  feedService: {
    getFeedById: vi.fn(),
    getUserFeeds: vi.fn(),
    createFeed: vi.fn(),
    updateFeed: vi.fn(),
    deleteFeed: vi.fn(),
    markFeedRefreshed: vi.fn(),
    toggleFeedStatus: vi.fn(),
  },
}));

vi.mock("../main", () => ({
  main: new Hono().route("/", feedRouter),
}));
import { main } from "../main";

const mockedFeedService = vi.mocked(feedService);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("/getFeed", () => {
  it("returns the feed for a valid feedId and matching userId", async () => {
    const client = testClient(main);
    const feedId = "feed-123";
    const userId = "user-1";
    const feed = { feedId, userId } as any;
    mockedFeedService.getFeedById.mockResolvedValue(feed);

    const response = await client.getFeed.$get({
      query: { feedId, userId },
    });

    expect(mockedFeedService.getFeedById).toHaveBeenCalledOnce();
    expect(mockedFeedService.getFeedById).toHaveBeenCalledWith(feedId);
    expect(await response.json()).toEqual({ feed });
  });

  it("returns 404 when the feed does not exist", async () => {
    const client = testClient(main);
    mockedFeedService.getFeedById.mockResolvedValue(null);

    const response = await client.getFeed.$get({
      query: { feedId: "missing", userId: "user-1" },
    });

    expect(response.status).toBe(404);
  });
});

describe("/getUserFeeds", () => {
  it("returns feeds for a user with count", async () => {
    const client = testClient(main);
    const userId = "user-1";
    const feeds = [
      { feedId: "a", userId } as any,
      { feedId: "b", userId } as any,
    ];
    mockedFeedService.getUserFeeds.mockResolvedValue(feeds as any);

    const response = await client.getUserFeeds.$get({
      query: { userId, onlyActive: "true" },
    });

    const body = await response.json();
    expect(mockedFeedService.getUserFeeds).toHaveBeenCalledWith(userId, true);
    expect(body).toEqual({ feeds, count: feeds.length });
  });

  it("returns 500 on service error", async () => {
    const client = testClient(main);
    mockedFeedService.getUserFeeds.mockRejectedValue(new Error("boom"));

    const response = await client.getUserFeeds.$get({
      query: { userId: "user-1", onlyActive: "false" },
    });

    expect(response.status).toBe(500);
  });
});

describe("/createFeed", () => {
  it("creates a feed and returns its id", async () => {
    const client = testClient(main);
    const userId = "user-1";
    const input = {
      userId,
      name: "My Feed",
      sources: ["source-1"],
    };
    mockedFeedService.createFeed.mockResolvedValue([
      { feedId: "new-feed-id", userId } as any,
      null,
    ]);

    const response = await client.createFeed.$post({ json: input });

    expect(mockedFeedService.createFeed).toHaveBeenCalledOnce();
    expect(mockedFeedService.createFeed).toHaveBeenCalledWith(userId, {
      name: "My Feed",
      sources: ["source-1"],
    });
    expect(await response.json()).toEqual({ feedId: "new-feed-id" });
  });

  it("returns 500 on service error", async () => {
    const client = testClient(main);
    mockedFeedService.createFeed.mockResolvedValue([null, new Error("err")]);

    const response = await client.createFeed.$post({
      json: { userId: "u1", name: "n", sources: ["s"] },
    });

    expect(response.status).toBe(500);
  });
});

describe("/updateFeed", () => {
  it("updates a feed and returns the feedId", async () => {
    const client = testClient(main);
    const feedId = "feed-1";
    const userId = "user-1";
    mockedFeedService.updateFeed.mockResolvedValue([
      { feedId } as any,
      null,
    ]);

    const response = await client.updateFeed.$post({
      json: {
        feedId,
        userId,
        updateFields: { name: "Updated" },
      },
    });

    expect(mockedFeedService.updateFeed).toHaveBeenCalledWith(feedId, userId, {
      name: "Updated",
    });
    expect(await response.json()).toEqual({ feedId });
  });

  it("returns 404 on not found or unauthorized", async () => {
    const client = testClient(main);
    mockedFeedService.updateFeed.mockResolvedValue([
      null,
      new Error("Feed not found or unauthorized"),
    ]);

    const response = await client.updateFeed.$post({
      json: { feedId: "x", userId: "u", updateFields: {} },
    });

    expect(response.status).toBe(404);
  });
});

describe("/deleteFeed", () => {
  it("deletes a feed", async () => {
    const client = testClient(main);
    mockedFeedService.deleteFeed.mockResolvedValue([{}, null]);

    const response = await client.deleteFeed.$delete({
      query: { feedId: "f1", userId: "u1" },
    });

    expect(mockedFeedService.deleteFeed).toHaveBeenCalledWith("f1", "u1");
    expect(await response.json()).toEqual({
      message: "Feed deleted successfully",
    });
  });

  it("returns 404 on not found or unauthorized", async () => {
    const client = testClient(main);
    mockedFeedService.deleteFeed.mockResolvedValue([
      null,
      new Error("not found"),
    ]);

    const response = await client.deleteFeed.$delete({
      query: { feedId: "f1", userId: "u1" },
    });

    expect(response.status).toBe(404);
  });
});

describe("/refreshFeed", () => {
  it("marks a feed refreshed and returns timestamp", async () => {
    const client = testClient(main);
    const feedId = "f1";
    const userId = "u1";
    mockedFeedService.getFeedById.mockResolvedValue({ feedId, userId } as any);
    mockedFeedService.markFeedRefreshed.mockResolvedValue([
      { feedId, lastRefreshedAt: "2025-01-01T00:00:00Z" } as any,
      null,
    ]);

    const response = await client.refreshFeed.$post({
      json: { feedId, userId },
    });

    expect(mockedFeedService.getFeedById).toHaveBeenCalledWith(feedId);
    expect(mockedFeedService.markFeedRefreshed).toHaveBeenCalledWith(feedId);
    expect(await response.json()).toEqual({
      message: "Feed refresh initiated",
      feedId,
      lastRefreshedAt: "2025-01-01T00:00:00Z",
    });
  });

  it("returns 404 when unauthorized", async () => {
    const client = testClient(main);
    mockedFeedService.getFeedById.mockResolvedValue({ feedId: "f1", userId: "other" } as any);

    const response = await client.refreshFeed.$post({
      json: { feedId: "f1", userId: "u1" },
    });

    expect(response.status).toBe(404);
  });
});

describe("/toggleFeedStatus", () => {
  it("toggles a feed's status and returns the updated feed", async () => {
    const client = testClient(main);
    mockedFeedService.toggleFeedStatus.mockResolvedValue([
      { feedId: "f1", isActive: true } as any,
      null,
    ]);

    const response = await client.toggleFeedStatus.$post({
      json: { feedId: "f1", userId: "u1" },
    });

    expect(mockedFeedService.toggleFeedStatus).toHaveBeenCalledWith("f1", "u1");
    expect(await response.json()).toEqual({ feed: { feedId: "f1", isActive: true } });
  });

  it("returns 404 on not found or unauthorized", async () => {
    const client = testClient(main);
    mockedFeedService.toggleFeedStatus.mockResolvedValue([
      null,
      new Error("unauthorized"),
    ]);

    const response = await client.toggleFeedStatus.$post({
      json: { feedId: "f1", userId: "u1" },
    });

    expect(response.status).toBe(404);
  });
});

