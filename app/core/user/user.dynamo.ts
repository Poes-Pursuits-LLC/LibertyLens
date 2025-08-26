import { Entity } from "electrodb";
import { nanoid } from "nanoid";
import { getDynamoClient, createFormattedDate } from "../utils";
import { Resource } from "sst";

export const DynamoUser = () => {
  const client = getDynamoClient();
  const table = process.env.TABLE_NAME || Resource.Table.name;

  return new Entity(
    {
      model: {
        entity: "user",
        version: "1",
        service: "user",
      },
      attributes: {
        userId: {
          type: "string",
          required: true,
          default: () => nanoid().toLowerCase(),
        },
        email: {
          type: "string",
          required: true,
        },
        username: {
          type: "string",
          required: true,
        },
        preferences: {
          type: "map",
          required: true,
          default: () => ({
            analysisIntensity: "moderate",
            topics: [],
            emailNotifications: true,
            timezone: "UTC",
          }),
          properties: {
            analysisIntensity: {
              type: ["light", "moderate", "deep"] as const,
              required: true,
            },
            topics: {
              type: "list",
              items: {
                type: "string",
              },
              required: true,
            },
            emailNotifications: {
              type: "boolean",
              required: true,
            },
            timezone: {
              type: "string",
              required: true,
            },
          },
        },
        subscription: {
          type: ["free", "premium", "professional"] as const,
          required: true,
          default: "free",
        },
        isActive: {
          type: "boolean",
          required: true,
          default: true,
        },
        lastLoginAt: {
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
          default: () => "user",
        },
      },
      indexes: {
        primary: {
          pk: { field: "pk", composite: ["userId"] },
          sk: { field: "sk", composite: ["type"] },
        },
        byEmail: {
          index: "gsi1pk-gsi1sk-index",
          pk: { field: "gsi1pk", composite: ["email"] },
          sk: { field: "gsi1sk", composite: ["type"] },
        },
        byUsername: {
          index: "byUsername",
          pk: { field: "pk", composite: ["userId"] },
          sk: { field: "sk", composite: ["username"] },
        },
        bySubscription: {
          index: "bySubscription",
          pk: { field: "pk", composite: ["userId"] },
          sk: { field: "sk", composite: ["subscription"] },
        },
      },
    },
    {
      client,
      table,
    }
  );
};
