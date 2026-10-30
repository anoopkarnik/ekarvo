import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.setTimeout(180_000);

test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

test("rapid story commands honor the latest requested chapter and retain visible focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/landing", { waitUntil: "domcontentloaded" });
  const film = page.locator("[data-ek-film]");
  test.setTimeout(90_000);
  await expect(film).toHaveClass(/is-film/, { timeout: 45_000 });
  await page.locator("[data-ek-next]").focus();
  // Dispatch inside one frame: scroll position has not caught up with the requested destination.
  await page.locator("[data-ek-next]").evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click(); });
  await expect(page.locator('[data-ek-rail="3"]')).toHaveAttribute("aria-current", "location");
  await page.locator('[data-ek-rail="5"]').evaluate((link: HTMLAnchorElement) => link.click());
  await page.locator("[data-ek-prev]").evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(page.locator('[data-ek-rail="3"]')).toHaveAttribute("aria-current", "location");
  await page.locator('[data-ek-rail="1"]').evaluate((link: HTMLAnchorElement) => link.click());
  await page.locator('[data-ek-rail="4"]').evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.locator('[data-ek-rail="4"]')).toHaveAttribute("aria-current", "location");
  await expect(page.locator("[data-ek-next]")).toBeFocused();
  await expect(page.locator("[data-ek-next]")).toBeInViewport();
});

test("homepage banner Products leads to both product pages and preserves auth/legal journeys", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/landing", { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Products" }).click();
  await expect(page).toHaveURL(/\/landing\/products$/);
  await page.locator(".product-carousel").getByRole("link", { name: /Explore Ekarvo Pulse/ }).click();
  await expect(page).toHaveURL(/\/landing\/products\/operations-os$/);
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Products" }).click();
  await page.getByRole("button", { name: "Next product" }).click();
  await page.locator(".product-carousel").getByRole("link", { name: /Explore Ekarvo Drive/ }).click();
  await expect(page).toHaveURL(/\/landing\/products\/autonomous-execution$/);
  await page.locator(".header-login").click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Trust", exact: true }).click();
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page).toHaveURL(/\/landing\/legal\/privacy-policy$/);
  await expect(page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link")).toHaveCount(5);
  expect(errors).toEqual([]);
});

test("marketing pages share a working keyboard skip target and full-document landmarks/contrast", async ({ page }) => {
  for (const route of ["products", "products/operations-os", "products/autonomous-execution", "contact", "legal/privacy-policy"]) {
    await page.goto(`/landing/${route}`, { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
  }
});

test("without JavaScript every story chapter and primary product path is available", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/landing", { waitUntil: "domcontentloaded" });
    for (const title of ["Make ambition operational.", "Work breaks at the handoff.", "See the whole operation.", "Intelligence is not authority.", "Give action a route.", "A result needs proof.", "See it through."]) {
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
    await page.getByRole("link", { name: "Explore Ekarvo Pulse", exact: true }).click();
    await expect(page).toHaveURL(/\/landing\/products\/operations-os$/);
    await page.goto("/landing", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Explore Ekarvo Drive", exact: true }).click();
    await expect(page).toHaveURL(/\/landing\/products\/autonomous-execution$/);
  } finally { await context.close(); }
});


test("reduced motion exposes the complete story and route actions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/landing", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-ek-film]")).not.toHaveClass(/is-film/);
  for (const chapter of ["opening", "fracture", "pulse", "authority", "drive", "evidence", "outcome"]) {
    await expect(page.locator(`#${chapter} h1, #${chapter} h2`)).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Explore Ekarvo Pulse", exact: true })).toHaveAttribute("tabindex", "0");
  await expect(page.getByRole("link", { name: "Explore Ekarvo Drive", exact: true })).toHaveAttribute("tabindex", "0");
});

test("Home interrupts a pending chapter even while Next keeps focus", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/landing", { waitUntil: "domcontentloaded" });
  const film = page.locator("[data-ek-film]");
  await expect(film).toHaveClass(/is-film/, { timeout: 45_000 });
  await expect(film).toHaveClass(/is-webgl/, { timeout: 45_000 });
  // Establish an intermediate chapter first. Observing a tiny animation window
  // races the compositor on a fast production build and software WebGL.
  await page.locator('[data-ek-rail="1"]').evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.locator('[data-ek-rail="1"]')).toHaveAttribute("aria-current", "location");
  await page.locator("[data-ek-next]").evaluate((button: HTMLButtonElement) => button.focus({ preventScroll: true }));
  await page.locator('[data-ek-rail="5"]').evaluate((link: HTMLAnchorElement) => link.click());
  await page.keyboard.press("Home");
  // Allow the native key's scroll/cancellation to settle before requesting the next chapter.
  await page.waitForTimeout(250);
  const interruptedPhase = Number(await film.getAttribute("data-phase"));
  expect(interruptedPhase).toBeLessThan(4);
  const nextChapter = Math.floor(interruptedPhase) + 1;
  await page.keyboard.press("Enter");
  await expect(page.locator(`[data-ek-rail="${nextChapter}"]`)).toHaveAttribute("aria-current", "location");
  await expect(page.locator("[data-ek-next]")).toBeFocused();
  await testInfo.attach("keyboard-interruption", {
    body: JSON.stringify({ interruptedPhase, nextChapter, finalPhase: await film.getAttribute("data-phase") }),
    contentType: "application/json",
  });
});
