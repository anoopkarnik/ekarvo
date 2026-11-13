import { test, expect } from "@playwright/test";
import { buildPulseSeed } from "../../../packages/database/src/pulseSeed";
import { calculateMetrics, forecastDemand } from "../lib/pulse/metrics";
const organizationId = "pulse-browser-fixture",
  anchor = new Date("2026-11-08T12:00:00Z");
const seed = buildPulseSeed(organizationId, anchor),
  account = seed.accounts[0]!,
  accountId = account.id!;
const teams = seed.teams.filter((t) => t.accountId === accountId),
  types = seed.workTypes
    .filter((w) => w.accountId === accountId)
    .map((w) => ({ ...w, id: w.id!, complexity: w.complexity ?? 1 }));
const facts = seed.records
  .filter((r) => r.accountId === accountId)
  .map((r) => ({
    ...r,
    id: r.id!,
    occurredAt: r.occurredAt as Date,
    teamId: r.teamId ?? null,
    workerId: r.workerId ?? null,
  }));
const period = {
  start: new Date("2026-11-01T00:00:00Z"),
  end: anchor,
  asOf: anchor,
};
const metrics = calculateMetrics(facts, types, period);
for (const role of ["COO_EXECUTIVE", "OPS_MANAGER", "TEAM_LEAD"] as const) {
  test(`${role}: all seven suites render scoped data and role controls`, async ({
    page,
    context,
  }) => {
    // Browser-only fixtures exercise the real Next/React UI. No database users,
    // real sessions, mutations, or emails are created by this test.
    await context.addCookies([
      {
        name: "ekarvo.session_token",
        value: "pulse-ui-fixture",
        domain: "localhost",
        path: "/",
      },
    ]);
    const user = {
      id: "fixture-user",
      name: "Pulse UI Test",
      email: "pulse-ui@example.test",
      role: "user",
      emailVerified: true,
    };
    await page.route("**/api/auth/get-session**", (r) =>
      r.fulfill({
        json: {
          user,
          session: {
            id: "fixture-session",
            userId: user.id,
            token: "fixture-token",
            expiresAt: "2030-01-01T00:00:00Z",
          },
        },
      }),
    );
    const scopedTeams = role === "TEAM_LEAD" ? teams.slice(0, 1) : teams;
    const scopedFacts =
      role === "TEAM_LEAD"
        ? facts.filter((r) => r.teamId === teams[0]!.id)
        : facts;
    const scopedMetrics = calculateMetrics(scopedFacts, types, period);
    if (role === "TEAM_LEAD")
      delete (scopedMetrics as Partial<typeof metrics>).finance;
    const d = {
      scope: { role, teamIds: role === "TEAM_LEAD" ? [teams[0]!.id] : [] },
      account: {
        ...account,
        approvalLimits: { TEAM_LEAD: 40, OPS_MANAGER: 140, COO_EXECUTIVE: 220 },
      },
      role,
      isItAdmin: false,
      seeded: true,
      timezone: "Asia/Kolkata",
      metrics: scopedMetrics,
      filterOptions: scopedTeams.map((tm) => ({
        id: tm.id,
        name: tm.name,
        processId: tm.processId,
        processName: seed.processes.find((p) => p.id === tm.processId)!.name,
      })),
      trends: [{ start: period.start.toISOString(), ...scopedMetrics }],
      teams: scopedTeams.map((tm) => ({
        ...tm,
        ...calculateMetrics(
          scopedFacts.filter((r) => r.teamId === tm.id),
          types,
          period,
        ),
      })),
      workers: seed.workers
        .filter((w) => scopedTeams.some((tm) => tm.id === w.teamId))
        .map((w) => ({
          id: w.id,
          name: w.name,
          teamId: w.teamId,
          active: true,
          fte: 1,
        })),
      workTypes: types.filter((w) =>
        scopedTeams.some((tm) => tm.processId === w.processId),
      ),
      forecast: forecastDemand(scopedFacts, anchor, "Asia/Kolkata"),
      opportunities: [],
      activities: [],
      evidence: [],
    };
    const output: Record<string, unknown> = {
      "pulse.bootstrap": {
        userId: user.id,
        platformAdmin: false,
        organizations: [
          {
            id: organizationId,
            name: "Browser BPO",
            isItAdmin: false,
            suspended: false,
            accounts: [
              {
                id: accountId,
                name: account.name,
                role,
                teamIds: d.scope.teamIds,
              },
            ],
          },
        ],
      },
      "pulse.dashboard": d,
      "pulse.portfolio": [
        { account: d.account, role, metrics: scopedMetrics, opportunities: [] },
      ],
      "pulse.scenarios": [],
      "pulse.audit": [],
      "pulse.donors": [],
      "pulse.commercial": [],
      "organization.current": {
        active: {
          id: organizationId,
          name: "Browser BPO",
          slug: "browser-bpo",
          role: "member",
        },
        organizations: [
          {
            id: organizationId,
            name: "Browser BPO",
            slug: "browser-bpo",
            role: "member",
          },
        ],
        invitations: [],
      },
      "notification.unreadCount": 0,
    };
    if (role === "COO_EXECUTIVE") {
      const boot = output["pulse.bootstrap"] as {
        organizations: {
          id: string;
          name: string;
          isItAdmin: boolean;
          suspended: boolean;
          accounts: unknown[];
        }[];
      };
      boot.organizations.push({
        id: "it-services-bpo",
        name: "IT Services BPO",
        isItAdmin: true,
        suspended: false,
        accounts: [],
      });
      const current = output["organization.current"] as {
        active: { id: string; name: string; slug: string; role: string };
        organizations: {
          id: string;
          name: string;
          slug: string;
          role: string;
        }[];
      };
      current.organizations.push({
        id: "it-services-bpo",
        name: "IT Services BPO",
        slug: "it-services-bpo",
        role: "member",
      });
      output["pulse.administration"] = {
        accounts: [],
        teams: [],
        sites: [],
        processes: [],
        workers: [],
        workTypes: [],
        members: [],
        invitations: [],
        imports: [],
        mappings: [],
      };
    }
    await page.route("**/api/trpc/**", async (route) => {
      const url = new URL(route.request().url()),
        names = decodeURIComponent(
          url.pathname.split("/api/trpc/")[1] || "",
        ).split(",");
      if (names.includes("organization.setActive")) {
        const inputs = route.request().postDataJSON();
        const selectedId =
          inputs[String(names.indexOf("organization.setActive"))]
            .organizationId;
        const current = output["organization.current"] as {
          active: { id: string };
          organizations: { id: string }[];
        };
        current.active = current.organizations.find(
          (o) => o.id === selectedId,
        )!;
        await route.fulfill({
          json: names.map((n) => ({
            result: {
              data:
                n === "organization.setActive"
                  ? { organizationId: selectedId }
                  : output[n],
            },
          })),
        });
        return;
      }
      if (names.every((n) => n in output)) {
        await route.fulfill({
          json: names.map((n) => ({ result: { data: output[n] } })),
        });
        return;
      }
      // Mixed batch: preserve known fixture operations, deny unrelated protected queries.
      await route.fulfill({
        json: names.map((n) =>
          n in output
            ? { result: { data: output[n] } }
            : {
                error: {
                  message: "UI fixture: unavailable",
                  code: -32001,
                  data: { code: "UNAUTHORIZED", httpStatus: 401 },
                },
              },
        ),
      });
    });
    const errors: string[] = [];
    const billingRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.url().includes("/api/trpc/") &&
        request.url().includes("billing.")
      )
        billingRequests.push(request.url());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/pulse");
    await expect(
      page.getByRole("heading", { name: "Command Center", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "EKARVO PULSE", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Usage", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Home", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Workspace", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: /Pulse UI Test pulse-ui@example.test/ })
      .press("Enter");
    await page.getByRole("menuitem", { name: "Settings", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: /billing/i }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    expect(billingRequests).toEqual([]);
    await expect(
      page.getByText("Meridian Healthcare RCM", { exact: true }).first(),
    ).toBeAttached();
    await page
      .getByRole("combobox", { name: "Process", exact: true })
      .selectOption(scopedTeams[0]!.processId);
    const href = await page
      .getByRole("link", { name: "Export actuals", exact: true })
      .getAttribute("href");
    expect(
      new URL(href!, "http://localhost").searchParams.getAll("teamIds"),
    ).toEqual(
      scopedTeams
        .filter((tm) => tm.processId === scopedTeams[0]!.processId)
        .map((tm) => tm.id),
    );
    await page
      .getByRole("combobox", { name: "Process", exact: true })
      .selectOption("");
    if (role === "COO_EXECUTIVE")
      await page.screenshot({
        path: "../../playwright/pulse-command-center.png",
        fullPage: true,
      });
    for (const name of [
      "Decision Lab",
      "Plan & Deliver",
      "Perform & Assure",
      "Develop & Transform",
      "Action & Audit",
      "Configuration Studio",
    ]) {
      await page
        .getByRole("navigation", { name: "Workspace navigation" })
        .getByRole("link", { name, exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name, exact: true }).first(),
      ).toBeVisible();
      if (name === "Perform & Assure")
        await expect(
          page.getByRole("heading", { name: "Contribution bridge" }),
        ).toHaveCount(role === "TEAM_LEAD" ? 0 : 1);
      if (name === "Configuration Studio" && role === "TEAM_LEAD")
        await expect(
          page.getByText("Commercial settings require a COO role."),
        ).toBeVisible();
    }
    await expect(page).toHaveURL(/suite=config$/);
    await page.reload();
    await expect(
      page
        .getByRole("heading", { name: "Configuration Studio", exact: true })
        .first(),
    ).toBeVisible();
    await page.goBack();
    await expect(
      page
        .getByRole("heading", { name: "Action & Audit", exact: true })
        .first(),
    ).toBeVisible();
    await page.goForward();
    await expect(
      page
        .getByRole("heading", { name: "Configuration Studio", exact: true })
        .first(),
    ).toBeVisible();
    if (role === "COO_EXECUTIVE") {
      await page
        .getByRole("button", { name: "Switch workspace", exact: true })
        .click();
      await page
        .getByRole("menuitem", { name: "IT Services BPO", exact: true })
        .click();
      await expect(page).toHaveURL(/\/pulse\/admin$/);
      await expect(
        page
          .getByRole("navigation", { name: "Workspace navigation" })
          .getByRole("link", { name: "People & client access", exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "Workspace navigation" })
          .getByRole("link", { name: "Command Center", exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: "Switch workspace", exact: true })
        .click();
      await page
        .getByRole("menuitem", { name: "Browser BPO", exact: true })
        .click();
      await expect(page).toHaveURL(/\/pulse$/);
      await expect(
        page.getByRole("heading", { name: "Command Center", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("navigation", { name: "Workspace navigation" })
        .getByRole("link", { name: "Configuration Studio", exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Pulse Intelligence", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Pulse Intelligence" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page
        .getByRole("heading", { name: "Configuration Studio", exact: true })
        .first(),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Toggle Sidebar", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "Command Center", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Command Center", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Sidebar", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `../../playwright/pulse-${role.toLowerCase()}.png`,
      fullPage: true,
    });
  });
}

for (const role of ["IT_ADMIN", "PLATFORM_ADMIN"] as const) {
  test(`${role}: administration surfaces render without operational grants`, async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "ekarvo.session_token",
        value: "pulse-ui-fixture",
        domain: "localhost",
        path: "/",
      },
    ]);
    const user = {
      id: "fixture-admin",
      name: "Administration Test",
      email: "admin@example.test",
      role: role === "PLATFORM_ADMIN" ? "admin" : "user",
      emailVerified: true,
    };
    await page.route("**/api/auth/get-session**", (r) =>
      r.fulfill({
        json: {
          user,
          session: {
            id: "s",
            userId: user.id,
            token: "fixture",
            expiresAt: "2030-01-01T00:00:00Z",
          },
        },
      }),
    );
    const outputs: Record<string, unknown> = {
      "pulse.bootstrap": {
        userId: user.id,
        platformAdmin: role === "PLATFORM_ADMIN",
        organizations: [
          {
            id: organizationId,
            name: "Browser BPO",
            isItAdmin: true,
            suspended: false,
            accounts: [],
          },
        ],
      },
      "pulse.administration": {
        accounts: seed.accounts,
        teams: seed.teams,
        sites: seed.sites,
        processes: seed.processes,
        workers: seed.workers,
        workTypes: seed.workTypes,
        members: [],
        invitations: [],
        imports: [],
        mappings: [],
      },
      "adminBpo.list": [
        {
          organizationId,
          suspended: false,
          organization: {
            id: organizationId,
            name: "Browser BPO",
            invitations: [],
          },
          admins: [],
        },
      ],
      "organization.current": {
        active: {
          id: organizationId,
          name: "Browser BPO",
          slug: "browser-bpo",
          role: "member",
        },
        organizations: [
          {
            id: organizationId,
            name: "Browser BPO",
            slug: "browser-bpo",
            role: "member",
          },
        ],
        invitations: [],
      },
      "notification.unreadCount": 0,
    };
    await page.route("**/api/trpc/**", (route) => {
      const names = decodeURIComponent(
        new URL(route.request().url()).pathname.split("/api/trpc/")[1] || "",
      ).split(",");
      return route.fulfill({
        json: names.map((n) =>
          n in outputs
            ? { result: { data: outputs[n] } }
            : {
                error: {
                  message: "Fixture unavailable",
                  code: -32001,
                  data: { code: "UNAUTHORIZED", httpStatus: 401 },
                },
              },
        ),
      });
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (role === "IT_ADMIN") {
      await page.goto("/pulse/admin?tab=imports");
      await expect(
        page.getByRole("heading", { name: "BPO administration", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Data imports", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("combobox", { name: "Workspace", exact: true }),
      ).toHaveCount(0);
      for (const name of [
        "People & client access",
        "Organization & roster",
        "Data imports",
        "Source field mappings",
        "Client accounts",
      ]) {
        await page
          .getByRole("navigation", { name: "Workspace navigation" })
          .getByRole("link", { name, exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name, exact: true }).first(),
        ).toBeVisible();
      }
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Client accounts", exact: true }),
      ).toBeVisible();
      await page.goto("/pulse");
      await expect(page).toHaveURL(/\/pulse\/admin$/);
      await expect(
        page.getByRole("heading", { name: "Command Center", exact: true }),
      ).toHaveCount(0);
    } else {
      await page.goto("/admin/bpos");
      await expect(
        page.getByRole("heading", { name: "BPO workspaces", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Provision BPO",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Suspend access", exact: true }),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}
