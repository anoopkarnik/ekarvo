import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import db from "@workspace/database/client";
import { sendInvitationEmail } from "@workspace/auth/better-auth/organization";
import {
  audit,
  json,
  requireIt,
  serial,
  assertPlatformAdmin,
  type Tx,
} from "./access";
import type { AccountGrant } from "./policy";
export async function validateGrants(
  tx: Tx,
  organizationId: string,
  grants: AccountGrant[],
) {
  if (new Set(grants.map((g) => g.accountId)).size !== grants.length)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Duplicate client assignment.",
    });
  for (const g of grants) {
    if (
      !(await tx.clientAccount.findFirst({
        where: { id: g.accountId, organizationId, archived: false },
      }))
    )
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid client." });
    if (g.role === "TEAM_LEAD" && !g.teamIds.length)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Team Leads need assigned teams.",
      });
    if (g.role !== "TEAM_LEAD" && g.teamIds.length)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only Team Leads have team restrictions.",
      });
    if (
      new Set(g.teamIds).size !== g.teamIds.length ||
      (await tx.pulseTeam.count({
        where: {
          organizationId,
          accountId: g.accountId,
          id: { in: g.teamIds },
        },
      })) !== g.teamIds.length
    )
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid team assignments.",
      });
  }
}
export async function writeGrants(
  tx: Tx,
  memberId: string,
  organizationId: string,
  grants: AccountGrant[],
) {
  if (
    grants.length &&
    (await tx.bpoAdminGrant.findUnique({ where: { memberId } }))
  )
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "IT Admin cannot hold operational roles in this BPO.",
    });
  await validateGrants(tx, organizationId, grants);
  await tx.pulseAccountGrant.deleteMany({
    where: { memberId, organizationId },
  });
  for (const g of grants)
    await tx.pulseAccountGrant.create({
      data: {
        memberId,
        organizationId,
        accountId: g.accountId,
        role: g.role,
        teams: { create: g.teamIds.map((teamId) => ({ teamId })) },
      },
    });
}
export async function issueInvite(
  actorId: string,
  organizationId: string,
  email: string,
  grants: AccountGrant[],
  adminInvite = false,
) {
  const result = await serial(async (tx) => {
    if (adminInvite) await assertPlatformAdmin(actorId, tx);
    else await requireIt(actorId, organizationId, tx);
    if (!adminInvite && grants.length) {
      const target = await tx.member.findFirst({
        where: {
          organizationId,
          user: { email: { equals: email.trim(), mode: "insensitive" } },
        },
        include: { bpoAdmin: true },
      });
      if (target?.bpoAdmin)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "IT Admin cannot hold operational roles in this BPO.",
        });
    }
    await validateGrants(tx, organizationId, grants);
    const org = await tx.organization.findUniqueOrThrow({
      where: { id: organizationId },
    });
    await tx.organizationInvitation.updateMany({
      where: { organizationId, email: email.toLowerCase(), status: "pending" },
      data: { status: "canceled" },
    });
    const invitation = await tx.organizationInvitation.create({
      data: {
        id: randomBytes(24).toString("hex"),
        organizationId,
        email: email.toLowerCase(),
        role: "member",
        bpoAdminInvite: adminInvite,
        inviterId: actorId,
        expiresAt: new Date(Date.now() + 7 * 86400000),
        pulseGrants: {
          create: grants.map((g) => ({
            organizationId,
            accountId: g.accountId,
            role: g.role,
            teamIds: g.teamIds,
          })),
        },
      },
    });
    await audit(
      tx,
      organizationId,
      actorId,
      "INVITE",
      invitation.id,
      json({ email, grants, adminInvite }),
    );
    return { invitation, org };
  });
  const inviter = await db.user.findUniqueOrThrow({
    where: { id: actorId },
    select: { name: true, email: true, locale: true },
  });
  await sendInvitationEmail({
    id: result.invitation.id,
    email,
    role: adminInvite ? "BPO IT Admin" : grants.map((g) => g.role).join(", "),
    organization: { name: result.org.name },
    inviter: { user: inviter },
  });
  return { id: result.invitation.id };
}
export async function acceptBpoInvitation(
  userId: string,
  sessionId: string,
  invitationId: string,
) {
  return serial(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const invitation = await tx.organizationInvitation.findUnique({
      where: { id: invitationId },
      include: { pulseGrants: true, organization: { include: { bpo: true } } },
    });
    if (
      !user.emailVerified ||
      user.banned ||
      !invitation ||
      invitation.status !== "pending" ||
      invitation.expiresAt <= new Date() ||
      invitation.email.toLowerCase() !== user.email.toLowerCase() ||
      !invitation.organization.bpo ||
      invitation.organization.bpo.suspended
    )
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invitation unavailable or email not verified.",
      });
    // Recheck the inviter's authority: a revoked administrator cannot leave usable invitations.
    const inviter = await tx.user.findUnique({
      where: { id: invitation.inviterId },
      select: { role: true, banned: true },
    });
    if (!inviter || inviter.banned) throw new TRPCError({ code: "FORBIDDEN" });
    if (invitation.bpoAdminInvite) {
      if (inviter.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    } else await requireIt(invitation.inviterId, invitation.organizationId, tx);
    const member = await tx.member.upsert({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId,
        },
      },
      create: {
        organizationId: invitation.organizationId,
        userId,
        role: "member",
      },
      update: {},
    });
    if (invitation.bpoAdminInvite) {
      await tx.pulseAccountGrant.deleteMany({
        where: {
          memberId: member.id,
          organizationId: invitation.organizationId,
        },
      });
      await tx.bpoAdminGrant.upsert({
        where: { memberId: member.id },
        create: {
          memberId: member.id,
          organizationId: invitation.organizationId,
        },
        update: {},
      });
    } else
      await writeGrants(
        tx,
        member.id,
        invitation.organizationId,
        invitation.pulseGrants.map((g) => ({
          accountId: g.accountId,
          role: g.role,
          teamIds: g.teamIds,
        })),
      );
    await tx.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });
    await tx.session.update({
      where: { id: sessionId, userId },
      data: { activeOrganizationId: invitation.organizationId },
    });
    await audit(
      tx,
      invitation.organizationId,
      userId,
      "ACCEPT_INVITATION",
      invitation.id,
    );
    return { organizationId: invitation.organizationId };
  });
}
