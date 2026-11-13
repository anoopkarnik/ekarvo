import { randomUUID } from "node:crypto";
import db from "./client";
import type { Prisma } from "./generated/prisma/client";
import { buildPulseSeed } from "./pulseSeed";
import { buildPulseDemoUsers, type DemoUser } from "./pulseDemoUsers";
import { createManagedCredentials } from "./managedCredentials";
import { hashPassword } from "better-auth/crypto";

export async function reconcileDemoUser(
  tx: Prisma.TransactionClient,
  organizationId: string,
  fixture: DemoUser,
) {
  const existing = await tx.user.findUnique({
    where: { id: fixture.id },
    include: { accounts: { where: { providerId: "credential" } } },
  });
  if (
    existing &&
    (existing.email !== fixture.email || existing.role !== "user")
  )
    throw new Error(`Demo identity ownership mismatch: ${fixture.email}`);
  if (!existing)
    await createManagedCredentials(tx, { ...fixture, password: "password" });
  else if (existing.accounts.length > 1)
    throw new Error(
      `Multiple credential accounts for ${fixture.email}; refusing to choose one.`,
    );
  else if (!existing.accounts.length)
    await tx.account.create({
      data: {
        userId: fixture.id,
        accountId: fixture.id,
        providerId: "credential",
        password: await hashPassword("password"),
      },
    });

  const priorMember = await tx.member.findUnique({
    where: { organizationId_userId: { organizationId, userId: fixture.id } },
    include: { bpoAdmin: true, pulseGrants: { include: { teams: true } } },
  });
  if (priorMember) {
    const actual = priorMember.pulseGrants
      .map((g) => ({
        accountId: g.accountId,
        role: g.role,
        teamIds: g.teams.map((t) => t.teamId).sort(),
      }))
      .sort((a, b) => a.accountId.localeCompare(b.accountId));
    const expected = fixture.grants
      .map((g) => ({ ...g, teamIds: [...g.teamIds].sort() }))
      .sort((a, b) => a.accountId.localeCompare(b.accountId));
    // Never recreate grants an administrator deliberately changed or revoked.
    if (
      !!priorMember.bpoAdmin !== fixture.isItAdmin ||
      JSON.stringify(actual) !== JSON.stringify(expected)
    )
      return "Existing assignments differ; preserved";
    return existing
      ? "Existing login and assignments preserved"
      : "Missing login restored";
  }
  const member = await tx.member.create({
    data: {
      id: `${fixture.id}:member`,
      userId: fixture.id,
      organizationId,
      role: "member",
    },
  });
  if (fixture.isItAdmin)
    await tx.bpoAdminGrant.create({
      data: { memberId: member.id, organizationId },
    });
  for (const grant of fixture.grants)
    await tx.pulseAccountGrant.create({
      data: {
        memberId: member.id,
        organizationId,
        accountId: grant.accountId,
        role: grant.role,
        teams: { create: grant.teamIds.map((teamId) => ({ teamId })) },
      },
    });
  return existing
    ? "Missing membership restored; password preserved"
    : "Created; initial password: password";
}

export async function seedPulseDemo(adminEmail?: string) {
  return db.$transaction(
    async (tx) => {
      const candidates = await tx.organization.findMany({
        where: { bpo: { is: { seeded: true } } },
        include: { bpo: true },
      });
      if (candidates.length > 1)
        throw new Error(
          "Multiple seeded BPOs found. Refusing to select or create another demo.",
        );
      let org = candidates[0];
      if (org && !org.slug.startsWith("pulse-demo-"))
        throw new Error(
          "Unrecognized seeded BPO ownership. Refusing to change it.",
        );
      const legacyOwnerId = org?.slug.slice("pulse-demo-".length);
      const owners = await tx.user.findMany({
        where: {
          role: "admin",
          banned: false,
          ...(legacyOwnerId ? { id: legacyOwnerId } : {}),
          ...(adminEmail
            ? {
                email: {
                  equals: adminEmail.trim(),
                  mode: "insensitive" as const,
                },
              }
            : {}),
        },
        select: { id: true },
      });
      if (owners.length !== 1)
        throw new Error(
          "Specify --admin-email for the existing platform admin who owns this demo. No admin login will be created or changed.",
        );
      const owner = owners[0]!;
      if (!org)
        org = await tx.organization.create({
          data: {
            id: randomUUID(),
            name: "Pulse demonstration BPO",
            slug: `pulse-demo-${owner.id}`,
            bpo: { create: { seeded: true, seedAnchor: new Date() } },
          },
          include: { bpo: true },
        });
      if (!org.bpo?.seedAnchor)
        throw new Error(
          "Missing demo seed anchor; refusing to regenerate historical records.",
        );
      const dataset = buildPulseSeed(org.id, org.bpo.seedAnchor);
      await tx.clientAccount.createMany({
        data: dataset.accounts,
        skipDuplicates: true,
      });
      await tx.pulseSite.createMany({
        data: dataset.sites,
        skipDuplicates: true,
      });
      await tx.pulseProcess.createMany({
        data: dataset.processes,
        skipDuplicates: true,
      });
      await tx.pulseTeam.createMany({
        data: dataset.teams,
        skipDuplicates: true,
      });
      await tx.pulseWorker.createMany({
        data: dataset.workers,
        skipDuplicates: true,
      });
      await tx.pulseWorkType.createMany({
        data: dataset.workTypes,
        skipDuplicates: true,
      });
      for (let i = 0; i < dataset.records.length; i += 1000)
        await tx.pulseRecord.createMany({
          data: dataset.records.slice(
            i,
            i + 1000,
          ) as Prisma.PulseRecordCreateManyInput[],
          skipDuplicates: true,
        });
      const accounts = dataset.accounts.map((a) => ({
        id: a.id!,
        code: a.code,
      }));
      const teams = dataset.teams.map((t) => ({
        id: t.id!,
        accountId: t.accountId,
      }));
      const users = [];
      for (const fixture of buildPulseDemoUsers(org.id, accounts, teams))
        users.push({
          ...fixture,
          result: await reconcileDemoUser(tx, org.id, fixture),
        });
      const legacy = await tx.member.findUnique({
        where: {
          organizationId_userId: { organizationId: org.id, userId: owner.id },
        },
      });
      if (legacy) {
        await tx.member.delete({ where: { id: legacy.id } });
        await tx.session.updateMany({
          where: { userId: owner.id, activeOrganizationId: org.id },
          data: { activeOrganizationId: null },
        });
        await tx.pulseAuditEvent.create({
          data: {
            organizationId: org.id,
            actorId: owner.id,
            action: "DEMO_ADMIN_MEMBERSHIP_REMOVED",
            entityId: legacy.id,
            detail: {},
          },
        });
      }
      return {
        organizationId: org.id,
        organizationName: org.name,
        users,
        accounts: dataset.accounts.map((a) => ({ id: a.id!, name: a.name })),
        teams: dataset.teams.map((t) => ({ id: t.id!, name: t.name })),
      };
    },
    { isolationLevel: "Serializable", timeout: 300000 },
  );
}
