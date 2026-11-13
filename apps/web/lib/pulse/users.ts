import { z } from "zod";
import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { createManagedCredentials } from "@workspace/database/managed-credentials";
import {
  assertPlatformAdmin,
  audit,
  requireIt,
  serial,
  type Tx,
} from "./access";
import { validateGrants, writeGrants } from "./membership";
import type { AccountGrant } from "./policy";

export const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(50),
});
type Credentials = z.infer<typeof credentialsSchema>;
async function login(tx: Tx, input: Credentials) {
  try {
    return await createManagedCredentials(tx, input);
  } catch (e) {
    if (
      (e as { code?: string }).code === "P2002" ||
      (e instanceof Error && e.message.includes("already exists"))
    )
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "An account with this email already exists. Use an invitation for an existing user.",
      });
    throw e;
  }
}
export async function createStaffUser(
  actorId: string,
  input: Credentials & { organizationId: string; grants: AccountGrant[] },
) {
  const credentials = credentialsSchema.parse(input);
  if (!input.grants.length)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Assign at least one client role.",
    });
  return serial(async (tx) => {
    await requireIt(actorId, input.organizationId, tx);
    await validateGrants(tx, input.organizationId, input.grants);
    const user = await login(tx, credentials);
    const member = await tx.member.create({
      data: {
        organizationId: input.organizationId,
        userId: user.id,
        role: "member",
      },
    });
    await writeGrants(tx, member.id, input.organizationId, input.grants);
    await audit(tx, input.organizationId, actorId, "STAFF_CREATED", user.id, {
      memberId: member.id,
      grants: input.grants,
    });
    return user;
  });
}
async function installItLogin(
  tx: Tx,
  actorId: string,
  organizationId: string,
  credentials: Credentials,
) {
  const user = await login(tx, credentials);
  const member = await tx.member.create({
    data: { organizationId, userId: user.id, role: "member" },
  });
  await tx.bpoAdminGrant.create({
    data: { memberId: member.id, organizationId },
  });
  await audit(tx, organizationId, actorId, "IT_ADMIN_CREATED", user.id, {
    memberId: member.id,
  });
  return user;
}
export async function createItUser(
  actorId: string,
  input: Credentials & { organizationId: string },
) {
  const credentials = credentialsSchema.parse(input);
  return serial(async (tx) => {
    await assertPlatformAdmin(actorId, tx);
    if (
      !(await tx.organization.findFirst({
        where: { id: input.organizationId, bpo: { isNot: null } },
      }))
    )
      throw new TRPCError({ code: "NOT_FOUND", message: "BPO unavailable." });
    return installItLogin(tx, actorId, input.organizationId, credentials);
  });
}
export async function provisionWithItLogin(
  actorId: string,
  input: Credentials & { bpoName: string; timezone: string },
) {
  const credentials = credentialsSchema.parse(input);
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timezone });
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid timezone." });
  }
  return serial(async (tx) => {
    await assertPlatformAdmin(actorId, tx);
    const org = await tx.organization.create({
      data: {
        name: input.bpoName,
        slug: `bpo-${randomUUID()}`,
        bpo: { create: { timezone: input.timezone } },
      },
    });
    await installItLogin(tx, actorId, org.id, credentials);
    return { id: org.id };
  });
}
