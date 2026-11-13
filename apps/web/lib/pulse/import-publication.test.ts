import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  member: { findUnique: vi.fn() },
  clientAccount: { findFirst: vi.fn(), update: vi.fn() },
  pulseImportBatch: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  pulseRecord: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    createMany: vi.fn(),
  },
  pulseRecordRevision: { create: vi.fn() },
  pulseAuditEvent: { create: vi.fn(), createMany: vi.fn() },
}));
vi.mock("@workspace/database/client", () => ({ default: db }));
import { commitImport, upsertSourceRow, fingerprint } from "./imports";
import { parseRecord } from "./schemas";
const payload = {
  externalId: "rev-1",
  occurredAt: "2026-11-01T00:00:00Z",
  category: "REVENUE",
  amount: 100,
  currency: "USD",
};
beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((fn) => fn(db));
  db.member.findUnique.mockResolvedValue({
    id: "m",
    organization: { bpo: { suspended: false } },
    bpoAdmin: { organizationId: "bpo" },
    pulseGrants: [],
  });
  db.clientAccount.findFirst.mockResolvedValue({ id: "client" });
  db.pulseRecord.findMany.mockResolvedValue([]);
  db.pulseRecord.upsert.mockResolvedValue({ id: "record" });
});
describe("import publication invariants", () => {
  it("does nothing on a repeated committed batch", async () => {
    db.pulseImportBatch.findUniqueOrThrow.mockResolvedValue({
      status: "COMMITTED",
    });
    await commitImport("batch");
    expect(db.pulseRecord.createMany).not.toHaveBeenCalled();
    expect(db.clientAccount.update).not.toHaveBeenCalled();
  });
  it("rejects incomplete staging before publishing any raw records", async () => {
    db.pulseImportBatch.findUniqueOrThrow.mockResolvedValue({
      status: "VALIDATED",
      rowCount: 2,
      rows: [{ payload }],
    });
    await expect(commitImport("batch")).rejects.toThrow("incomplete");
    expect(db.pulseRecord.createMany).not.toHaveBeenCalled();
  });
  it("skips identical source records without rewriting revision history", async () => {
    db.pulseRecord.findUnique.mockResolvedValue({
      id: "record",
      fingerprint: fingerprint(parseRecord("FINANCE", payload)),
    });
    await expect(
      upsertSourceRow(
        db as never,
        "bpo",
        "client",
        "FINANCE",
        "csv",
        payload,
        "actor",
      ),
    ).resolves.toBe("skipped");
    expect(db.pulseRecord.upsert).not.toHaveBeenCalled();
    expect(db.pulseRecordRevision.create).not.toHaveBeenCalled();
  });
  it("preserves the previous raw payload before correcting a source record", async () => {
    db.pulseRecord.findUnique.mockResolvedValue({
      id: "record",
      revision: 2,
      payload: { amount: 90 },
      fingerprint: "old",
    });
    await expect(
      upsertSourceRow(
        db as never,
        "bpo",
        "client",
        "FINANCE",
        "csv",
        payload,
        "actor",
      ),
    ).resolves.toBe("updated");
    expect(db.pulseRecordRevision.create).toHaveBeenCalledWith({
      data: {
        recordId: "record",
        revision: 2,
        payload: { amount: 90 },
        actorId: "actor",
      },
    });
  });
  it("publishes new records in bulk and commits batch metadata in the same serializable transaction", async () => {
    db.pulseImportBatch.findUniqueOrThrow.mockResolvedValue({
      id: "batch",
      organizationId: "bpo",
      accountId: "client",
      actorId: "actor",
      kind: "FINANCE",
      source: "csv",
      status: "QUEUED",
      rowCount: 1,
      rows: [{ payload, error: null }],
    });
    await commitImport("batch");
    expect(db.pulseRecord.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          organizationId: "bpo",
          accountId: "client",
          kind: "FINANCE",
          externalId: "rev-1",
        }),
      ],
    });
    expect(db.pulseImportBatch.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "COMMITTED",
          result: { created: 1, updated: 0, skipped: 0 },
        }),
      }),
    );
    expect(db.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
  });
});
