import { createHash } from "node:crypto";
import db from "@workspace/database/client";
import type { Prisma } from "@workspace/database/prisma";
import { defineJob, PermanentJobError } from "@workspace/jobs/index";
import { z } from "zod";
import { audit, json, requireIt, serial, type Tx } from "./access";
import { parseCsv, validateRows } from "./csv";
import {
  masterSchemas,
  parseRecord,
  type ImportKind,
  type RawKind,
} from "./schemas";
export const fingerprint = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
async function references(
  tx: Tx,
  organizationId: string,
  accountId: string,
  p: Record<string, unknown>,
  source: string,
  cache = new Map<string, unknown>(),
) {
  const load = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    if (cache.has(key)) return cache.get(key) as T;
    const value = await fn();
    cache.set(key, value);
    return value;
  };
  const scope = { organizationId, accountId };
  // References accept stable internal IDs or account-local external IDs.
  if (p.processId) {
    const r = await load("processId:" + String(p.processId), () =>
      tx.pulseProcess.findFirst({
        where: {
          ...scope,
          OR: [
            { id: String(p.processId) },
            { externalId: String(p.processId) },
          ],
        },
      }),
    );
    if (!r) throw new Error("Unknown processId");
    p.processId = r.id;
  }
  if (p.siteId) {
    const r = await load("siteId:" + String(p.siteId), () =>
      tx.pulseSite.findFirst({
        where: {
          ...scope,
          OR: [{ id: String(p.siteId) }, { externalId: String(p.siteId) }],
        },
      }),
    );
    if (!r) throw new Error("Unknown siteId");
    p.siteId = r.id;
  }
  if (p.teamId) {
    const r = await load("teamId:" + String(p.teamId), () =>
      tx.pulseTeam.findFirst({
        where: {
          ...scope,
          OR: [{ id: String(p.teamId) }, { externalId: String(p.teamId) }],
        },
      }),
    );
    if (!r) throw new Error("Unknown teamId");
    p.teamId = r.id;
    cache.set("teamId:" + r.id, r);
    if (p.processId && p.processId !== r.processId)
      throw new Error("Team/process mismatch");
  }
  if (p.workerId) {
    const r = await load("workerId:" + String(p.workerId), () =>
      tx.pulseWorker.findFirst({
        where: {
          ...scope,
          OR: [{ id: String(p.workerId) }, { externalId: String(p.workerId) }],
        },
      }),
    );
    if (!r || r.teamId !== p.teamId)
      throw new Error("Unknown worker or team mismatch");
    p.workerId = r.id;
  }
  if (p.workTypeId) {
    const r = await load("workTypeId:" + String(p.workTypeId), () =>
      tx.pulseWorkType.findFirst({
        where: {
          ...scope,
          OR: [
            { id: String(p.workTypeId) },
            { externalId: String(p.workTypeId) },
          ],
        },
      }),
    );
    if (!r) throw new Error("Unknown workTypeId");
    if (
      p.teamId &&
      (
        await load("teamId:" + String(p.teamId), () =>
          tx.pulseTeam.findFirst({ where: { ...scope, id: String(p.teamId) } }),
        )
      )?.processId !== r.processId
    )
      throw new Error("Work type/team mismatch");
    p.workTypeId = r.id;
  }
  if (p.workItemId) {
    const r = await load("workItemId:" + String(p.workItemId), () =>
      tx.pulseRecord.findFirst({
        where: {
          ...scope,
          kind: "WORK_ITEM",
          OR: [
            { id: String(p.workItemId) },
            { externalId: String(p.workItemId), source },
          ],
        },
      }),
    );
    if (!r || r.teamId !== p.teamId)
      throw new Error("Unknown work item or team mismatch");
    p.workItemId = r.id;
  }
  if (
    p.ownerId &&
    !(await tx.member.findFirst({
      where: { organizationId, userId: String(p.ownerId) },
    }))
  )
    throw new Error("Owner is not a BPO member");
  return p;
}
export async function stageImport(
  actorId: string,
  organizationId: string,
  accountId: string,
  kind: ImportKind,
  source: string,
  csv: string,
  mapping: Record<string, string> = {},
) {
  await requireIt(actorId, organizationId);
  if (
    !(await db.clientAccount.findFirst({
      where: { id: accountId, organizationId, archived: false },
    }))
  )
    throw new Error("Client unavailable");
  const rows = validateRows(kind, parseCsv(csv), mapping);
  if (!rows.length) throw new Error("CSV has no data rows");
  // Reference validation happens both at preview and at publication, so grants or
  // master-data changes between these steps cannot publish an invalid batch.
  const cache = new Map<string, unknown>();
  await preloadWorkItems(
    db,
    organizationId,
    accountId,
    source,
    rows.map((r) => r.payload),
    cache,
  );
  for (const row of rows)
    if (!row.error)
      try {
        row.payload = await references(
          db,
          organizationId,
          accountId,
          { ...row.payload },
          source,
          cache,
        );
      } catch (e) {
        row.error = (e as Error).message;
      }
  const errorCount = rows.filter((r) => r.error).length;
  const batch = await db.pulseImportBatch.create({
    data: {
      organizationId,
      accountId,
      actorId,
      source,
      kind,
      rowCount: rows.length,
      errorCount,
      status: "STAGING",
    },
  });
  for (let i = 0; i < rows.length; i += 1000)
    await db.pulseImportRow.createMany({
      data: rows.slice(i, i + 1000).map((r) => ({
        batchId: batch.id,
        row: r.row,
        payload: json(r.payload),
        error: r.error,
      })),
    });
  await db.pulseImportBatch.update({
    where: { id: batch.id },
    data: { status: errorCount ? "INVALID" : "VALIDATED" },
  });
  return {
    id: batch.id,
    status: errorCount ? "INVALID" : "VALIDATED",
    rowCount: rows.length,
    errorCount,
    errors: rows
      .filter((r) => r.error)
      .slice(0, 100)
      .map((r) => ({ row: r.row, error: r.error })),
  };
}
export async function upsertSourceRow(
  tx: Tx,
  organizationId: string,
  accountId: string,
  kind: ImportKind,
  source: string,
  input: unknown,
  actorId: string,
  cache = new Map<string, unknown>(),
) {
  const payload = await references(
    tx,
    organizationId,
    accountId,
    parseRecord(kind, input),
    source,
    cache,
  );
  const externalId = String(payload.externalId),
    where = {
      organizationId_accountId_externalId: {
        organizationId,
        accountId,
        externalId,
      },
    },
    common = { organizationId, accountId, externalId };
  if (kind in masterSchemas) {
    switch (kind) {
      case "SITE": {
        const v = masterSchemas.SITE.parse(payload);
        await tx.pulseSite.upsert({
          where,
          create: { ...common, ...v },
          update: v,
        });
        break;
      }
      case "PROCESS": {
        const v = masterSchemas.PROCESS.parse(payload);
        await tx.pulseProcess.upsert({
          where,
          create: { ...common, ...v },
          update: v,
        });
        break;
      }
      case "TEAM": {
        const v = masterSchemas.TEAM.parse(payload);
        await tx.pulseTeam.upsert({
          where,
          create: { ...common, ...v },
          update: v,
        });
        break;
      }
      case "WORKER": {
        const v = masterSchemas.WORKER.parse(payload);
        await tx.pulseWorker.upsert({
          where,
          create: { ...common, ...v },
          update: v,
        });
        break;
      }
      case "WORK_TYPE": {
        const v = masterSchemas.WORK_TYPE.parse(payload);
        await tx.pulseWorkType.upsert({
          where,
          create: { ...common, ...v },
          update: v,
        });
        break;
      }
    }
    await audit(
      tx,
      organizationId,
      actorId,
      "MASTER_UPSERT",
      externalId,
      { kind },
      accountId,
    );
    return "updated";
  }
  const unique = {
    organizationId_accountId_kind_source_externalId: {
      organizationId,
      accountId,
      kind: kind as RawKind,
      source,
      externalId,
    },
  };
  const old = await tx.pulseRecord.findUnique({ where: unique });
  const hash = fingerprint(payload);
  if (old?.fingerprint === hash) return "skipped";
  if (old)
    await tx.pulseRecordRevision.create({
      data: {
        recordId: old.id,
        revision: old.revision,
        payload: json(old.payload),
        actorId,
      },
    });
  const values = {
    payload: json(payload),
    fingerprint: hash,
    teamId: payload.teamId ? String(payload.teamId) : null,
    workerId: payload.workerId ? String(payload.workerId) : null,
    occurredAt: new Date(String(payload.occurredAt)),
  };
  const record = await tx.pulseRecord.upsert({
    where: unique,
    create: { ...common, kind: kind as RawKind, source, ...values },
    update: { ...values, revision: { increment: 1 } },
  });
  await audit(
    tx,
    organizationId,
    actorId,
    old ? "RAW_REVISED" : "RAW_CREATED",
    record.id,
    { kind, source, externalId },
    accountId,
  );
  return old ? "updated" : "created";
}
async function preloadWorkItems(
  tx: Tx,
  organizationId: string,
  accountId: string,
  source: string,
  rows: Record<string, unknown>[],
  cache: Map<string, unknown>,
) {
  const ids = [
    ...new Set(
      rows
        .map((r) => r.workItemId)
        .filter(Boolean)
        .map(String),
    ),
  ];
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    for (const record of await tx.pulseRecord.findMany({
      where: {
        organizationId,
        accountId,
        kind: "WORK_ITEM",
        OR: [{ id: { in: chunk } }, { externalId: { in: chunk }, source }],
      },
    })) {
      cache.set("workItemId:" + record.id, record);
      if (record.source === source)
        cache.set("workItemId:" + record.externalId, record);
    }
  }
}
async function publishRawBatch(
  tx: Tx,
  batch: {
    organizationId: string;
    accountId: string;
    kind: string;
    source: string;
    actorId: string;
  },
  rows: { payload: unknown }[],
) {
  const { organizationId, accountId, source, actorId } = batch,
    kind = batch.kind as RawKind,
    cache = new Map<string, unknown>();
  const parsed = rows.map((r) => parseRecord(kind, r.payload));
  await preloadWorkItems(tx, organizationId, accountId, source, parsed, cache);
  const existing = new Map<
    string,
    Awaited<ReturnType<typeof tx.pulseRecord.findMany>>[number]
  >();
  for (let i = 0; i < parsed.length; i += 1000) {
    const ids = parsed.slice(i, i + 1000).map((r) => String(r.externalId));
    for (const r of await tx.pulseRecord.findMany({
      where: {
        organizationId,
        accountId,
        kind,
        source,
        externalId: { in: ids },
      },
    }))
      existing.set(r.externalId, r);
  }
  const creates: Prisma.PulseRecordCreateManyInput[] = [],
    audits: Prisma.PulseAuditEventCreateManyInput[] = [],
    seen = new Set<string>(),
    counts = { created: 0, updated: 0, skipped: 0 };
  for (const input of parsed) {
    const payload = await references(
        tx,
        organizationId,
        accountId,
        input,
        source,
        cache,
      ),
      externalId = String(payload.externalId),
      hash = fingerprint(payload),
      old = existing.get(externalId);
    if (seen.has(externalId) || old?.fingerprint === hash) {
      counts.skipped++;
      continue;
    }
    seen.add(externalId);
    const values = {
      payload: json(payload),
      fingerprint: hash,
      teamId: payload.teamId ? String(payload.teamId) : null,
      workerId: payload.workerId ? String(payload.workerId) : null,
      occurredAt: new Date(String(payload.occurredAt)),
    };
    const recordId = old?.id || crypto.randomUUID();
    if (old) {
      await tx.pulseRecordRevision.create({
        data: {
          recordId: old.id,
          revision: old.revision,
          payload: json(old.payload),
          actorId,
        },
      });
      await tx.pulseRecord.update({
        where: { id: old.id },
        data: { ...values, revision: { increment: 1 } },
      });
      counts.updated++;
    } else {
      creates.push({
        id: recordId,
        organizationId,
        accountId,
        source,
        externalId,
        kind,
        ...values,
      });
      counts.created++;
    }
    audits.push({
      organizationId,
      accountId,
      actorId,
      action: old ? "RAW_REVISED" : "RAW_CREATED",
      entityId: recordId,
      detail: { kind, source, externalId },
    });
  }
  for (let i = 0; i < creates.length; i += 1000)
    await tx.pulseRecord.createMany({ data: creates.slice(i, i + 1000) });
  for (let i = 0; i < audits.length; i += 1000)
    await tx.pulseAuditEvent.createMany({ data: audits.slice(i, i + 1000) });
  return counts;
}
export async function commitImport(batchId: string) {
  return serial(async (tx) => {
    const batch = await tx.pulseImportBatch.findUniqueOrThrow({
      where: { id: batchId },
      include: { rows: { orderBy: { row: "asc" } } },
    });
    if (batch.status === "COMMITTED") return;
    if (batch.rows.length !== batch.rowCount)
      throw new PermanentJobError("Batch staging is incomplete");
    if (batch.status !== "QUEUED" && batch.status !== "VALIDATED")
      throw new PermanentJobError("Batch is not valid");
    await requireIt(batch.actorId, batch.organizationId, tx);
    if (
      !(await tx.clientAccount.findFirst({
        where: {
          id: batch.accountId,
          organizationId: batch.organizationId,
          archived: false,
        },
      }))
    )
      throw new PermanentJobError("Client unavailable");
    if (batch.rows.some((row) => row.error))
      throw new PermanentJobError("Batch contains invalid rows");
    let counts = { created: 0, updated: 0, skipped: 0 };
    const cache = new Map<string, unknown>();
    if (batch.kind in masterSchemas) {
      for (const row of batch.rows)
        counts[
          await upsertSourceRow(
            tx,
            batch.organizationId,
            batch.accountId,
            batch.kind as ImportKind,
            batch.source,
            row.payload,
            batch.actorId,
            cache,
          )
        ]++;
    } else counts = await publishRawBatch(tx, batch, batch.rows);
    await tx.clientAccount.update({
      where: { id: batch.accountId },
      data: { revision: { increment: 1 } },
    });
    await tx.pulseImportBatch.update({
      where: { id: batchId },
      data: { status: "COMMITTED", committedAt: new Date(), result: counts },
    });
    await audit(
      tx,
      batch.organizationId,
      batch.actorId,
      "IMPORT_COMMITTED",
      batch.id,
      counts,
      batch.accountId,
    );
  }, 300000);
}
export const pulseImportJob = defineJob(
  "pulse.import",
  z.object({ batchId: z.string() }),
  async ({ batchId }) => {
    try {
      await commitImport(batchId);
    } catch (e) {
      await db.pulseImportBatch.updateMany({
        where: { id: batchId, status: { not: "COMMITTED" } },
        data: {
          result: {
            message:
              "Import did not publish; check source references and retry.",
          },
        },
      });
      throw e;
    }
  },
  { retries: 2, version: 1 },
);
