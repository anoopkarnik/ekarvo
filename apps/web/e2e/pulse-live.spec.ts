import "dotenv/config";
import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import db from "@workspace/database/client";
import { createManagedCredentials } from "@workspace/database/managed-credentials";
import { randomUUID } from "node:crypto";
import { makeSignature } from "better-auth/crypto";

test.skip(
  process.env.PULSE_LIVE_TESTS !== "1",
  "Explicit opt-in: exercises the seeded database and real sessions.",
);
const period = { from: "2026-11-01", through: "2026-11-11" };
const cookiePrefix =
  process.env.NEXT_PUBLIC_SAAS_NAME?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "better-auth";
const authSessionCookieName = `${cookiePrefix}.session_token`;
const read = (api: APIRequestContext, name: string, input?: unknown) =>
  api.get(
    `/api/trpc/${name}${input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : ""}`,
  );
const write = (api: APIRequestContext, name: string, input: unknown) =>
  api.post(`/api/trpc/${name}`, { data: input });
async function login(api: APIRequestContext, email: string) {
  const response = await api.post("/api/auth/sign-in/email", {
    data: { email, password: "password" },
    headers: { Origin: "http://localhost:3010" },
  });
  expect(response.status(), `Password login for ${email}`).toBe(200);
}
async function signOut(api: APIRequestContext) {
  await api.post("/api/auth/sign-out", {
    data: {},
    headers: { Origin: "http://localhost:3010" },
  });
}
async function uiLogin(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
async function demo() {
  const orgs = await db.organization.findMany({
    where: { bpo: { is: { seeded: true } } },
    include: {
      members: {
        include: {
          user: true,
          bpoAdmin: true,
          pulseGrants: { include: { teams: true } },
        },
      },
    },
  });
  expect(orgs).toHaveLength(1);
  return orgs[0]!;
}
test.afterAll(async () => {
  await db.$disconnect();
});

test("membership failure rolls back the newly created login and credential in PostgreSQL", async () => {
  const email = `rollback-${randomUUID()}@pulse-demo.test`;
  let id = "";
  try {
    await expect(
      db.$transaction(async (tx) => {
        const user = await createManagedCredentials(tx, {
          name: "Rollback test",
          email,
          password: "password",
        });
        id = user.id;
        await tx.member.create({
          data: {
            organizationId: `missing-${randomUUID()}`,
            userId: id,
            role: "member",
          },
        });
      }),
    ).rejects.toThrow();
    expect(id).not.toBe("");
    expect(await db.user.findUnique({ where: { email } })).toBeNull();
    expect(await db.account.count({ where: { userId: id } })).toBe(0);
  } finally {
    await db.user.deleteMany({ where: { email, role: "user" } });
  }
});

test("all sixteen password logins enforce their real BPO/client/team scope", async ({
  browser,
}) => {
  const org = await demo();
  const members = org.members.filter((m) =>
    m.user.email.endsWith("@pulse-demo.test"),
  );
  expect(members).toHaveLength(16);
  for (const member of members) {
    const context = await browser.newContext();
    try {
      await login(context.request, member.user.email);
      const bootstrap = await (
        await read(context.request, "pulse.bootstrap")
      ).json();
      const bpo = bootstrap.result.data.organizations.find(
        (o: { id: string }) => o.id === org.id,
      );
      expect(bpo.isItAdmin).toBe(!!member.bpoAdmin);
      if (member.bpoAdmin) {
        expect(bpo.accounts).toHaveLength(0);
        for (const path of [
          "portfolio",
          "donors",
          "dashboard",
          "scenarios",
          "commercial",
        ]) {
          const response = await read(context.request, `pulse.${path}`, {
            ...period,
            organizationId: org.id,
            accountId: `${org.id}:client:0`,
          });
          expect(response.status(), `IT ${path}`).toBe(403);
        }
        expect(
          (
            await read(context.request, "pulse.administration", {
              organizationId: org.id,
            })
          ).status(),
        ).toBe(200);
        expect(
          (
            await write(context.request, "pulse.member", {
              organizationId: org.id,
              memberId: member.id,
              grants: [
                {
                  accountId: `${org.id}:client:0`,
                  role: "COO_EXECUTIVE",
                  teamIds: [],
                },
              ],
            })
          ).status(),
        ).toBe(403);
      } else {
        const grant = member.pulseGrants[0]!;
        const scope = {
          ...period,
          organizationId: org.id,
          accountId: grant.accountId,
        };
        const response = await read(context.request, "pulse.dashboard", scope);
        expect(response.status()).toBe(200);
        const d = (await response.json()).result.data;
        expect(d.role).toBe(grant.role);
        if (grant.role === "TEAM_LEAD") {
          expect(d.metrics).not.toHaveProperty("finance");
          expect(d.teams.map((t: { id: string }) => t.id)).toEqual(
            grant.teams.map((t) => t.teamId),
          );
          const otherTeam = await db.pulseTeam.findFirstOrThrow({
            where: {
              organizationId: org.id,
              accountId: grant.accountId,
              id: { not: grant.teams[0]!.teamId },
            },
          });
          expect(
            (
              await read(context.request, "pulse.dashboard", {
                ...scope,
                teamIds: [otherTeam.id],
              })
            ).status(),
          ).toBe(403);
        } else expect(d.metrics).toHaveProperty("finance");
        const foreign = await db.clientAccount.findFirst({
          where: {
            organizationId: org.id,
            id: { notIn: member.pulseGrants.map((g) => g.accountId) },
          },
        });
        if (foreign)
          expect(
            (
              await read(context.request, "pulse.dashboard", {
                ...scope,
                accountId: foreign.id,
              })
            ).status(),
          ).toBe(403);
        expect(
          (
            await write(context.request, "pulse.createUser", {
              organizationId: org.id,
              name: "Denied",
              email: "denied@pulse-demo.test",
              password: "password",
              grants: [
                {
                  accountId: grant.accountId,
                  role: "OPS_MANAGER",
                  teamIds: [],
                },
              ],
            })
          ).status(),
        ).toBe(403);
      }
    } finally {
      await signOut(context.request);
      await context.close();
    }
  }
});

test("IT cannot read actuals/export/AI with a legacy mixed grant, and failed account creation publishes nothing", async ({
  page,
}) => {
  const org = await demo(),
    it = org.members.find((m) => m.bpoAdmin)!;
  const grant = await db.pulseAccountGrant.create({
    data: {
      organizationId: org.id,
      memberId: it.id,
      accountId: `${org.id}:client:0`,
      role: "COO_EXECUTIVE",
    },
  });
  const invalidEmail = `invalid-${randomUUID()}@pulse-demo.test`;
  try {
    await login(page.request, it.user.email);
    const scope = {
      ...period,
      organizationId: org.id,
      accountId: grant.accountId,
    };
    for (const name of ["dashboard", "portfolio", "donors"])
      expect((await read(page.request, `pulse.${name}`, scope)).status()).toBe(
        403,
      );
    const boot = await (await read(page.request, "pulse.bootstrap")).json();
    expect(boot.result.data.organizations[0].accounts).toEqual([]);
    const params = new URLSearchParams(scope);
    expect(
      (await page.request.get(`/api/pulse/export?${params}`)).status(),
    ).toBe(403);
    expect(
      (
        await page.request.post("/api/pulse/intelligence", {
          data: { ...scope, question: "Show the operational results" },
        })
      ).status(),
    ).toBe(403);
    const bad = await write(page.request, "pulse.createUser", {
      organizationId: org.id,
      name: "Invalid scope",
      email: invalidEmail,
      password: "password",
      grants: [
        {
          accountId: grant.accountId,
          role: "TEAM_LEAD",
          teamIds: ["foreign-team"],
        },
      ],
    });
    expect(bad.status()).toBe(400);
    expect(
      await db.user.findUnique({ where: { email: invalidEmail } }),
    ).toBeNull();
    const existing = org.members.find(
      (m) => m.user.email === "coo@pulse-demo.test",
    )!;
    const before = await db.account.findMany({
      where: { userId: existing.userId },
      select: { id: true, password: true },
    });
    expect(
      (
        await write(page.request, "pulse.createUser", {
          organizationId: org.id,
          name: "Duplicate",
          email: existing.user.email,
          password: "different-password",
          grants: [
            { accountId: grant.accountId, role: "COO_EXECUTIVE", teamIds: [] },
          ],
        })
      ).status(),
    ).toBe(409);
    expect(
      await db.account.findMany({
        where: { userId: existing.userId },
        select: { id: true, password: true },
      }),
    ).toEqual(before);
  } finally {
    await db.pulseAccountGrant.delete({ where: { id: grant.id } });
    await signOut(page.request);
  }
});

test("IT creates a staff login in the browser and that user lands in their scoped Pulse dashboard", async ({
  page,
  browser,
}) => {
  const email = `browser-${randomUUID()}@pulse-demo.test`;
  let staffContext: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  try {
    await uiLogin(page, "itadmin@pulse-demo.test");
    await expect(page).toHaveURL(/\/pulse\/admin/);
    await page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "People & client access", exact: true })
      .click();
    await page
      .getByLabel("Name", { exact: true })
      .fill("Browser-created staff");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Initial password", { exact: true }).fill("password");
    await page
      .getByRole("button", { name: "Add client assignment", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Create user", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "User created." }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Initial password", { exact: true }),
    ).toHaveValue("");
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(user.role).toBe("user");
    staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();
    await uiLogin(staffPage, email);
    await expect(staffPage).toHaveURL(/\/pulse$/);
    await expect(
      staffPage.getByRole("heading", { name: "Command Center", exact: true }),
    ).toBeVisible();
    const boot = await (
      await read(staffContext.request, "pulse.bootstrap")
    ).json();
    expect(boot.result.data.organizations[0].accounts).toHaveLength(1);
  } finally {
    if (staffContext) {
      await signOut(staffContext.request);
      await staffContext.close();
    }
    await signOut(page.request);
    await db.user.deleteMany({ where: { email, role: "user" } });
  }
});

for (const email of [
  "coo@pulse-demo.test",
  "manager1@pulse-demo.test",
  "teamlead01@pulse-demo.test",
]) {
  test(`${email}: real login lands in Pulse with role-specific financial controls`, async ({
    page,
  }) => {
    try {
      await uiLogin(page, email);
      await expect(page).toHaveURL(/\/pulse$/);
      await page
        .getByRole("navigation", { name: "Workspace navigation" })
        .getByRole("link", { name: "Perform & Assure", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Perform & Assure", exact: true }),
      ).toBeVisible();
      // The heading appears before the database-backed dashboard finishes.
      // Wait for evidence to load before asserting either presence or absence.
      await expect(
        page.getByRole("combobox", { name: "Team", exact: true }),
      ).toBeVisible({ timeout: 30000 });
      await expect(
        page.getByRole("heading", { name: "Contribution bridge", exact: true }),
      ).toHaveCount(email.startsWith("teamlead") ? 0 : 1);
    } finally {
      await signOut(page.request);
    }
  });
}

test("the existing platform admin lands in platform administration with preserved credentials", async ({
  page,
  context,
}) => {
  // A short-lived trusted test session exercises the real existing admin without
  // reading/changing their password. Only this test's session is deleted.
  const org = await demo(),
    ownerId = org.slug.slice("pulse-demo-".length),
    token = randomUUID();
  const session = await db.session.create({
    data: { userId: ownerId, token, expiresAt: new Date(Date.now() + 600000) },
  });
  try {
    const signed = encodeURIComponent(
      `${token}.${await makeSignature(token, process.env.BETTER_AUTH_SECRET!)}`,
    );
    await context.addCookies([
      {
        name: authSessionCookieName,
        value: signed,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "None",
      },
    ]);
    await page.goto("/");
    await expect(page).toHaveURL(/\/admin\/bpos$/);
    await expect(
      page.getByRole("heading", { name: "BPO workspaces", exact: true }),
    ).toBeVisible();
  } finally {
    await db.session.deleteMany({ where: { id: session.id } });
  }
});
