import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
test.setTimeout(90000);

test("Products latest commands win, keyboard tab order and exact destinations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/landing/products");
  await page.locator('[data-carousel-ready="true"]').waitFor();
  const track = page.locator("[data-carousel-track]");
  const status = page.getByRole("status");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Products", exact: true }),
  ).toHaveAttribute("href", "/landing/products");
  await track.focus();
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("link", { name: "Explore Ekarvo Pulse", exact: true })
      .first(),
  ).toBeFocused();
  await expect(
    page
      .getByRole("link", { name: "Explore Ekarvo Pulse", exact: true })
      .first(),
  ).toHaveAttribute("href", "/landing/products/operations-os");
  await page.keyboard.press("ArrowRight");
  await expect(track).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(status).toHaveText("Ekarvo Pulse, 1 of 2");
  await expect
    .poll(() => track.evaluate((el) => Math.abs(el.scrollLeft)))
    .toBeLessThan(1);
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() =>
      track.evaluate((el) => Math.abs(el.scrollLeft - el.clientWidth)),
    )
    .toBeLessThan(1);
  await expect(status).toHaveText("Ekarvo Drive, 2 of 2");
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("link", { name: "Explore Ekarvo Drive", exact: true })
      .first(),
  ).toBeFocused();
  await expect(
    page
      .getByRole("link", { name: "Explore Ekarvo Drive", exact: true })
      .first(),
  ).toHaveAttribute("href", "/landing/products/autonomous-execution");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Previous product" }).click();
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
});

test("Products without JS keeps both narratives and primary links available", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/landing/products`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("[data-product-slide]")).toHaveCount(2);
  await expect(
    page.locator("[data-product-slide]").nth(0).getByRole("link"),
  ).toBeVisible();
  await expect(
    page.locator("[data-product-slide]").nth(1).getByRole("link"),
  ).toBeVisible();
  await expect(page.locator("[data-product-slide][inert]")).toHaveCount(0);
  await expect(page.locator(".carousel-controls")).toBeHidden();
  await context.close();
});

test("Pulse hash entry, keyboard controls, exception recovery and completed proof", async ({
  page,
}) => {
  const route = "/landing/products/operations-os";
  await page.goto(`${route}#pulse-plan`);
  const plan = page.getByRole("button", { name: "PLAN 4", exact: true });
  await expect(plan).toBeFocused();
  await expect(plan).toHaveAttribute("aria-pressed", "true");
  expect((await plan.boundingBox())!.y).toBeGreaterThanOrEqual(160);
  await expect(plan).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "OPERATE 4", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Quality", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(
    page
      .getByRole("region", { name: "Selected capability" })
      .getByRole("heading"),
  ).toHaveText("Quality");
  await page.evaluate(() => {
    location.hash = "drive-assure";
  });
  await expect(page.getByRole("button", { name: "ASSURE 2" })).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Verify", exact: true }).last(),
  ).toHaveAttribute("aria-pressed", "true");
  const proof = page.getByRole("region", {
    name: "Synthetic connected-work example",
  });
  await proof.getByRole("button", { name: "Execute", exact: true }).click();
  await expect(
    proof.getByRole("button", { name: "Run example action" }),
  ).toBeDisabled();
  await proof.getByRole("button", { name: "Simulate", exact: true }).click();
  await proof
    .getByRole("button", { name: /Reassign eligible capacity/ })
    .click();
  await proof.getByRole("button", { name: "Authorize", exact: true }).click();
  await proof.getByRole("button", { name: "Approve this scope" }).click();
  await proof.getByRole("button", { name: "Execute", exact: true }).click();
  await proof.getByRole("button", { name: "Raise an exception" }).click();
  await expect(proof.getByRole("status")).toContainText("Paused.");
  await proof.getByRole("button", { name: "Return for approval" }).click();
  await expect(
    proof.getByRole("button", { name: "Approve this scope" }),
  ).toBeFocused();
  await proof.getByRole("button", { name: "Approve this scope" }).click();
  await proof.getByRole("button", { name: "Execute", exact: true }).click();
  await proof.getByRole("button", { name: "Run example action" }).click();
  await proof.getByRole("button", { name: "Verify", exact: true }).click();
  await proof.getByRole("button", { name: "Check example evidence" }).click();
  await proof.getByRole("button", { name: "Learn", exact: true }).click();
  await proof.getByRole("button", { name: "Capture the learning" }).click();
  await expect(proof.getByRole("status")).toHaveText(
    "Example loop complete: result verified and learning captured.",
  );
  const summary = page
    .locator("summary")
    .filter({ hasText: "What is the starting point?" });
  await summary.focus();
  await page.keyboard.press("Space");
  await expect(
    page.locator("details").filter({ has: summary }),
  ).toHaveAttribute("open", "");
});

test("Pulse without JavaScript retains narrative, links and native disclosures", async ({
  browser,
  baseURL,
}) => {
  const route = "/landing/products/operations-os";
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  const response = await page.goto(`${baseURL}${route}`);
  expect(response!.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "See the work in context." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A commitment starts to drift." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Discuss an operating decision" }),
  ).toHaveAttribute("href", "/landing/contact?product=operations-os");
  await page.getByText("How do we evaluate fit?", { exact: true }).click();
  await expect(
    page.getByText(
      "Start with the work, the decision and the desired outcome.",
      { exact: false },
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("Drive keyboard, pause, rejection, exception, reset, retry and evidence", async ({
  page,
}) => {
  const route = "/landing/products/autonomous-execution";
  await page.goto(route);
  const demo = page.getByRole("region", { name: "Synthetic report execution" });
  const button = (name: string) =>
    demo.getByRole("button", { name, exact: true });
  await expect(button("Confirm example contract")).toBeEnabled();
  await button("Confirm example contract").focus();
  await page.keyboard.press("Enter");
  await expect(button("Run simulation")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(button("Classifying records…")).toBeDisabled();
  await button("Pause simulation").click();
  await page.waitForTimeout(350);
  await expect(demo.getByRole("status")).toContainText("paused");
  await button("Resume simulation").click();
  await expect(button("Approve report creation")).toBeFocused();
  await button("Reject").click();
  await expect(demo.getByRole("status")).toContainText("No report was written");
  await button("Reset simulation").click();
  await demo
    .getByRole("checkbox", { name: "Simulate missing receipt" })
    .check();
  await button("Confirm example contract").click();
  await button("Run simulation").click();
  await button("Approve report creation").click();
  await expect(button("Verifying evidence…")).toBeDisabled();
  await button("Raise an exception").click();
  await expect(button("Approve report creation")).toBeFocused();
  await page.waitForTimeout(300);
  await expect(demo.getByRole("status")).toContainText("needs your approval");
  await button("Approve report creation").click();
  await expect(demo.getByRole("status")).toContainText("receipt is missing");
  const blockedDownload = page.waitForEvent("download");
  await button("Download evidence").click();
  const blocked = await blockedDownload;
  const blockedJSON = JSON.parse(
    await readFile((await blocked.path())!, "utf8"),
  );
  expect(blockedJSON.receipt).toBeNull();
  expect(blockedJSON.state).toBe("Blocked");
  await button("Recover simulated receipt").click();
  await expect(demo.getByRole("status")).toHaveText(
    "20 records classified; 18 matched; 2 exceptions documented.",
  );
  const verifiedDownload = page.waitForEvent("download");
  await button("Download evidence").click();
  const verified = await verifiedDownload;
  expect(verified.suggestedFilename()).toBe("ekarvo-synthetic-evidence.json");
  const verifiedJSON = JSON.parse(
    await readFile((await verified.path())!, "utf8"),
  );
  expect(verifiedJSON.receipt).toBe("SYNTHETIC-RECEIPT-020");
  expect(verifiedJSON.criteria).toHaveLength(4);
  await button("Reset simulation").click();
  await button("Confirm example contract").click();
  await button("Run simulation").click();
  await button("Reset simulation").click();
  await page.waitForTimeout(350);
  await expect(demo.getByRole("status")).toContainText("Define a reconciled");
  await demo
    .locator("summary")
    .filter({ hasText: "Inspect the full example contract" })
    .focus();
  await page.keyboard.press("Space");
  await expect(
    demo.getByText("Objective and owner", { exact: true }),
  ).toBeVisible();
});

test("Drive without JavaScript retains narrative, download and disclosures", async ({
  browser,
  baseURL,
}) => {
  const route = "/landing/products/autonomous-execution";
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  expect((await page.goto(`${baseURL}${route}`))!.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "A defined result, with proof behind it.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Define a reconciled");
  await expect(
    page.getByRole("link", { name: "Download the full text walkthrough." }),
  ).toHaveAttribute("href", "/downloads/outcome-contract.txt");
  await page.getByText("Limits and escalation", { exact: true }).last().click();
  await expect(
    page
      .getByText(
        "20 records, zero financial spend, this browser session only. Missing evidence blocks completion and returns the issue to the demo process owner.",
        { exact: true },
      )
      .last(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("Combined demo direct hash entries and hero anchor navigation", async ({
  page,
}) => {
  const route = "/landing/demo";
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("response", (r) => {
    if (
      r.url().includes("127.0.0.1:3011") &&
      r.status() >= 400 &&
      ["stylesheet", "script", "image", "font"].includes(
        r.request().resourceType(),
      )
    )
      failures.push(r.url());
  });
  for (const width of [1440, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const hash of ["operations", "execution"]) {
      const started = Date.now();
      await page.goto("about:blank");
      const response = await page.goto(`${route}#${hash}`);
      expect(response!.status()).toBe(200);
      expect(response!.request().redirectedFrom()).toBeNull();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Test a decision and inspect its evidence.",
      );
      await expect(page).toHaveTitle("Interactive product demos — Ekarvo");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${route}$`),
      );
      await expect(page.locator(`#${hash}`)).toBeInViewport();
      const top = (await page.locator(`#${hash}`).boundingBox())!.y;
      const headerBottom =
        (await page.getByRole("banner").boundingBox())!.y +
        (await page.getByRole("banner").boundingBox())!.height;
      expect(top).toBeGreaterThanOrEqual(headerBottom);
      console.log("Direct hash heading ms", width, hash, Date.now() - started);
    }
  }
  await page.goto(route);
  for (const [name, hash] of [
    ["Ekarvo Pulse", "operations"],
    ["Ekarvo Drive", "execution"],
  ]) {
    const link = page
      .locator(".page-hero")
      .getByRole("link", { name, exact: true });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
    await expect(page.locator(`#${hash}`)).toBeInViewport();
  }
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  console.log(
    "Navigation timings",
    await page.evaluate(() => {
      const n = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoadedMs: n.domContentLoadedEventEnd,
        responseMs: n.responseEnd,
      };
    }),
  );
  expect(failures).toEqual([]);
});

test("Combined demo Pulse keyboard scenarios, partial evidence and reset", async ({
  page,
}) => {
  const route = "/landing/demo";
  await page.goto(`${route}#operations`);
  const demo = page.locator("#operations .demo-shell");
  const button = (name: string | RegExp) =>
    demo.getByRole("button", { name, exact: typeof name === "string" });
  await expect(button("Compare scenarios")).toBeEnabled();
  await button("Compare scenarios").focus();
  await page.keyboard.press("Enter");
  await expect(
    demo.getByRole("heading", { name: "Choose a capacity plan" }),
  ).toBeFocused();
  await expect(demo.getByText(/0 units remain uncovered/)).toBeVisible();
  await expect(
    demo.getByText(
      /Donor team: 300 units of spare capacity before the move; 60 after/,
    ),
  ).toBeVisible();
  await button(/Approve overtime/).focus();
  await page.keyboard.press("Space");
  await expect(button(/Approve overtime/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(demo.getByText(/60 units remain uncovered/)).toBeVisible();
  await expect(demo.getByText(/No donor-team impact/)).toBeVisible();
  await button("Approve simulated plan").click();
  await expect(demo.getByText("Awaiting measurement")).toBeVisible();
  await expect(demo.getByRole("status")).toContainText(
    "Results still require measurement",
  );
  await button("Return to overview").click();
  await expect(demo.locator(".metric").nth(1)).toContainText("1140");
  await expect(demo.locator(".metric").nth(2)).toContainText("60");
  await button("Scenarios").click();
  await button(/Reallocate capacity/).click();
  await button("Evidence").click();
  await expect(demo.getByText("Scenario model", { exact: true })).toBeVisible();
  await button("Scenarios").click();
  await button("Approve simulated plan").click();
  await expect(
    demo.getByText(/Donor capacity remains 60 units above demand/),
  ).toBeVisible();
  await button("Return to overview").click();
  await expect(demo.locator(".metric").nth(1)).toContainText("1200");
  await expect(demo.locator(".metric").nth(2)).toContainText("0");
  await button("Evidence").click();
  await button("Reset demo").click();
  await expect(demo.locator(".metric").nth(1)).toContainText("960");
  await expect(demo.locator(".metric").nth(2)).toContainText("240");
  await expect(button("Overview")).toHaveAttribute("aria-pressed", "true");
  await button("Scenarios").click();
  await expect(button(/Reallocate capacity/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("Combined demo Drive preserves approval, blocked recovery, download and reset", async ({
  page,
}) => {
  const route = "/landing/demo";
  await page.goto(`${route}#execution`);
  const demo = page.locator("#execution .demo-shell");
  const button = (name: string) =>
    demo.getByRole("button", { name, exact: true });
  const status = await demo.getByRole("status").elementHandle();
  await demo
    .getByRole("checkbox", { name: "Simulate missing receipt" })
    .check();
  await button("Confirm example contract").click();
  await button("Run simulation").click();
  await expect(button("Approve report creation")).toBeFocused();
  await button("Approve report creation").click();
  await expect(demo.getByRole("status")).toContainText("receipt is missing");
  expect(await status!.evaluate((el) => el.isConnected)).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await button("Download evidence").click();
  const download = await downloadPromise;
  const evidence = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(evidence.receipt).toBeNull();
  expect(evidence.state).toBe("Blocked");
  await button("Recover simulated receipt").click();
  await expect(demo.getByRole("status")).toContainText(
    "20 records classified;",
  );
  expect(await status!.evaluate((el) => el.isConnected)).toBe(true);
  await button("Reset simulation").click();
  await button("Confirm example contract").click();
  await button("Run simulation").click();
  await button("Reset simulation").click();
  await page.waitForTimeout(350);
  await expect(demo.getByRole("status")).toContainText("Define a reconciled");
  expect(await status!.evaluate((el) => el.isConnected)).toBe(true);
});

test("Combined demo normal motion rapid input and pending reset stay deterministic", async ({
  page,
}) => {
  const route = "/landing/demo";
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${route}#operations`);
  const pulse = page.locator("#operations .demo-shell");
  await pulse.getByRole("button", { name: "Scenarios", exact: true }).click();
  await pulse.getByRole("button", { name: "Evidence", exact: true }).click();
  await pulse.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(
    pulse.getByRole("heading", { name: "Service operations" }),
  ).toBeVisible();
  await expect(
    pulse.getByRole("button", { name: "Overview", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(200);
  expect(
    await pulse
      .locator(".operations-view")
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe("1");
  const drive = page.locator("#execution .demo-shell");
  await drive.getByRole("button", { name: "Confirm example contract" }).click();
  await drive.getByRole("button", { name: "Run simulation" }).click();
  await expect(
    drive.getByRole("button", { name: "Classifying records…" }),
  ).toBeDisabled();
  await drive.getByRole("button", { name: "Reset simulation" }).click();
  await page.waitForTimeout(1100);
  await expect(drive.getByRole("status")).toContainText("Define a reconciled");
  await expect(
    drive.getByRole("button", { name: "Confirm example contract" }),
  ).toBeEnabled();
});

test("workflow query validation pending retry conflict receipt download and real deletion", async ({
  page,
  baseURL,
}) => {
  const origin = baseURL!;
  for (const product of ["operations-os", "autonomous-execution", "bad"]) {
    await page.goto(`/landing/contact?product=${product}`);
    await expect(page.getByLabel("Product interest *")).toHaveValue(
      product === "bad" ? "not-sure" : product,
    );
  }
  await page.getByRole("button", { name: "Save workflow request" }).click();
  await expect(page.locator(".form-panel [role=status]")).toContainText(
    "Check the marked fields.",
  );
  const fill = async () => {
    await page
      .getByLabel("Name *", { exact: true })
      .fill("Synthetic parity QA");
    await page.getByLabel("Work email *").fill("parity@example.test");
    await page.getByLabel("Organization *").fill("Synthetic QA");
    await page
      .getByLabel("What work needs to be done? *")
      .fill("Test synthetic local request lifecycle.");
  };
  await fill();
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/api/contact", async (r) => {
    await gate;
    await r.abort("failed");
  });
  await page.getByRole("button", { name: "Save workflow request" }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  release();
  await expect(
    page.getByRole("button", { name: "Save workflow request" }),
  ).toBeEnabled();
  await expect(page.getByLabel("Name *", { exact: true })).toHaveValue(
    "Synthetic parity QA",
  );
  await page.unroute("**/api/contact");
  await page.route("**/api/contact", (r) =>
    r.fulfill({
      status: 409,
      json: { error: "This request ID already has different content." },
    }),
  );
  await page.getByRole("button", { name: "Save workflow request" }).click();
  await page.getByRole("button", { name: "Start a new request" }).click();
  await page.unroute("**/api/contact");
  const saving = page.waitForResponse((r) => r.url().endsWith("/api/contact"));
  await page.getByRole("button", { name: "Save workflow request" }).click();
  const response = await saving;
  expect(response.status()).toBe(201);
  const receipt = await response.json();
  try {
    await expect(page.locator(".receipt")).toBeFocused();
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download brief & receipt" })
      .click();
    const downloaded = JSON.parse(
      await readFile((await (await downloadEvent).path())!, "utf8"),
    );
    expect(downloaded.receipt).toEqual(receipt);
    const payload = { ...downloaded, requestId: receipt.id };
    delete payload.receipt;
    const duplicate = await page.request.post("/api/contact", {
      headers: { Origin: origin },
      data: payload,
    });
    expect(duplicate.status()).toBe(201);
    expect(await duplicate.json()).toEqual(receipt);
    const conflict = await page.request.post("/api/contact", {
      headers: { Origin: origin },
      data: { ...payload, workflow: "Changed synthetic workflow" },
    });
    expect(conflict.status()).toBe(409);
    await page.getByRole("link", { name: "Manage your request" }).click();
    await expect(page).toHaveURL(/privacy-policy#delete$/);
    await expect(page.locator("#delete")).toBeFocused();
    await page.getByLabel("Request ID", { exact: true }).fill(receipt.id);
    await page
      .getByLabel("Deletion token")
      .fill("33333333-3333-4333-8333-333333333333");
    await page.getByRole("button", { name: "Delete saved request" }).click();
    await expect(page.locator(".delete-status")).toContainText(
      "No matching request was found.",
    );
    await page.getByLabel("Deletion token").fill(receipt.deleteToken);
    await page.getByRole("button", { name: "Delete saved request" }).click();
    await expect(page.locator(".delete-status")).toHaveText(
      "The saved request has been deleted.",
    );
    await expect(page.getByLabel("Deletion token")).toHaveValue("");
    expect(
      (
        await page.request.post("/api/delete-request", {
          headers: { Origin: origin },
          data: { id: receipt.id, token: receipt.deleteToken },
        })
      ).status(),
    ).toBe(404);
  } finally {
    await page.request.post("/api/delete-request", {
      headers: { Origin: origin },
      data: { id: receipt.id, token: receipt.deleteToken },
    });
  }
});

test("every atlas product group and module updates the selected capability", async ({
  page,
}) => {
  await page.goto("/landing/products/operations-os");
  const atlas = page.locator(".capability-atlas");
  for (const product of await atlas.locator(".atlas-products button").all()) {
    await product.click();
    await expect(product).toHaveAttribute("aria-pressed", "true");
    for (
      let g = 0;
      g < (await atlas.locator(".atlas-groups button").count());
      g++
    ) {
      const group = atlas.locator(".atlas-groups button").nth(g);
      await group.click();
      await expect(group).toHaveAttribute("aria-pressed", "true");
      for (const moduleButton of await atlas
        .locator(".atlas-modules button")
        .all()) {
        const label = await moduleButton.textContent();
        await moduleButton.click();
        await expect(moduleButton).toHaveAttribute("aria-pressed", "true");
        await expect(atlas.locator(".atlas-detail h3")).toHaveText(label!);
      }
    }
  }
});

test("native disclosures support direct entry keyboard and complete static content", async ({
  page,
}) => {
  await page.goto("/landing/trust#missing-evidence");
  const details = page.locator("#missing-evidence"),
    summary = details.locator("summary");
  await expect(details).toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
  await summary.press("Enter");
  await expect(details).not.toHaveAttribute("open");
  await summary.press("Space");
  await expect(details).toHaveAttribute("open", "");
  expect((await summary.boundingBox())!.y).toBeGreaterThanOrEqual(
    (await page.getByRole("banner").boundingBox())!.height,
  );
  for (const route of [
    "/landing/trust",
    "/landing/products/operations-os",
    "/landing/products/autonomous-execution",
  ]) {
    await page.goto(route);
    for (const disclosure of await page.locator("main details").all()) {
      await disclosure.locator("summary").click();
      await expect(disclosure).toHaveAttribute("open", "");
      await disclosure.locator("summary").click();
      await expect(disclosure).not.toHaveAttribute("open");
    }
  }
});
