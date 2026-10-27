import { defineConfig, devices } from "@playwright/test";

// This runner starts Next directly, outside Turbo's environment filtering.
// eslint-disable-next-line turbo/no-undeclared-env-vars
const port = Number(process.env.EKARVO_TEST_PORT ?? 3010);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("EKARVO_TEST_PORT must be an integer between 1 and 65535");
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "../../playwright/test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "dark",
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
