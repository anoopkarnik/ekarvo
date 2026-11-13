import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  audit: vi.fn(),
  db: {
    pulseIntervention: { findFirst: vi.fn(), update: vi.fn() },
    pulseReservation: {
      updateMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    pulseTeam: { findFirst: vi.fn() },
  },
}));
vi.mock("@workspace/database/client", () => ({ default: mocks.db }));
vi.mock("./notifications", () => ({ notifyActionOwner: vi.fn() }));
vi.mock("./access", () => ({
  accountAccess: mocks.access,
  audit: mocks.audit,
  json: (v: unknown) => v,
  serial: (fn: (tx: unknown) => unknown) => fn(mocks.db),
}));
import { transitionAction } from "./workflows";
const action = () => ({
  id: "action",
  organizationId: "bpo",
  accountId: "client",
  version: 1,
  ownerId: "u",
  status: "PROPOSED",
  start: new Date(Date.now() + 3600000),
  end: new Date(Date.now() + 2 * 3600000),
  scenario: {
    id: "scenario",
    teamIds: ["receiving"],
    workflow: "SERVICE_RECOVERY",
    accountRevision: 1,
    parameters: { overtimeHours: 40 },
    result: { sufficient: true },
  },
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.access.mockResolvedValue({
    grant: { role: "TEAM_LEAD", teamIds: ["receiving"] },
    financial: false,
    bpo: { timezone: "UTC" },
    account: { revision: 1, approvalLimits: { TEAM_LEAD: 40 } },
  });
  mocks.db.pulseIntervention.findFirst.mockResolvedValue(action());
  mocks.db.pulseReservation.aggregate.mockImplementation(({ where }) =>
    Promise.resolve({
      _sum: { overtimeHours: where.released === false ? 0 : 40 },
    }),
  );
});
describe("transactional intervention approvals", () => {
  it("rejects a donor already included in the receiving baseline", async () => {
    const saved = action();
    mocks.db.pulseIntervention.findFirst.mockResolvedValue({
      ...saved,
      scenario: {
        ...saved.scenario,
        parameters: {
          overtimeHours: 0,
          redeployFte: 1,
          donorTeamId: "receiving",
        },
      },
    });
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 1,
        status: "APPROVED",
      }),
    ).rejects.toThrow("outside the receiving");
    expect(mocks.db.pulseReservation.create).not.toHaveBeenCalled();
  });
  it("approves with reservations and an audit event without modifying actual records or the saved scenario", async () => {
    const saved = action();
    const snapshot = JSON.stringify(saved);
    mocks.db.pulseIntervention.findFirst.mockResolvedValue(saved);
    mocks.db.pulseReservation.aggregate.mockResolvedValue({
      _sum: { overtimeHours: 0 },
    });
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 1,
        status: "APPROVED",
      }),
    ).resolves.toEqual({ success: true });
    expect(mocks.db.pulseReservation.create).toHaveBeenCalled();
    expect(mocks.db.pulseIntervention.update).toHaveBeenCalledWith({
      where: { id: "action", version: 1 },
      data: { status: "APPROVED", version: { increment: 1 } },
    });
    expect(mocks.audit).toHaveBeenCalled();
    expect(JSON.stringify(saved)).toBe(snapshot);
    // This transaction mock deliberately exposes no raw-record or scenario
    // write delegates: approval must only mutate the action and reservations.
  });
  it("retains weekly overtime spending after a prior action releases its resource reservation", async () => {
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 1,
        status: "APPROVED",
      }),
    ).rejects.toThrow("Weekly overtime");
    expect(mocks.db.pulseIntervention.update).not.toHaveBeenCalled();
  });
  it("rejects stale revisions and duplicate approval transitions", async () => {
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 2,
        status: "APPROVED",
      }),
    ).rejects.toThrow("stale");
    mocks.db.pulseIntervention.findFirst.mockResolvedValue({
      ...action(),
      status: "APPROVED",
    });
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 1,
        status: "APPROVED",
      }),
    ).rejects.toThrow();
  });
  it("requires new simulation after raw records change", async () => {
    mocks.access.mockResolvedValue({
      grant: { role: "TEAM_LEAD", teamIds: ["receiving"] },
      financial: false,
      bpo: { timezone: "UTC" },
      account: { revision: 2, approvalLimits: { TEAM_LEAD: 40 } },
    });
    await expect(
      transitionAction("u", {
        organizationId: "bpo",
        id: "action",
        version: 1,
        status: "APPROVED",
      }),
    ).rejects.toThrow("Source data changed");
  });
});
