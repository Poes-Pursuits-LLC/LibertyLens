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
    new sst.aws.React("MyWeb");
  },
});
