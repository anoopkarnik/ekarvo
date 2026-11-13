import { expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn() }));
vi.mock("@workspace/database/client", () => ({ default: {} }));
vi.mock("./access", () => ({ accountAccess: mocks.access }));
import { dashboard } from "./queries";

it("keeps hidden work types and financial fields out of every Team Lead dashboard projection", async () => {
  const where = {
    organizationId: "bpo",
    accountId: "client",
    teamId: { in: ["team"] },
  };
  mocks.access.mockResolvedValue({
    where,
    financial: false,
    isItAdmin: false,
    grant: { role: "TEAM_LEAD", teamIds: ["team"] },
    grants: [{ accountId: "client", role: "TEAM_LEAD", teamIds: ["team"] }],
    bpo: { timezone: "UTC", seeded: false },
    account: {
      id: "client",
      name: "Client",
      approvalLimits: {},
      targetSla: 97,
      targetMargin: 25,
    },
  });
  const client = {
    pulseRecord: { findMany: vi.fn().mockResolvedValue([]) },
    pulseTeam: {
      findMany: vi
        .fn()
        .mockResolvedValue([
          {
            id: "team",
            name: "Team",
            processId: "process",
            process: { id: "process", name: "Process" },
          },
        ]),
    },
    pulseWorker: { findMany: vi.fn().mockResolvedValue([]) },
    pulseWorkType: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "visible",
          name: "Visible",
          processId: "process",
          standardMinutes: 5,
          complexity: 1,
        },
        {
          id: "hidden",
          name: "Hidden",
          processId: "other",
          standardMinutes: 5,
          complexity: 1,
        },
      ]),
    },
  };
  const result = await dashboard(
    "lead",
    {
      organizationId: "bpo",
      accountId: "client",
      from: "2026-11-01",
      through: "2026-11-07",
    },
    client as never,
  );
  expect(JSON.stringify(result)).not.toContain("hidden");
  expect(result.account).not.toHaveProperty("targetMargin");
  for (const projection of [result.metrics, ...result.teams, ...result.trends])
    expect(projection).not.toHaveProperty("finance");
  expect(client.pulseRecord.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        ...where,
        kind: { notIn: ["FINANCE", "CONTRACT"] },
      }),
    }),
  );
});
