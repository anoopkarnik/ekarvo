import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
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

const PUBLIC_ROUTES = [
  ...MARKETING_ROUTES,
  "/landing/legal/privacy-policy",
  "/landing/legal/terms-of-service",
  "/landing/legal/cancellation-refund-policies",
  "/landing/legal/contact-us",
  "/sign-in",
];

test("complete deduplicated internal graph metadata hashes queries and downloads", async ({
  page,
  baseURL,
}, testInfo) => {
  test.setTimeout(120000);
  const origin = new URL(baseURL!).origin;
  const links = new Set<string>(),
    documents = new Map<string, string>(),
    timings: unknown[] = [],
    errors: string[] = [],
    failed: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (new URL(r.url()).origin === origin && r.status() >= 400)
      failed.push(`${r.status()} ${r.url()}`);
  });
  page.on("requestfailed", (r) => {
    if (
      new URL(r.url()).origin === origin &&
      r.failure()?.errorText !== "net::ERR_ABORTED"
    )
      failed.push(`${r.url()} ${r.failure()?.errorText}`);
  });
  for (const route of PUBLIC_ROUTES) {
    const start = Date.now();
    expect(
      (await page.goto(route, { waitUntil: "domcontentloaded" }))!.status(),
    ).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${route}$`),
    );
    timings.push({
      route,
      headingVisibleMs: Date.now() - start,
      ...(await page.evaluate(() => {
        const n = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        return { dclMs: n.domContentLoadedEventEnd, responseMs: n.responseEnd };
      })),
    });
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((a) =>
        a.map((e) => (e as HTMLAnchorElement).getAttribute("href")!),
      ))
      if (href.startsWith("/") || href.startsWith("#"))
        links.add(new URL(href, page.url()).href);
  }
  for (const href of [...links].sort()) {
    const url = new URL(href);
    if (url.origin !== origin) continue;
    const doc = new URL(url);
    doc.hash = "";
    if (!documents.has(doc.href)) {
      const r = await page.request.get(doc.href);
      expect(r.status(), href).toBe(200);
      documents.set(doc.href, await r.text());
      await r.dispose();
    }
    if (url.hash)
      expect(
        await page.evaluate(
          ({ body, hash }) =>
            new DOMParser()
              .parseFromString(body, "text/html")
              .getElementById(decodeURIComponent(hash.slice(1))) !== null,
          { body: documents.get(doc.href)!, hash: url.hash },
        ),
        href,
      ).toBe(true);
  }
  const evidence = testInfo.outputPath("route-graph-latency-network.json");
  await writeFile(
    evidence,
    JSON.stringify(
      {
        routes: PUBLIC_ROUTES,
        links: [...links].sort(),
        documents: documents.size,
        timings,
        errors,
        failed,
      },
      null,
      2,
    ),
  );
  await testInfo.attach("route-graph-latency-network", {
    path: evidence,
    contentType: "application/json",
  });
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

for (const width of [1440, 768, 375])
  test(`full document accessibility reflow and targets at ${width}`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await page.getByRole("heading", { level: 1 }).waitFor();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(
        axe.violations,
        `${route}: ${JSON.stringify(axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
      for (const target of await page
        .locator(
          ".site-header a,.site-header summary,.site-footer a,main button,main summary,.product-anchor-nav a",
        )
        .all()) {
        if (await target.isVisible()) {
          const box = await target.boundingBox();
          expect(
            box!.width,
            `${route}: ${await target.textContent()}`,
          ).toBeGreaterThanOrEqual(44);
          expect(
            box!.height,
            `${route}: ${await target.textContent()}`,
          ).toBeGreaterThanOrEqual(44);
        }
      }
    }
    if (width < 1000) {
      await page.goto("/landing/products");
      const summary = page.locator(".mobile-menu summary");
      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".mobile-menu")).toHaveAttribute("open", "");
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Products", exact: true })
        .focus();
      await page.keyboard.press("Escape");
      await expect(summary).toBeFocused();
      await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
      await expect(summary).toHaveCSS("outline-style", "solid");
      await expect(summary).toHaveCSS("font-size", "14px");
    }
  });

test("forced graphics failure leaves complete static story and source artwork", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto("/landing");
  await expect(page.locator("[data-ek-film]")).not.toHaveClass(/is-film/);
  for (const id of [
    "opening",
    "fracture",
    "pulse",
    "authority",
    "drive",
    "evidence",
    "outcome",
  ])
    await expect(page.locator(`#${id} h1,#${id} h2`)).toBeVisible();
  await page.goto("/landing/products/operations-os");
  await expect(page.locator(".film-study-poster").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "See the whole operation." }),
  ).toBeVisible();
});

test("JavaScript-disabled full documents keep narrative links and accessible fallbacks", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
    baseURL,
  });
  const page = await context.newPage();
  try {
    for (const route of [
      ...MARKETING_ROUTES,
      "/landing/legal/privacy-policy#delete",
    ]) {
      expect((await page.goto(route))!.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      await expect(page.locator(".mobile-menu summary")).toBeVisible();
      await page.locator(".mobile-menu summary").click();
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
      await page.locator(".mobile-menu summary").click();
      const html = await page.evaluate(() => {
        const root = document.documentElement.cloneNode(true) as HTMLElement;
        root.querySelectorAll("script").forEach((e) => e.remove());
        root.querySelectorAll("noscript").forEach((e) => {
          const d = document.createElement("div");
          d.append(...Array.from(e.childNodes));
          e.replaceWith(d);
        });
        return root.outerHTML;
      });
      const auditContext = await browser.newContext({
        viewport: { width: 375, height: 812 },
      });
      const audit = await auditContext.newPage();
      try {
        await audit.setContent(
          html.replace("<head>", `<head><base href="${baseURL}/">`),
        );
        await audit.evaluate(() => document.fonts.ready);
        const results = await new AxeBuilder({ page: audit }).analyze();
        expect(results.violations, route).toEqual([]);
      } finally {
        await auditContext.close();
      }
    }
  } finally {
    await context.close();
  }
});

test("source footer typography survives editorial paragraph defaults", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/landing/products");
  await expect(page.locator(".footer-bottom p")).toHaveCSS("font-size", "14px");
  await expect(page.locator(".footer-bottom p")).toHaveCSS(
    "line-height",
    "22.4px",
  );
  await expect(page.locator(".footer-bottom p")).toHaveCSS(
    "margin-bottom",
    "0px",
  );
  for (const label of await page.locator(".footer-label").all())
    await expect(label).toHaveCSS("color", "rgb(17, 19, 24)");
});
