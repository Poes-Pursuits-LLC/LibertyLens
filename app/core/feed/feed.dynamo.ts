import { Entity } from "electrodb";
import { nanoid } from "nanoid";
import { getDynamoClient, createFormattedDate } from "../utils";
import { defaultAnalysisSettings } from "./feed.model";
import { Resource } from "sst";

export const DynamoFeed = () => {
  const client = getDynamoClient();
  const table = process.env.TABLE_NAME || Resource.Table.name;

  return new Entity(
    {
      model: {
        entity: "feed",
        version: "1",
        service: "feed",
      },
      attributes: {
        feedId: {
          type: "string",
          required: true,
          default: () => nanoid().toLowerCase(),
        },
        userId: {
          type: "string",
          required: true,
        },
        name: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
          required: false,
        },
        sources: {
          type: "list",
          required: true,
          default: [],
          items: {
            type: "map",
            properties: {
              sourceId: {
                type: "string",
                required: true,
              },
              name: {
                type: "string",
                required: true,
              },
              url: {
                type: "string",
                required: true,
              },
              type: {
                type: ["rss", "api"] as const,
                required: true,
              },
              enabled: {
                type: "boolean",
                required: true,
                default: true,
              },
            },
          },
        },
        topics: {
          type: "list",
          required: true,
          default: [],
          items: {
            type: "string",
          },
        },
        keywords: {
          type: "list",
          required: true,
          default: [],
          items: {
            type: "string",
          },
        },
        excludeKeywords: {
          type: "list",
          required: false,
          default: [],
          items: {
            type: "string",
          },
        },
        analysisSettings: {
          type: "map",
          required: true,
          default: defaultAnalysisSettings,
          properties: {
            intensity: {
              type: ["light", "moderate", "deep"] as const,
              required: true,
            },
            includePrinciples: {
              type: "list",
              required: true,
              items: {
                type: "string",
              },
            },
            focusAreas: {
              type: "list",
              required: true,
              items: {
                type: "string",
              },
            },
            includeSources: {
              type: "boolean",
              required: true,
            },
            includeCounterArguments: {
              type: "boolean",
              required: true,
            },
          },
        },
        isActive: {
          type: "boolean",
          required: true,
          default: true,
        },
        refreshInterval: {
          type: "number",
          required: true,
          default: 60, // 60 minutes default
        },
        lastRefreshedAt: {
          type: "string",
          required: false,
        },
        createdAt: {
          type: "string",
          required: true,
          default: () => createFormattedDate(),
        },
        updatedAt: {
          type: "string",
          required: true,
          default: () => createFormattedDate(),
          set: () => createFormattedDate(),
        },
        type: {
          type: "string",
          required: true,
          default: () => "feed",
        },
      },
      indexes: {
        primary: {
          pk: { field: "pk", composite: ["feedId"] },
          sk: { field: "sk", composite: ["type"] },
        },
        byUser: {
          index: "gsi1pk-gsi1sk-index",
          pk: { field: "gsi1pk", composite: ["userId"] },
          sk: { field: "gsi1sk", composite: ["createdAt"] },
        },
      },
    },
    {
      client,
      table,
    }
  );
};
