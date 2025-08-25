/// <reference types="vitest/config" />

// import { sentryVitePlugin } from "@sentry/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // sentryVitePlugin({
    //   org: "roam-fish",
    //   project: "roam-fish",
    //   telemetry: false,
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    // }),
  ],
  test: {
    watch: false,
    teardownTimeout: 500,
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "unit-tests",
          include: ["./app/**/*.test.{ts,tsx}"],
          exclude: ["**/*.integration.test.ts"],
          environment: "jsdom",
          setupFiles: ["./app/test-setup.ts"],
          mockReset: true,
          globals: true,
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "ui-tests",
          include: ["./app/**/*.spec.tsx"],
          environment: "jsdom",
          setupFiles: ["./app/ui/ui-test-setup.ts"],
          mockReset: true,
          globals: true,
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "integration-tests",
          include: ["**/*.integration.test.ts"],
          globalSetup: "./app/integration/setup-integration.ts",
          testTimeout: 10000,
          hookTimeout: 60000,
          globals: true,
        },
      },
    ],
  },
  build: {
    sourcemap: "hidden",
  },
});
