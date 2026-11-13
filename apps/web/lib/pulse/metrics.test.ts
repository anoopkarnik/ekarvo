import { describe, it, expect } from "vitest";
import {
  calculateMetrics,
  evaluateScenario,
  forecastDemand,
  periodBounds,
} from "./metrics";
const at = (day: number) =>
  new Date(`2026-11-${String(day).padStart(2, "0")}T12:00:00Z`);
const row = (
  kind: string,
  payload: Record<string, unknown>,
  occurredAt = at(2),
) => ({
  id: Math.random().toString(),
  kind,
  payload,
  occurredAt,
  teamId: "t",
  workerId: "w",
});
describe("raw record calculations", () => {
  it("forecasts one entry per local calendar day across daylight saving changes", () => {
    const forecast = forecastDemand(
      [],
      new Date("2026-11-01T04:00:00Z"),
      "America/New_York",
    );
    expect(forecast.days.map((v) => v.date)).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
  });
  it("counts overdue uncompleted work, separates QA and avoids counting rework twice", () => {
    const facts = [
      row("WORK_ITEM", {
        arrivedAt: at(1).toISOString(),
        dueAt: at(3).toISOString(),
        completedAt: at(2).toISOString(),
        firstPass: true,
      }),
      row("WORK_ITEM", {
        arrivedAt: at(1).toISOString(),
        dueAt: at(3).toISOString(),
      }),
      row("TIME_ENTRY", {
        hours: 6,
        category: "PRODUCTIVE",
        hourlyRate: 10,
        overtime: false,
      }),
      row("TIME_ENTRY", {
        hours: 2,
        category: "REWORK",
        hourlyRate: 10,
        overtime: false,
      }),
      row("QA", { workItemId: "i", passed: false, defect: "coding" }),
      row("FINANCE", { category: "REVENUE", amount: 200 }),
      row("FINANCE", { category: "PAYROLL_RECONCILIATION", amount: 80 }),
    ];
    const m = calculateMetrics(facts, [], {
      start: at(1),
      end: at(8),
      asOf: at(8),
    });
    expect(m.slaPct).toBe(50);
    expect(m.backlog).toBe(1);
    expect(m.qaDefectPct).toBe(100);
    expect(m.finance.labor).toBe(80);
    expect(m.finance.rework).toBe(20);
    expect(m.finance.marginPct).toBe(60);
  });
  it("does not invent rates for an empty dataset", () => {
    const m = calculateMetrics([], [], {
      start: at(1),
      end: at(8),
      asOf: at(8),
    });
    expect(m.slaPct).toBeNull();
    expect(m.qaDefectPct).toBeNull();
    expect(m.finance.marginPct).toBeNull();
  });
  it("simulates without changing baseline actuals", () => {
    const m = calculateMetrics([], [], {
      start: at(1),
      end: at(8),
      asOf: at(8),
    });
    const saved = JSON.stringify(m);
    evaluateScenario(m, { overtimeHours: 10 });
    expect(JSON.stringify(m)).toBe(saved);
  });
  it("resolves reporting dates in the BPO timezone", () => {
    expect(
      periodBounds(
        "2026-11-01",
        "2026-11-07",
        "Asia/Kolkata",
      ).start.toISOString(),
    ).toBe("2026-10-31T18:30:00.000Z");
    expect(
      periodBounds(
        "2026-11-01",
        "2026-11-01",
        "America/New_York",
      ).end.toISOString(),
    ).toBe("2026-11-02T05:00:00.000Z");
  });
});

it("normalizes scenario quantities to the action window while preserving the source snapshot", async () => {
  const { normalizeBaseline } = await import("./metrics");
  const base = calculateMetrics(
    [
      row("TIME_ENTRY", {
        hours: 8,
        category: "PRODUCTIVE",
        hourlyRate: 10,
        overtime: false,
      }),
    ],
    [],
    { start: at(1), end: at(8), asOf: at(8) },
  );
  const normalized = normalizeBaseline(base, 3.5);
  expect(normalized.paidHours).toBe(4);
  expect(normalized.finance.labor).toBe(40);
  expect(base.paidHours).toBe(8);
});
