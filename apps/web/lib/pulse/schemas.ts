import { z } from "zod";
export const roleSchema = z.enum(["COO_EXECUTIVE", "OPS_MANAGER", "TEAM_LEAD"]);
export const id = z.string().trim().min(1).max(160);
const num = z.coerce.number().finite().nonnegative();
const percent = num.max(100);
const date = z.string().datetime({ offset: true });
const bool = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((v) => v === "true"),
]);
const base = {
  externalId: id,
  occurredAt: date,
  teamId: id.optional(),
  workerId: id.optional(),
};
export const rawSchemas = {
  SHIFT: z.object({
    ...base,
    teamId: id,
    workerId: id,
    hours: num.max(24),
    start: date,
    end: date,
  }),
  TIME_ENTRY: z.object({
    ...base,
    teamId: id,
    workerId: id,
    hours: num.max(24),
    category: z.enum([
      "PRODUCTIVE",
      "REWORK",
      "LEAVE",
      "BREAK",
      "TRAINING",
      "DOWNTIME",
    ]),
    hourlyRate: num.max(10000),
    overtime: bool.default(false),
    overtimeMultiplier: num.max(5).default(1.5),
  }),
  WORK_ITEM: z.object({
    ...base,
    teamId: id,
    workTypeId: id,
    arrivedAt: date,
    dueAt: date,
    completedAt: date.optional(),
    firstPass: bool.optional(),
    complexity: num.positive().max(10).default(1),
    sopVersion: z.string().max(80).default("1"),
  }),
  WORK_EVENT: z.object({
    ...base,
    teamId: id,
    workItemId: id,
    event: z.enum(["ASSIGNED", "STARTED", "COMPLETED", "REOPENED"]),
    minutes: num.optional(),
  }),
  QA: z.object({
    ...base,
    teamId: id,
    workerId: id,
    workItemId: id,
    passed: bool,
    defect: z.string().max(160).optional(),
    sopVersion: z.string().max(80).default("1"),
  }),
  FINANCE: z.object({
    ...base,
    category: z.enum(["REVENUE", "OVERHEAD", "PAYROLL_RECONCILIATION"]),
    amount: z.coerce.number().finite().min(-1e9).max(1e9),
    currency: z.literal("USD").default("USD"),
  }),
  CERTIFICATION: z.object({
    ...base,
    teamId: id,
    workerId: id,
    skill: id,
    validUntil: date,
  }),
  ASSIGNMENT: z.object({
    ...base,
    teamId: id,
    workerId: id,
    start: date,
    end: date,
    fte: num.max(1).default(1),
  }),
  CONTRACT: z.object({
    ...base,
    ratePerUnit: num,
    monthlyBaseFee: num.default(0),
    ratePerFteMonthly: num.default(0),
    pricingModel: z.enum(["PER_UNIT", "FTE", "HYBRID"]),
    effectiveFrom: date,
    effectiveTo: date,
    targetSla: percent,
    penaltyMax: num.default(0),
  }),
  HANDOVER: z.object({
    ...base,
    teamId: id,
    note: z.string().trim().min(1).max(4000),
    ownerId: id,
    status: z.enum(["OPEN", "ACKNOWLEDGED"]).default("OPEN"),
  }),
  COACHING: z.object({
    ...base,
    teamId: id,
    workerId: id,
    note: z.string().trim().min(1).max(4000),
    ownerId: id,
    hours: num.max(80),
    status: z.enum(["PLANNED", "COMPLETED"]).default("PLANNED"),
  }),
  AUTOMATION: z.object({
    ...base,
    teamId: id,
    workTypeId: id,
    note: z.string().trim().min(1).max(4000),
    ownerId: id,
    status: z
      .enum(["IDENTIFIED", "ASSESSED", "APPROVED"])
      .default("IDENTIFIED"),
  }),
};
export type RawKind = keyof typeof rawSchemas;
export const rawKindSchema = z.enum(
  Object.keys(rawSchemas) as [RawKind, ...RawKind[]],
);
export const masterSchemas = {
  SITE: z.object({ externalId: id, name: id }),
  PROCESS: z.object({ externalId: id, name: id }),
  TEAM: z.object({
    externalId: id,
    name: id,
    processId: id,
    siteId: id.optional(),
  }),
  WORKER: z.object({
    externalId: id,
    name: id,
    teamId: id,
    fte: num.max(1).default(1),
    hourlyRate: num.max(10000),
    overtimeMultiplier: num.max(5).default(1.5),
    active: bool.default(true),
  }),
  WORK_TYPE: z.object({
    externalId: id,
    name: id,
    processId: id,
    standardMinutes: num.positive().max(10000),
    complexity: num.positive().max(10).default(1),
    slaHours: num.positive().max(10000).default(24),
    requiredSkill: id.optional(),
    automationEligible: bool.default(false),
  }),
};
export type ImportKind = RawKind | keyof typeof masterSchemas;
export const importKindSchema = z.enum([
  ...Object.keys(rawSchemas),
  ...Object.keys(masterSchemas),
] as [ImportKind, ...ImportKind[]]);
export const scopeSchema = z.object({ organizationId: id, accountId: id });
export const periodSchema = scopeSchema.extend({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  through: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  teamIds: z.array(id).max(100).optional(),
});
export const parametersSchema = z.object({
  demandSurgePct: z.number().min(-50).max(100).default(0),
  ptoDeltaPct: z.number().min(-20).max(50).default(0),
  defectRatePct: percent.optional(),
  overtimeHours: num.max(220).default(0),
  redeployFte: num.max(100).default(0),
  donorTeamId: id.optional(),
  coachingHours: num.max(500).default(0),
  sopRollout: z.boolean().default(false),
  auditPct: percent.default(0),
  overtimeReductionPct: percent.default(0),
  reworkReductionPct: percent.default(0),
  scopeResetPct: percent.default(0),
  automationPct: percent.default(0),
  reprioritizePct: percent.default(0),
});
export function parseRecord(kind: ImportKind, input: unknown) {
  const schema = { ...rawSchemas, ...masterSchemas }[kind];
  const value = schema.parse(input) as Record<string, unknown>;
  const before = (a: string, b: string) => {
    if (
      value[a] &&
      value[b] &&
      Date.parse(String(value[a])) > Date.parse(String(value[b]))
    )
      throw new Error(`${a} must be before ${b}`);
  };
  before("arrivedAt", "dueAt");
  before("arrivedAt", "completedAt");
  before("start", "end");
  before("effectiveFrom", "effectiveTo");
  before("occurredAt", "validUntil");
  return value;
}
