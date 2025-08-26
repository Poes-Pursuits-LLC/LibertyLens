import { Entity } from "electrodb";
import { getDynamoClient, createFormattedDate } from "../utils";
import { Resource } from "sst";

export const DynamoCache = () => {
  const client = getDynamoClient();
  const table = process.env.TABLE_NAME || Resource.Table.name;

  return new Entity(
    {
      model: {
        entity: "cache",
        version: "1",
        service: "cache",
      },
      attributes: {
        cacheKey: {
          type: "string",
          required: true,
        },
        cached: {
          type: "any",
          required: true,
        },
        expireAt: {
          type: "number",
          required: true,
        },
        createdAt: {
          type: "string",
          required: true,
          default: () => createFormattedDate(),
        },
        type: {
          type: "string",
          required: true,
          default: () => "cache",
        },
      },
      indexes: {
        primary: {
          pk: { field: "pk", composite: ["cacheKey"] },
          sk: { field: "sk", composite: ["type"] },
        },
      },
    },
    {
      client,
      table,
    }
  );
};
