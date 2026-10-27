import { expect, test } from "@playwright/test";

export const MARKETING_ROUTES: readonly string[] = [
  "/landing",
  "/landing/products",
  "/landing/products/operations-os",
  "/landing/products/autonomous-execution",
  "/landing/approach",
  "/landing/platform",
  "/landing/trust",
  "/landing/company",
  "/landing/contact",
  "/landing/demo",
];

const ASSET_TYPES = new Set(["stylesheet", "script", "image", "font", "media"]);

for (const route of MARKETING_ROUTES) {
  test(`all marketing routes: ${route}`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const failedAssets: string[] = [];

    page.on("requestfailed", (request) => {
      if (
        new URL(request.url()).origin === origin &&
        ASSET_TYPES.has(request.resourceType())
      ) {
        failedAssets.push(`${request.url()}: ${request.failure()?.errorText}`);
      }
    });
    page.on("response", (response) => {
      if (
        new URL(response.url()).origin === origin &&
        ASSET_TYPES.has(response.request().resourceType()) &&
        response.status() >= 400
      ) {
        failedAssets.push(`${response.url()}: HTTP ${response.status()}`);
      }
    });

    const response = await page.goto(route, { waitUntil: "load" });

    expect(response, `${route} must return a document`).not.toBeNull();
    expect(response!.status(), `${route} must return HTTP 200`).toBe(200);
    expect(response!.headers()["content-type"]).toContain("text/html");
    expect(
      response!.request().redirectedFrom(),
      `${route} must not redirect`,
    ).toBeNull();
    expect(new URL(page.url()).pathname).toBe(route);
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    // Exercise lazy assets as well as those fetched during the initial load.
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await page.waitForLoadState("networkidle");

    expect(failedAssets, `${route} must load its same-origin assets`).toEqual(
      [],
    );
  });
}
