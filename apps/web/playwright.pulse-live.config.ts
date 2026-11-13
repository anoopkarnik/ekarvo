import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "pulse-live.spec.ts",
  outputDir: "../../playwright/pulse-live-results",
  workers: 1,
  retries: 0,
  timeout: 240000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:3010",
    ...devices["Desktop Chrome"],
    locale: "en-US",
    colorScheme: "light",
    screenshot: "only-on-failure",
    actionTimeout: 30000,
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3010/landing",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
