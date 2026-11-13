import { describe, expect, it } from "vitest";
import { buildPulseSeed } from "./pulseSeed";
describe("Pulse raw demo seed", () => {
  it("is deterministic and reconciles six clients, twelve teams and 120 workers", () => {
    const a = buildPulseSeed("demo", new Date("2026-11-08T00:00:00Z"));
    expect(a.accounts).toHaveLength(6);
    expect(a.teams).toHaveLength(12);
    expect(a.workers).toHaveLength(120);
    expect(a.workTypes).toHaveLength(24);
    expect(a.processes).toHaveLength(12);
    expect(a.records.length).toBeGreaterThan(10000);
    expect(a).toEqual(buildPulseSeed("demo", new Date("2026-11-08T00:00:00Z")));
    expect(
      a.records.every(
        (r) => a.teams.some((t) => t.id === r.teamId) || !r.teamId,
      ),
    ).toBe(true);
    expect(
      a.records.some(
        (r) => r.kind === "WORK_ITEM" && !("completedAt" in r.payload),
      ),
    ).toBe(true);
  });
});
