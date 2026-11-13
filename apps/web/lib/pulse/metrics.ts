export type RawRecord = {
  id: string;
  kind: string;
  payload: unknown;
  occurredAt: Date;
  teamId: string | null;
  workerId: string | null;
};
export type WorkStandard = {
  id: string;
  standardMinutes: number;
  complexity: number;
  automationEligible?: boolean;
};
export type Period = { start: Date; end: Date; asOf: Date };
export type Parameters = {
  demandSurgePct?: number;
  ptoDeltaPct?: number;
  defectRatePct?: number;
  overtimeHours?: number;
  redeployFte?: number;
  donorTeamId?: string;
  coachingHours?: number;
  sopRollout?: boolean;
  auditPct?: number;
  overtimeReductionPct?: number;
  reworkReductionPct?: number;
  scopeResetPct?: number;
  automationPct?: number;
  reprioritizePct?: number;
};
export const CALCULATOR_VERSION = "pulse-raw-v1";
export const ratio = (n: number, d: number) =>
  d > 0 ? Math.round((n / d) * 10000) / 100 : null;
const n = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;
const time = (value: unknown) =>
  typeof value === "string" ? new Date(value).getTime() : NaN;
export function data(record: RawRecord): Record<string, unknown> {
  return record.payload as Record<string, unknown>;
}
export function periodBounds(from: string, through: string, timezone: string) {
  const midnight = (date: string) => {
    const desired = new Date(`${date}T00:00:00Z`).getTime();
    if (
      !Number.isFinite(desired) ||
      new Date(desired).toISOString().slice(0, 10) !== date
    )
      throw new Error("Invalid reporting date");
    let utc = desired;
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    for (let i = 0; i < 4; i++) {
      const p = Object.fromEntries(
        formatter.formatToParts(new Date(utc)).map((v) => [v.type, v.value]),
      );
      const local = Date.parse(
        `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`,
      );
      utc += desired - local;
    }
    return new Date(utc);
  };
  const next = new Date(`${through}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const start = midnight(from),
    end = midnight(next.toISOString().slice(0, 10));
  if (
    !Number.isFinite(start.getTime()) ||
    end <= start ||
    end.getTime() - start.getTime() > 367 * 86400000
  )
    throw new Error("Invalid reporting period");
  return { start, end };
}
export function calculateMetrics(
  records: RawRecord[],
  standards: WorkStandard[],
  period: Period,
) {
  const start = +period.start,
    end = Math.min(+period.end, +period.asOf),
    inside = (t: number) => t >= start && t < end;
  const current = records.filter((r) => inside(+r.occurredAt));
  const items = records.filter((r) => r.kind === "WORK_ITEM").map(data);
  const arrivals = items.filter((p) => inside(time(p.arrivedAt))).length;
  const completed = items.filter((p) => inside(time(p.completedAt)));
  const due = items.filter((p) => inside(time(p.dueAt)));
  const onTime = due.filter(
    (p) => time(p.completedAt) <= time(p.dueAt) && time(p.completedAt) < end,
  ).length;
  const backlogAt = (date: number) =>
    items.filter(
      (p) => time(p.arrivedAt) < date && !(time(p.completedAt) < date),
    ).length;
  const qa = current.filter((r) => r.kind === "QA");
  const sampledItems = new Map<string, boolean>();
  for (const r of qa) {
    const p = data(r);
    sampledItems.set(
      String(p.workItemId),
      (sampledItems.get(String(p.workItemId)) ?? true) && p.passed === true,
    );
  }
  const defectItems = [...sampledItems.values()].filter((v) => !v).length;
  const firstPassKnown = completed.filter(
    (p) => typeof p.firstPass === "boolean",
  );
  const entries = current.filter((r) => r.kind === "TIME_ENTRY");
  const hours = (category: string) =>
    entries
      .filter((r) => data(r).category === category)
      .reduce((s, r) => s + n(data(r).hours), 0);
  const paidHours = entries.reduce((s, r) => s + n(data(r).hours), 0);
  const productiveHours = hours("PRODUCTIVE"),
    reworkHours = hours("REWORK");
  const unavailableHours =
    hours("LEAVE") + hours("BREAK") + hours("TRAINING") + hours("DOWNTIME");
  const cost = (r: RawRecord) => {
    const p = data(r);
    return (
      n(p.hours) *
      n(p.hourlyRate) *
      (p.overtime ? n(p.overtimeMultiplier) || 1.5 : 1)
    );
  };
  const labor = entries.reduce((s, r) => s + cost(r), 0);
  const overtime = entries
    .filter((r) => data(r).overtime)
    .reduce((s, r) => s + cost(r), 0);
  const overtimeHours = entries
    .filter((r) => data(r).overtime)
    .reduce((s, r) => s + n(data(r).hours), 0);
  const rework = entries
    .filter((r) => data(r).category === "REWORK")
    .reduce((s, r) => s + cost(r), 0);
  const finance = current.filter((r) => r.kind === "FINANCE").map(data);
  const sumFinance = (category: string) =>
    finance
      .filter((p) => p.category === category)
      .reduce((s, p) => s + n(p.amount), 0);
  const revenue = sumFinance("REVENUE"),
    overhead = sumFinance("OVERHEAD"),
    payroll = sumFinance("PAYROLL_RECONCILIATION");
  const activeEmployees = new Set(
    entries.map((r) => r.workerId).filter(Boolean),
  );
  const auditedEmployees = new Set(
    qa.map((r) => r.workerId).filter((id) => id && activeEmployees.has(id)),
  );
  const demandHours = items
    .filter((p) => inside(time(p.arrivedAt)))
    .reduce((s, p) => {
      const wt = standards.find((w) => w.id === p.workTypeId);
      return (
        s +
        (wt
          ? (wt.standardMinutes * (n(p.complexity) || wt.complexity)) / 60
          : 0)
      );
    }, 0);
  const earnedHours = completed.reduce((s, p) => {
    const wt = standards.find((w) => w.id === p.workTypeId);
    return (
      s +
      (wt ? (wt.standardMinutes * (n(p.complexity) || wt.complexity)) / 60 : 0)
    );
  }, 0);
  const segments = new Map<string, { audits: number; defects: number }>();
  for (const r of qa) {
    const p = data(r),
      key = String(p.sopVersion || "Unspecified"),
      v = segments.get(key) || { audits: 0, defects: 0 };
    v.audits++;
    if (!p.passed) v.defects++;
    segments.set(key, v);
  }
  const qualitySegments = [...segments].map(([sop, v]) => ({
    sop,
    ...v,
    defectPct: ratio(v.defects, v.audits),
  }));
  const queues = standards.map((w) => {
    const subset = items.filter((p) => p.workTypeId === w.id);
    return {
      id: w.id,
      arrivals: subset.filter((p) => inside(time(p.arrivedAt))).length,
      completed: subset.filter((p) => inside(time(p.completedAt))).length,
      backlog: subset.filter(
        (p) => time(p.arrivedAt) < end && !(time(p.completedAt) < end),
      ).length,
      overdue: subset.filter(
        (p) => time(p.dueAt) < end && !(time(p.completedAt) < end),
      ).length,
    };
  });
  const defects = Object.entries(
    qa.reduce<Record<string, number>>((out, r) => {
      const p = data(r);
      if (!p.passed)
        out[String(p.defect || "Unclassified")] =
          (out[String(p.defect || "Unclassified")] || 0) + 1;
      return out;
    }, {}),
  ).map(([label, count]) => ({ label, count }));
  return {
    earnedHours,
    productivityPct: ratio(earnedHours, productiveHours),
    qualitySegments,
    queues,
    arrivals,
    completions: completed.length,
    openingBacklog: backlogAt(start),
    backlog: backlogAt(end),
    due: due.length,
    onTime,
    slaPct: ratio(onTime, due.length),
    firstPassPct: ratio(
      firstPassKnown.filter((p) => p.firstPass).length,
      firstPassKnown.length,
    ),
    firstPassKnown: firstPassKnown.length,
    audited: sampledItems.size,
    defectItems,
    qaDefectPct: ratio(defectItems, sampledItems.size),
    employeeCoveragePct: ratio(auditedEmployees.size, activeEmployees.size),
    transactionCoveragePct: ratio(sampledItems.size, completed.length),
    activeEmployees: activeEmployees.size,
    paidHours,
    productiveHours,
    reworkHours,
    unavailableHours,
    overtimeHours,
    demandHours,
    capacityHours: Math.max(0, paidHours - unavailableHours - reworkHours),
    defects,
    finance: {
      revenue,
      labor,
      overtime,
      rework,
      overhead,
      payroll,
      payrollVariance: payroll ? labor - payroll : null,
      totalCost: labor + overhead,
      contribution: revenue - labor - overhead,
      marginPct: ratio(revenue - labor - overhead, revenue),
      unitCost: completed.length ? (labor + overhead) / completed.length : null,
    },
    evidence: {
      rawRecords: current.length,
      start: period.start.toISOString(),
      end: new Date(end).toISOString(),
      calculatorVersion: CALCULATOR_VERSION,
    },
  };
}
export type Metrics = ReturnType<typeof calculateMetrics>;
export function evaluateScenario(
  base: Metrics,
  p: Parameters,
  actionWeeks = 1,
  contract?: {
    pricingModel: string;
    ratePerUnit: number;
    monthlyBaseFee: number;
    ratePerFteMonthly: number;
    penaltyMax: number;
    targetSla: number;
    fte: number;
    monthFraction: number;
  },
) {
  const demandHours =
    base.demandHours *
    (1 + (p.demandSurgePct || 0) / 100) *
    (1 - (p.automationPct || 0) / 100) *
    (1 - (p.reprioritizePct || 0) / 100);
  const qualityFactor = Math.min(
    1,
    (p.reworkReductionPct || 0) / 100 +
      (p.sopRollout ? 0.1 : 0) +
      (p.coachingHours || 0) / Math.max(1, base.paidHours),
  );
  const defectRatio =
    p.defectRatePct !== undefined && base.qaDefectPct
      ? p.defectRatePct / base.qaDefectPct
      : 1;
  const reworkSaved =
    base.reworkHours * (1 - defectRatio * (1 - qualityFactor));
  const auditHours = (base.arrivals * ((p.auditPct || 0) / 100) * 5) / 60;
  const overtimeHours =
    (p.overtimeHours || 0) -
    (base.overtimeHours * (p.overtimeReductionPct || 0)) / 100;
  const capacityHours = Math.max(
    0,
    base.capacityHours -
      (base.paidHours * (p.ptoDeltaPct || 0)) / 100 +
      overtimeHours +
      (p.redeployFte || 0) * 34 * actionWeeks -
      (p.coachingHours || 0) -
      auditHours +
      reworkSaved,
  );
  const avgHours = base.arrivals ? base.demandHours / base.arrivals : null;
  const gap = capacityHours - demandHours;
  const projectedBacklog =
    avgHours && avgHours > 0
      ? Math.max(0, Math.round(base.backlog - gap / avgHours))
      : null;
  const hourly = base.paidHours ? base.finance.labor / base.paidHours : null;
  const incrementalCost =
    hourly === null
      ? null
      : overtimeHours * hourly * 1.5 +
        ((p.coachingHours || 0) + auditHours) * hourly;
  const projectedBaseRevenue = contract
    ? (contract.pricingModel === "FTE"
        ? contract.ratePerFteMonthly * contract.fte * contract.monthFraction
        : base.completions * contract.ratePerUnit) +
      (contract.pricingModel === "PER_UNIT"
        ? 0
        : contract.monthlyBaseFee * contract.monthFraction)
    : base.finance.revenue;
  const revenue = projectedBaseRevenue * (1 + (p.scopeResetPct || 0) / 100);
  const baselineCoverage = ratio(base.capacityHours, base.demandHours),
    newCoverage = ratio(capacityHours, demandHours);
  const simulatedSlaPct =
    base.slaPct === null || baselineCoverage === null || newCoverage === null
      ? null
      : Math.max(
          0,
          Math.min(
            100,
            base.slaPct +
              (Math.max(0, 100 - baselineCoverage) -
                Math.max(0, 100 - newCoverage)) *
                0.68,
          ),
        );
  const penaltyExposure =
    contract && simulatedSlaPct !== null
      ? Math.min(
          contract.penaltyMax,
          (Math.max(0, contract.targetSla - simulatedSlaPct) / 4) *
            contract.penaltyMax,
        )
      : null;
  const cost =
    base.finance.totalCost +
    (incrementalCost || 0) -
    reworkSaved * (hourly || 0);
  return {
    state: "SIMULATED",
    simulatedSlaPct,
    calculatorVersion: CALCULATOR_VERSION,
    demandHours,
    capacityHours,
    gap,
    projectedBacklog,
    coveragePct: ratio(capacityHours, demandHours),
    simulatedDefectPct:
      p.defectRatePct ??
      (base.qaDefectPct === null
        ? null
        : base.qaDefectPct * (1 - qualityFactor)),
    finance: {
      incrementalCost,
      penaltyExposure,
      revenue,
      totalCost: cost,
      marginPct: ratio(revenue - cost, revenue),
      netImpact: revenue - cost - base.finance.contribution,
    },
    assumptions: [
      "34 productive hours per redeployed FTE/week, scaled to action duration",
      "Five minutes of additional effort per pre-release audit",
      "Selected baseline normalized uniformly to the action duration",
      "SLA sensitivity: 0.68 percentage points per capacity-coverage shortfall point; estimate only",
      contract
        ? "Revenue projection uses the effective contract"
        : "Revenue projection uses the normalized observed baseline",
      "Scenario estimates are not observed outcomes",
      "Rework savings represent future avoided effort; actual costs stay unchanged",
    ],
    sufficient: base.arrivals > 0 && base.paidHours > 0,
  };
}
export function forecastDemand(
  records: RawRecord[],
  end: Date,
  timezone: string,
) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const day = (d: Date) => fmt.format(d);
  // Add calendar days to a date-only key, not 24 hours to a local midnight:
  // DST weeks contain 23/25-hour days and otherwise duplicate/skip weekdays.
  const calendarDay = (offset: number) => {
    const date = new Date(`${day(end)}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const cutoff = +periodBounds(calendarDay(-28), calendarDay(-28), timezone)
    .start;
  const arrivals = records.filter(
    (r) =>
      r.kind === "WORK_ITEM" &&
      time(data(r).arrivedAt) >= cutoff &&
      time(data(r).arrivedAt) < +end,
  );
  const counts = new Map<string, number>();
  for (const r of arrivals) {
    const key = day(new Date(String(data(r).arrivedAt)));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const sufficient = records.some(
    (r) => r.kind === "WORK_ITEM" && time(data(r).arrivedAt) <= cutoff,
  );
  return {
    sufficient,
    method: "Trailing four-week weekday average",
    days: Array.from({ length: 7 }, (_, i) => {
      let total = 0;
      for (let w = 1; w <= 4; w++)
        total += counts.get(calendarDay(i - w * 7)) || 0;
      return {
        date: calendarDay(i),
        units: sufficient ? Math.round(total / 4) : null,
      };
    }),
  };
}

/** Comparable scenario basis, never written back to raw records or actuals. */
export function normalizeBaseline(base: Metrics, actionDays: number): Metrics {
  const baselineDays = Math.max(
    1 / 24,
    (Date.parse(base.evidence.end) - Date.parse(base.evidence.start)) /
      86400000,
  );
  const scale = actionDays / baselineDays;
  const quantities = [
    "arrivals",
    "completions",
    "due",
    "onTime",
    "firstPassKnown",
    "audited",
    "defectItems",
    "paidHours",
    "productiveHours",
    "reworkHours",
    "unavailableHours",
    "overtimeHours",
    "demandHours",
    "capacityHours",
  ] as const;
  const result = { ...base, finance: { ...base.finance } };
  for (const key of quantities) result[key] = base[key] * scale;
  for (const key of [
    "revenue",
    "labor",
    "overtime",
    "rework",
    "overhead",
    "payroll",
    "totalCost",
    "contribution",
  ] as const)
    result.finance[key] = base.finance[key] * scale;
  if (result.finance.payrollVariance !== null)
    result.finance.payrollVariance *= scale;
  return result;
}
