import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: "pulse.spec.ts",
  outputDir: "../../playwright/pulse-results",
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://localhost:3010",
    ...devices["Desktop Chrome"],
    locale: "en-US",
    colorScheme: "light",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3010/landing",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
