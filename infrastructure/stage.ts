import type {} from "../.sst/platform/config";

export const isProduction = Boolean($app.stage === "production");
