import type {} from "../.sst/platform/config";

export const secret = {
  WebUrl: new sst.Secret("WebUrl"),
  ServerUrl: new sst.Secret("ServerUrl"),
  ClerkSecretKey: new sst.Secret("ClerkSecretKey"),
  // CLERK_SECRET_KEY=sk_test_rAfEsnuTm7wxqykNAWl7f0czrNbzpjQGU1ZrBNhnQq
  ClerkPublishableKey: new sst.Secret("ClerkPublishableKey"),
  // VITE_CLERK_PUBLISHABLE_KEY=pk_test_b3JnYW5pYy1zcXVpZC0xMi5jbGVyay5hY2NvdW50cy5kZXYk
  Environment: new sst.Secret("Environment"),
};

export const allSecrets = Object.values(secret);
