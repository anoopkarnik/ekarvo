import { z } from "zod";
import db from "@workspace/database/client";
import { TRPCError } from "@trpc/server";
import { enqueue } from "@workspace/jobs/index";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../init";
import {
  accountAccess,
  assertPlatformAdmin,
  audit,
  requireOperations,
  json,
  requireIt,
  serial,
} from "@/lib/pulse/access";
import { issueInvite, writeGrants } from "@/lib/pulse/membership";
import { dashboard } from "@/lib/pulse/queries";
import {
  credentialsSchema,
  createStaffUser,
  createItUser,
  provisionWithItLogin,
} from "@/lib/pulse/users";
import {
  id,
  scopeSchema,
  periodSchema,
  roleSchema,
  parametersSchema,
  importKindSchema,
  rawSchemas,
  masterSchemas,
} from "@/lib/pulse/schemas";
import { upsertSourceRow, pulseImportJob } from "@/lib/pulse/imports";
import {
  saveScenario,
  scenarioList,
  proposeScenario,
  transitionAction,
} from "@/lib/pulse/workflows";
const grantsSchema = z
  .array(
    z.object({
      accountId: id,
      role: roleSchema,
      teamIds: z.array(id).max(100).default([]),
    }),
  )
  .max(100);
const orgInput = z.object({ organizationId: id });
export const pulseRouter = createTRPCRouter({
  bootstrap: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await db.member.findMany({
      where: {
        userId: ctx.session.user.id,
        organization: { bpo: { isNot: null } },
      },
      include: {
        organization: { include: { bpo: true } },
        bpoAdmin: true,
        pulseGrants: {
          include: {
            account: { select: { id: true, name: true, archived: true } },
            teams: true,
          },
        },
      },
    });
    return {
      userId: ctx.session.user.id,
      platformAdmin: ctx.session.user.role === "admin",
      organizations: memberships.map((m) => ({
        id: m.organizationId,
        name: m.organization.name,
        suspended: m.organization.bpo!.suspended,
        isItAdmin: !!m.bpoAdmin,
        timezone: m.organization.bpo!.timezone,
        seeded: m.organization.bpo!.seeded,
        accounts: (m.bpoAdmin ? [] : m.pulseGrants)
          .filter((g) => !g.account.archived)
          .map((g) => ({
            ...g.account,
            role: g.role,
            teamIds: g.teams.map((t) => t.teamId),
          })),
      })),
    };
  }),
  dashboard: protectedProcedure
    .input(periodSchema)
    .query(({ ctx, input }) => dashboard(ctx.session.user.id, input)),
  portfolio: protectedProcedure
    .input(orgInput.extend({ from: z.string(), through: z.string() }))
    .query(async ({ ctx, input }) => {
      const a = await requireOperations(
        ctx.session.user.id,
        input.organizationId,
      );
      return Promise.all(
        a.grants
          .map((g) =>
            dashboard(ctx.session.user.id, {
              ...input,
              accountId: g.accountId,
            }),
          )
          .map(async (pending) => {
            const d = await pending;
            return {
              account: d.account,
              role: d.role,
              metrics: d.metrics,
              opportunities: d.opportunities,
            };
          }),
      );
    }),
  donors: protectedProcedure.input(orgInput).query(async ({ ctx, input }) => {
    const a = await requireOperations(
      ctx.session.user.id,
      input.organizationId,
    );
    return db.pulseTeam.findMany({
      where: {
        organizationId: input.organizationId,
        OR: a.grants.map((g) => ({
          accountId: g.accountId,
          ...(g.role === "TEAM_LEAD" ? { id: { in: g.teamIds } } : {}),
        })),
        account: { archived: false },
      },
      select: {
        id: true,
        name: true,
        accountId: true,
        account: { select: { name: true, fenced: true } },
      },
    });
  }),
  commercial: protectedProcedure
    .input(scopeSchema)
    .query(async ({ ctx, input }) => {
      const a = await accountAccess(
        ctx.session.user.id,
        input.organizationId,
        input.accountId,
      );
      if (!a.financial) throw new TRPCError({ code: "FORBIDDEN" });
      const contracts = await db.pulseRecord.findMany({
        where: { ...input, kind: "CONTRACT" },
        orderBy: { occurredAt: "desc" },
      });
      return contracts.map((r) => ({
        id: r.id,
        externalId: r.externalId,
        source: r.source,
        revision: r.revision,
        payload: r.payload as Record<string, unknown>,
      }));
    }),
  contract: protectedProcedure
    .input(scopeSchema.extend({ payload: rawSchemas.CONTRACT }))
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        const a = await accountAccess(
          ctx.session.user.id,
          input.organizationId,
          input.accountId,
          undefined,
          tx,
        );
        if (a.grant.role !== "COO_EXECUTIVE")
          throw new TRPCError({ code: "FORBIDDEN" });
        await upsertSourceRow(
          tx,
          input.organizationId,
          input.accountId,
          "CONTRACT",
          "pulse",
          input.payload,
          ctx.session.user.id,
        );
        await tx.clientAccount.update({
          where: { id: input.accountId },
          data: { revision: { increment: 1 } },
        });
        return { success: true };
      }),
    ),
  standard: protectedProcedure
    .input(scopeSchema.extend({ payload: masterSchemas.WORK_TYPE }))
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        const a = await accountAccess(
          ctx.session.user.id,
          input.organizationId,
          input.accountId,
          undefined,
          tx,
        );
        if (a.grant.role !== "COO_EXECUTIVE")
          throw new TRPCError({ code: "FORBIDDEN" });
        await upsertSourceRow(
          tx,
          input.organizationId,
          input.accountId,
          "WORK_TYPE",
          "pulse",
          input.payload,
          ctx.session.user.id,
        );
        await tx.clientAccount.update({
          where: { id: input.accountId },
          data: { revision: { increment: 1 } },
        });
        return { success: true };
      }),
    ),
  audit: protectedProcedure.input(scopeSchema).query(async ({ ctx, input }) => {
    const a = await accountAccess(
      ctx.session.user.id,
      input.organizationId,
      input.accountId,
    );
    const visible = await scenarioList(ctx.session.user.id, input);
    const entities = visible.flatMap((s) => [
      s.id,
      ...s.interventions.map((i) => i.id),
    ]);
    return db.pulseAuditEvent.findMany({
      where: {
        ...input,
        ...(a.grant.role === "TEAM_LEAD" ? { entityId: { in: entities } } : {}),
      },
      select: {
        id: true,
        action: true,
        actorId: true,
        entityId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }),
  scenarios: protectedProcedure
    .input(scopeSchema)
    .query(({ ctx, input }) => scenarioList(ctx.session.user.id, input)),
  saveScenario: protectedProcedure
    .input(
      periodSchema.extend({
        name: z.string().trim().min(1).max(100),
        workflow: z.enum([
          "SERVICE_RECOVERY",
          "QUALITY_RECOVERY",
          "MARGIN_RECOVERY",
        ]),
        parameters: parametersSchema,
        actionStart: z.string(),
        actionEnd: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => saveScenario(ctx.session.user.id, input)),
  propose: protectedProcedure
    .input(orgInput.extend({ scenarioId: id }))
    .mutation(({ ctx, input }) =>
      proposeScenario(
        ctx.session.user.id,
        input.organizationId,
        input.scenarioId,
      ),
    ),
  transition: protectedProcedure
    .input(
      orgInput.extend({
        id,
        version: z.number().int().positive(),
        status: z.enum([
          "APPROVED",
          "REJECTED",
          "IN_PROGRESS",
          "COMPLETED",
          "VERIFIED",
          "CANCELLED",
        ]),
      }),
    )
    .mutation(({ ctx, input }) => transitionAction(ctx.session.user.id, input)),
  activity: protectedProcedure
    .input(
      scopeSchema.extend({
        kind: z.enum(["HANDOVER", "COACHING", "AUTOMATION"]),
        payload: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        const a = await accountAccess(
          ctx.session.user.id,
          input.organizationId,
          input.accountId,
          [String(input.payload.teamId)],
          tx,
        );
        const externalId = String(
          input.payload.externalId || crypto.randomUUID(),
        );
        const old = await tx.pulseRecord.findFirst({
          where: {
            organizationId: input.organizationId,
            accountId: input.accountId,
            kind: input.kind,
            source: "pulse",
            externalId,
          },
        });
        if (
          old &&
          a.grant.role === "TEAM_LEAD" &&
          !a.grant.teamIds.includes(old.teamId || "")
        )
          throw new TRPCError({ code: "FORBIDDEN" });
        await upsertSourceRow(
          tx,
          input.organizationId,
          input.accountId,
          input.kind,
          "pulse",
          {
            ...input.payload,
            externalId,
            occurredAt: new Date().toISOString(),
            ownerId: ctx.session.user.id,
          },
          ctx.session.user.id,
        );
        return { success: true };
      }),
    ),
  configure: protectedProcedure
    .input(
      scopeSchema.extend({
        targetSla: z.number().min(0).max(100),
        targetMargin: z.number().min(0).max(100),
        fenced: z.boolean(),
        limits: z.object({
          TEAM_LEAD: z.number().min(0).max(40),
          OPS_MANAGER: z.number().min(0).max(140),
          COO_EXECUTIVE: z.number().min(0).max(220),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        const a = await accountAccess(
          ctx.session.user.id,
          input.organizationId,
          input.accountId,
          undefined,
          tx,
        );
        if (a.grant.role !== "COO_EXECUTIVE")
          throw new TRPCError({ code: "FORBIDDEN" });
        await tx.clientAccount.update({
          where: { id: input.accountId },
          data: {
            targetSla: input.targetSla,
            targetMargin: input.targetMargin,
            fenced: input.fenced,
            approvalLimits: input.limits,
            revision: { increment: 1 },
          },
        });
        await audit(
          tx,
          input.organizationId,
          ctx.session.user.id,
          "CONFIG_CHANGED",
          input.accountId,
          {},
          input.accountId,
        );
        return { success: true };
      }),
    ),
  administration: protectedProcedure
    .input(orgInput)
    .query(async ({ ctx, input }) => {
      await requireIt(ctx.session.user.id, input.organizationId);
      const [
        accounts,
        members,
        invitations,
        imports,
        mappings,
        teams,
        processes,
        sites,
        workers,
        workTypes,
      ] = await Promise.all([
        db.clientAccount.findMany({
          where: input,
          select: {
            id: true,
            name: true,
            code: true,
            vertical: true,
            archived: true,
          },
        }),
        db.member.findMany({
          where: input,
          include: {
            user: { select: { id: true, name: true, email: true } },
            bpoAdmin: true,
            pulseGrants: { include: { teams: true } },
          },
        }),
        db.organizationInvitation.findMany({
          where: { ...input, status: "pending" },
          include: { pulseGrants: true },
        }),
        db.pulseImportBatch.findMany({
          where: input,
          select: {
            id: true,
            accountId: true,
            kind: true,
            source: true,
            status: true,
            rowCount: true,
            errorCount: true,
            result: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        db.pulseMapping.findMany({ where: input }),
        db.pulseTeam.findMany({ where: input }),
        db.pulseProcess.findMany({ where: input }),
        db.pulseSite.findMany({ where: input }),
        db.pulseWorker.findMany({
          where: input,
          select: {
            id: true,
            externalId: true,
            name: true,
            teamId: true,
            accountId: true,
            active: true,
            fte: true,
          },
        }),
        db.pulseWorkType.findMany({ where: input }),
      ]);
      return {
        accounts,
        members,
        invitations,
        imports: imports.map((b) => ({
          ...b,
          result: b.result as Record<string, string | number> | null,
        })),
        mappings: mappings.map((m) => ({
          ...m,
          fields: m.fields as Record<string, string>,
        })),
        teams,
        processes,
        sites,
        workers,
        workTypes,
      };
    }),
  client: protectedProcedure
    .input(
      orgInput.extend({
        id: id.optional(),
        name: z.string().trim().min(1).max(120),
        code: id,
        vertical: z.enum(["HEALTHCARE_RCM", "FINANCE_ACCOUNTING", "INSURANCE"]),
        archived: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        await requireIt(ctx.session.user.id, input.organizationId, tx);
        const fields = {
          name: input.name,
          code: input.code,
          vertical: input.vertical,
          archived: input.archived,
        };
        const result = input.id
          ? await tx.clientAccount.update({
              where: { id: input.id, organizationId: input.organizationId },
              data: fields,
            })
          : await tx.clientAccount.create({
              data: { organizationId: input.organizationId, ...fields },
            });
        await audit(
          tx,
          input.organizationId,
          ctx.session.user.id,
          "CLIENT_SAVED",
          result.id,
        );
        return { id: result.id };
      }),
    ),
  invite: protectedProcedure
    .input(
      orgInput.extend({
        email: z.string().email(),
        grants: grantsSchema.min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      issueInvite(
        ctx.session.user.id,
        input.organizationId,
        input.email,
        input.grants,
      ),
    ),
  createUser: protectedProcedure
    .input(
      credentialsSchema.extend({
        organizationId: id,
        grants: grantsSchema.min(1),
      }),
    )
    .mutation(({ ctx, input }) => createStaffUser(ctx.session.user.id, input)),
  member: protectedProcedure
    .input(orgInput.extend({ memberId: id, grants: grantsSchema }))
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        await requireIt(ctx.session.user.id, input.organizationId, tx);
        const member = await tx.member.findFirst({
          where: { id: input.memberId, organizationId: input.organizationId },
        });
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        await writeGrants(tx, member.id, input.organizationId, input.grants);
        await audit(
          tx,
          input.organizationId,
          ctx.session.user.id,
          "GRANTS_CHANGED",
          member.id,
          json(input.grants),
        );
        return { success: true };
      }),
    ),
  revokeInvitation: protectedProcedure
    .input(orgInput.extend({ id }))
    .mutation(async ({ ctx, input }) => {
      await requireIt(ctx.session.user.id, input.organizationId);
      await db.organizationInvitation.updateMany({
        where: {
          id: input.id,
          organizationId: input.organizationId,
          status: "pending",
          bpoAdminInvite: false,
        },
        data: { status: "canceled" },
      });
      return { success: true };
    }),
  master: protectedProcedure
    .input(
      scopeSchema.extend({
        kind: z.enum(["SITE", "PROCESS", "TEAM", "WORKER", "WORK_TYPE"]),
        payload: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      serial(async (tx) => {
        await requireIt(ctx.session.user.id, input.organizationId, tx);
        await upsertSourceRow(
          tx,
          input.organizationId,
          input.accountId,
          input.kind,
          "native",
          input.payload,
          ctx.session.user.id,
        );
        await tx.clientAccount.update({
          where: { id: input.accountId, organizationId: input.organizationId },
          data: { revision: { increment: 1 } },
        });
        return { success: true };
      }),
    ),
  mapping: protectedProcedure
    .input(
      scopeSchema.extend({
        name: id,
        kind: importKindSchema,
        fields: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireIt(ctx.session.user.id, input.organizationId);
      return db.pulseMapping.upsert({
        where: {
          organizationId_accountId_name: {
            organizationId: input.organizationId,
            accountId: input.accountId,
            name: input.name,
          },
        },
        create: { ...input, connected: false },
        update: { kind: input.kind, fields: input.fields, connected: false },
      });
    }),
  commitImport: protectedProcedure
    .input(orgInput.extend({ id }))
    .mutation(async ({ ctx, input }) => {
      await requireIt(ctx.session.user.id, input.organizationId);
      const batch = await db.pulseImportBatch.findFirst({
        where: { id: input.id, organizationId: input.organizationId },
      });
      if (!batch || !["VALIDATED", "QUEUED"].includes(batch.status))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Batch is not ready.",
        });
      const claimed = await db.pulseImportBatch.updateMany({
        where: { id: batch.id, status: "VALIDATED" },
        data: { status: "QUEUED", actorId: ctx.session.user.id },
      });
      if (claimed.count || batch.status === "QUEUED")
        await enqueue(pulseImportJob, { batchId: batch.id });
      return { success: true };
    }),
});
export const adminBpoRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    await assertPlatformAdmin(ctx.session.user.id);
    return db.bpoProfile.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            invitations: {
              where: { bpoAdminInvite: true, status: "pending" },
              select: { id: true, email: true, expiresAt: true },
            },
          },
        },
        admins: {
          include: {
            member: {
              include: {
                user: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
  provision: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        email: z.string().email(),
        timezone: z.string().default("Asia/Kolkata"),
        mode: z.enum(["INVITE", "CREATE_LOGIN"]).default("INVITE"),
        staffName: z.string().trim().min(1).max(50).optional(),
        password: z.string().min(8).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx.session.user.id);
      if (input.mode === "CREATE_LOGIN") {
        const credentials = credentialsSchema.parse({
          name: input.staffName,
          email: input.email,
          password: input.password,
        });
        return provisionWithItLogin(ctx.session.user.id, {
          ...credentials,
          bpoName: input.name,
          timezone: input.timezone,
        });
      }
      try {
        new Intl.DateTimeFormat("en", { timeZone: input.timezone });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid timezone.",
        });
      }
      const org = await db.organization.create({
        data: {
          name: input.name,
          slug: `bpo-${crypto.randomUUID()}`,
          bpo: { create: { timezone: input.timezone } },
        },
      });
      await issueInvite(ctx.session.user.id, org.id, input.email, [], true);
      return { id: org.id };
    }),
  appoint: adminProcedure
    .input(
      orgInput.extend({
        email: z.string().email(),
        mode: z.enum(["INVITE", "CREATE_LOGIN"]).default("INVITE"),
        staffName: z.string().trim().min(1).max(50).optional(),
        password: z.string().min(8).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx.session.user.id);
      if (input.mode === "CREATE_LOGIN") {
        const credentials = credentialsSchema.parse({
          name: input.staffName,
          email: input.email,
          password: input.password,
        });
        return createItUser(ctx.session.user.id, {
          ...credentials,
          organizationId: input.organizationId,
        });
      }
      return issueInvite(
        ctx.session.user.id,
        input.organizationId,
        input.email,
        [],
        true,
      );
    }),
  suspend: adminProcedure
    .input(orgInput.extend({ suspended: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx.session.user.id);
      await db.bpoProfile.update({
        where: { organizationId: input.organizationId },
        data: { suspended: input.suspended },
      });
      await audit(
        db,
        input.organizationId,
        ctx.session.user.id,
        input.suspended ? "SUSPENDED" : "RESUMED",
        input.organizationId,
      );
      return { success: true };
    }),
  cancelInvitation: adminProcedure
    .input(orgInput.extend({ id }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx.session.user.id);
      await db.organizationInvitation.updateMany({
        where: {
          id: input.id,
          organizationId: input.organizationId,
          status: "pending",
          organization: { bpo: { isNot: null } },
        },
        data: { status: "canceled" },
      });
      await audit(
        db,
        input.organizationId,
        ctx.session.user.id,
        "INVITATION_REVOKED",
        input.id,
      );
      return { success: true };
    }),
  revokeAdmin: adminProcedure
    .input(orgInput.extend({ memberId: id }))
    .mutation(async ({ ctx, input }) => {
      await assertPlatformAdmin(ctx.session.user.id);
      await db.bpoAdminGrant.deleteMany({ where: input });
      await audit(
        db,
        input.organizationId,
        ctx.session.user.id,
        "IT_ADMIN_REVOKED",
        input.memberId,
      );
      return { success: true };
    }),
});
