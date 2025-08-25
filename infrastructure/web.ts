import { secret } from "./secret";
import { server } from "./server";
import { isProduction } from "./stage";

new sst.aws.React("Web", {
  environment: {
    ENVIRONMENT: secret.Environment.value,
    SERVER_URL: server.url,
    VITE_WEB_URL: secret.WebUrl.value,
    VITE_CLERK_PUBLISHABLE_KEY: secret.ClerkPublishableKey.value,
    CLERK_SECRET_KEY: secret.ClerkSecretKey.value,
  },
  ...(isProduction && {
    domain: {
      name: "roam.fish",
      redirects: ["www.roam.fish"],
    },
  }),
});
