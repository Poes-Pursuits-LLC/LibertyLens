/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "liberty-lens",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile:
            input?.stage === "local" ? "liberty-lens-dev" : "liberty-lens-prod",
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    // const isProduction = Boolean($app.stage === "production");

    const secret = {
      WebUrl: new sst.Secret("WebUrl"),
      ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
      ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
      Environment: new sst.Secret("Environment"),
    };

    const table = new sst.aws.Dynamo("Table", {
      fields: {
        pk: "string",
        sk: "string",
        gsi1pk: "string",
        gsi1sk: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: {
        "gsi1pk-gsi1sk-index": { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
      },
      ttl: "ttl",
    });

    const server = new sst.aws.Function("Server", {
      url: true,
      handler: "app/server/index.handler",
      link: [...Object.values(secret), table],
      timeout: "30 seconds",
    });

    new sst.aws.Cron("FetchNewsCron", {
      schedule: "rate(5 minutes)",
      job: {
        handler: "app/functions/fetch-news.handler",
        link: [...Object.values(secret), table],
        timeout: "5 minutes",
        memory: "512 MB",
      },
    });

    new sst.aws.React("Web", {
      environment: {
        ENVIRONMENT: secret.Environment.value,
        SERVER_URL: server.url,
        VITE_WEB_URL: secret.WebUrl.value,
        VITE_CLERK_PUBLISHABLE_KEY: secret.ClerkPublishableKey.value,
        CLERK_SECRET_KEY: secret.ClerkSecretKey.value,
      },
      // ...(isProduction && {
      //   domain: {
      //     name: "roam.fish",
      //     redirects: ["www.roam.fish"],
      //   },
      // }),
    });
  },
});
