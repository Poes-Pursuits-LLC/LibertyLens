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
    const secret = {
      WebUrl: new sst.Secret("WebUrl"),
      ServerUrl: new sst.Secret("ServerUrl"),
      ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
      // CLERK_SECRET_KEY=sk_test_rAfEsnuTm7wxqykNAWl7f0czrNbzpjQGU1ZrBNhnQq
      ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
      // VITE_CLERK_PUBLISHABLE_KEY=pk_test_b3JnYW5pYy1zcXVpZC0xMi5jbGVyay5hY2NvdW50cy5kZXYk
      Environment: new sst.Secret("Environment"),
    };

    new sst.aws.React("MyWeb", {
      environment: {
        ENVIRONMENT: secret.Environment.value,
        SERVER_URL: secret.ServerUrl.value,
        VITE_WEB_URL: secret.WebUrl.value,
        VITE_CLERK_PUBLISHABLE_KEY: secret.ClerkPublishableKey.value,
        CLERK_SECRET_KEY: secret.ClerkSecretKey.value,
      },
    });
  },
});
