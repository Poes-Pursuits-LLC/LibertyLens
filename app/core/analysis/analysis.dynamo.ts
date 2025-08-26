import { Entity } from "electrodb";
import { nanoid } from "nanoid";
import { getDynamoClient, createFormattedDate } from "../utils";
import { Resource } from "sst";

export const DynamoAnalysis = () => {
  const client = getDynamoClient();
  const table = process.env.TABLE_NAME || Resource.Table.name;

  return new Entity(
    {
      model: {
        entity: "analysis",
        version: "1",
        service: "analysis",
      },
      attributes: {
        analysisId: {
          type: "string",
          required: true,
          default: () => nanoid().toLowerCase(),
        },
        articleId: {
          type: "string",
          required: true,
        },
        feedId: {
          type: "string",
          required: true,
        },
        userId: {
          type: "string",
          required: true,
        },
        libertarianScore: {
          type: "number",
          required: true,
        },
        keyPoints: {
          type: "list",
          required: true,
          items: {
            type: "string",
          },
        },
        principles: {
          type: "list",
          required: true,
          items: {
            type: "map",
            properties: {
              name: {
                type: "string",
                required: true,
              },
              relevance: {
                type: ["high", "medium", "low"] as const,
                required: true,
              },
              explanation: {
                type: "string",
                required: true,
              },
              examples: {
                type: "list",
                required: false,
                items: {
                  type: "string",
                },
              },
            },
          },
        },
        summary: {
          type: "string",
          required: true,
        },
        fullAnalysis: {
          type: "string",
          required: true,
        },
        sentiment: {
          type: ["positive", "neutral", "critical"] as const,
          required: true,
        },
        recommendations: {
          type: "list",
          required: true,
          items: {
            type: "string",
          },
        },
        counterArguments: {
          type: "list",
          required: false,
          items: {
            type: "string",
          },
        },
        sources: {
          type: "list",
          required: false,
          items: {
            type: "string",
          },
        },
        metadata: {
          type: "map",
          required: true,
          properties: {
            analysisVersion: {
              type: "string",
              required: true,
            },
            processingTime: {
              type: "number",
              required: true,
            },
            wordCount: {
              type: "number",
              required: true,
            },
            confidence: {
              type: "number",
              required: true,
            },
          },
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
          default: () => "analysis",
        },
        lsi1sk: {
          type: "string",
          required: true,
          default: () => "analysis",
        },
        lsi2sk: {
          type: "string",
          required: true,
          default: () => "analysis",
        },
        lsi3sk: {
          type: "string",
          required: true,
          default: () => "analysis",
        },
      },
      indexes: {
        primary: {
          pk: { field: "pk", composite: ["analysisId"] },
          sk: { field: "sk", composite: ["type"] },
        },
        byArticle: {
          index: "gsi1pk-gsi1sk-index",
          pk: { field: "gsi1pk", composite: ["articleId"] },
          sk: { field: "gsi1sk", composite: ["createdAt"] },
        },
        byFeed: {
          index: "byFeed",
          pk: { field: "pk", composite: ["analysisId"] },
          sk: { field: "lsi1sk", composite: ["feedId"] },
        },
        byUser: {
          index: "byUser",
          pk: { field: "pk", composite: ["analysisId"] },
          sk: { field: "lsi2sk", composite: ["userId"] },
        },
        byScore: {
          index: "byScore",
          pk: { field: "pk", composite: ["analysisId"] },
          sk: { field: "lsi3sk", composite: ["type", "libertarianScore"] },
        },
      },
    },
    {
      client,
      table,
    }
  );
};
