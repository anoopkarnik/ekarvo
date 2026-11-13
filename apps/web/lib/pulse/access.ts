import db from "@workspace/database/client";
import type { Prisma } from "@workspace/database/prisma";
import { TRPCError } from "@trpc/server";
import { authorizeAccount, hasFinancials, type AccountGrant } from "./policy";
export type Tx = Prisma.TransactionClient;
export async function getBpoAccess(
  userId: string,
  organizationId: string,
  client: Tx = db,
) {
  const member = await client.member.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
      user: { banned: false },
    },
    include: {
      bpoAdmin: true,
      pulseGrants: { include: { teams: true } },
      organization: { include: { bpo: true } },
    },
  });
  if (!member?.organization.bpo || member.organization.bpo.suspended)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "BPO access unavailable.",
    });
  return {
    memberId: member.id,
    organizationId,
    userId,
    isItAdmin: member.bpoAdmin?.organizationId === organizationId,
    bpo: member.organization.bpo,
    grants: (member.bpoAdmin ? [] : member.pulseGrants).map((g) => ({
      accountId: g.accountId,
      role: g.role,
      teamIds: g.teams.map((t) => t.teamId),
    })) satisfies AccountGrant[],
  };
}
export async function requireOperations(
  userId: string,
  organizationId: string,
  client: Tx = db,
) {
  const access = await getBpoAccess(userId, organizationId, client);
  if (access.isItAdmin || !access.grants.length)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Operational access is unavailable for this user.",
    });
  return access;
}
export async function accountAccess(
  userId: string,
  organizationId: string,
  accountId: string,
  teamIds?: string[],
  client: Tx = db,
) {
  const access = await requireOperations(userId, organizationId, client);
  let grant;
  try {
    grant = authorizeAccount(access.grants, accountId, teamIds);
  } catch {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Client or team access denied.",
    });
  }
  const account = await client.clientAccount.findFirst({
    where: { id: accountId, organizationId, archived: false },
  });
  if (!account)
    throw new TRPCError({ code: "NOT_FOUND", message: "Client unavailable." });
  if (
    grant.teamIds.length &&
    (await client.pulseTeam.count({
      where: { organizationId, accountId, id: { in: grant.teamIds } },
    })) !== grant.teamIds.length
  )
    throw new TRPCError({ code: "FORBIDDEN" });
  return {
    ...access,
    grant,
    account,
    financial: hasFinancials(grant.role),
    where: {
      organizationId,
      accountId,
      ...(grant.teamIds.length ? { teamId: { in: grant.teamIds } } : {}),
    },
  };
}
export async function requireIt(
  userId: string,
  organizationId: string,
  client: Tx = db,
) {
  const a = await getBpoAccess(userId, organizationId, client);
  if (!a.isItAdmin)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "BPO IT Admin access required.",
    });
  return a;
}
export async function assertPlatformAdmin(userId: string, client: Tx = db) {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { role: true, banned: true },
  });
  if (user?.role !== "admin" || user.banned)
    throw new TRPCError({ code: "FORBIDDEN" });
}
export async function audit(
  client: Tx,
  organizationId: string,
  actorId: string,
  action: string,
  entityId: string,
  detail: Prisma.InputJsonValue = {},
  accountId?: string,
) {
  await client.pulseAuditEvent.create({
    data: { organizationId, accountId, actorId, action, entityId, detail },
  });
}
export const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value));
export async function serial<T>(
  fn: (tx: Tx) => Promise<T>,
  timeout = 60000,
): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: "Serializable",
        timeout,
      });
    } catch (e) {
      if (i < 3 && (e as { code?: string }).code === "P2034") continue;
      throw e;
    }
  }
}
