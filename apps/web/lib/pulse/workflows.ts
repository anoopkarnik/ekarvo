import db from "@workspace/database/client";
import { TRPCError } from "@trpc/server";
import { accountAccess, audit, json, serial, type Tx } from "./access";
import { canTransition, hasFinancials, overtimeLimit } from "./policy";
import {
  CALCULATOR_VERSION,
  calculateMetrics,
  data,
  evaluateScenario,
  normalizeBaseline,
  periodBounds,
  type Parameters,
} from "./metrics";
import { parametersSchema } from "./schemas";
import type { QueryInput } from "./queries";
function fail(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}
export async function saveScenario(
  userId: string,
  input: QueryInput & {
    name: string;
    workflow: string;
    parameters: Parameters;
    actionStart: string;
    actionEnd: string;
  },
) {
  return serial(async (tx) => {
    const access = await accountAccess(
        userId,
        input.organizationId,
        input.accountId,
        input.teamIds,
        tx,
      ),
      p = parametersSchema.parse(input.parameters);
    if (input.workflow === "MARGIN_RECOVERY" && !access.financial)
      fail("Margin recovery requires financial access.");
    if (
      !access.financial &&
      (p.scopeResetPct || p.overtimeReductionPct || p.automationPct)
    )
      fail("Commercial levers require financial access.");
    const baselineBounds = periodBounds(
        input.from,
        input.through,
        access.bpo.timezone,
      ),
      window = periodBounds(
        input.actionStart,
        input.actionEnd,
        access.bpo.timezone,
      );
    if (
      window.end <= new Date() ||
      +window.end - +window.start > 7 * 86400000 + 3600000
    )
      fail(
        "Choose an action window of up to seven days, ending in the future.",
      );
    const records = await tx.pulseRecord.findMany({
        where: { ...access.where, occurredAt: { lt: baselineBounds.end } },
      }),
      standards = await tx.pulseWorkType.findMany({
        where: {
          organizationId: input.organizationId,
          accountId: input.accountId,
          ...(access.grant.teamIds.length
            ? {
                process: {
                  teams: { some: { id: { in: access.grant.teamIds } } },
                },
              }
            : {}),
        },
      });
    const baseline = calculateMetrics(records, standards, {
      ...baselineBounds,
      asOf: new Date(),
    });
    const actionDays = (+window.end - +window.start) / 86400000;
    const comparableBaseline = normalizeBaseline(baseline, actionDays);
    const contracts = await tx.pulseRecord.findMany({
      where: {
        organizationId: input.organizationId,
        accountId: input.accountId,
        kind: "CONTRACT",
        occurredAt: { lte: window.start },
      },
    });
    const effective = contracts
      .map(data)
      .filter(
        (c) =>
          Date.parse(String(c.effectiveFrom)) <= +window.start &&
          Date.parse(String(c.effectiveTo)) >= +window.end,
      )
      .sort(
        (a, b) =>
          Date.parse(String(b.effectiveFrom)) -
          Date.parse(String(a.effectiveFrom)),
      )[0];
    const roster = await tx.pulseWorker.findMany({
      where: { ...access.where, active: true },
    });
    const contract =
      effective && !access.grant.teamIds.length
        ? {
            pricingModel: String(effective.pricingModel),
            ratePerUnit: Number(effective.ratePerUnit),
            monthlyBaseFee: Number(effective.monthlyBaseFee || 0),
            ratePerFteMonthly: Number(effective.ratePerFteMonthly || 0),
            penaltyMax: Number(effective.penaltyMax || 0),
            targetSla: Number(effective.targetSla),
            fte: roster.reduce((sum, w) => sum + w.fte, 0),
            monthFraction:
              actionDays /
              new Date(
                window.start.getUTCFullYear(),
                window.start.getUTCMonth() + 1,
                0,
              ).getDate(),
          }
        : undefined;
    const result = {
      ...evaluateScenario(comparableBaseline, p, actionDays / 7, contract),
      comparableBaseline,
    };
    if (input.workflow === "QUALITY_RECOVERY" && !baseline.audited)
      result.sufficient = false;
    if (input.workflow === "MARGIN_RECOVERY" && !baseline.finance.revenue)
      result.sufficient = false;
    if (
      p.redeployFte &&
      (!access.grant.teamIds.length ||
        access.grant.teamIds.includes(p.donorTeamId || ""))
    )
      fail("Select receiving teams and a donor outside those teams.");
    const scenario = await tx.pulseScenario.create({
      data: {
        organizationId: input.organizationId,
        accountId: input.accountId,
        creatorId: userId,
        teamIds: access.grant.teamIds,
        name: input.name,
        workflow: input.workflow,
        calculatorVersion: CALCULATOR_VERSION,
        accountRevision: access.account.revision,
        start: window.start,
        end: window.end,
        parameters: json(p),
        baseline: json(baseline),
        result: json(result),
      },
    });
    await audit(
      tx,
      input.organizationId,
      userId,
      "SCENARIO_SAVED",
      scenario.id,
      { workflow: input.workflow },
      input.accountId,
    );
    return { id: scenario.id };
  });
}
function visibleToTeams(allowed: string[], actual: string[]) {
  return (
    !allowed.length ||
    (actual.length > 0 && actual.every((t) => allowed.includes(t)))
  );
}
export async function scenarioList(
  userId: string,
  input: { organizationId: string; accountId: string },
) {
  const access = await accountAccess(
    userId,
    input.organizationId,
    input.accountId,
  );
  const scenarios = await db.pulseScenario.findMany({
    where: { organizationId: input.organizationId, accountId: input.accountId },
    include: { interventions: { include: { reservations: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return scenarios
    .filter(
      (s) =>
        visibleToTeams(access.grant.teamIds, s.teamIds) &&
        (access.financial || s.workflow !== "MARGIN_RECOVERY"),
    )
    .map((s) => {
      const baseline = { ...(s.baseline as Record<string, unknown>) },
        result = { ...(s.result as Record<string, unknown>) };
      if (!access.financial) {
        delete baseline.finance;
        delete result.finance;
        if (result.comparableBaseline) {
          const normalized = {
            ...(result.comparableBaseline as Record<string, unknown>),
          };
          delete normalized.finance;
          result.comparableBaseline = normalized;
        }
      }
      return {
        ...s,
        parameters: parametersSchema.parse(s.parameters),
        baseline,
        result,
        interventions: s.interventions.map((i) => {
          const observation = i.observation
            ? { ...(i.observation as Record<string, unknown>) }
            : null;
          if (observation && !access.financial) delete observation.finance;
          return { ...i, observation };
        }),
      };
    });
}
export async function proposeScenario(
  userId: string,
  organizationId: string,
  scenarioId: string,
) {
  return serial(async (tx) => {
    const scenario = await tx.pulseScenario.findFirst({
      where: { id: scenarioId, organizationId },
    });
    if (!scenario) fail("Scenario unavailable.");
    const access = await accountAccess(
      userId,
      organizationId,
      scenario.accountId,
      undefined,
      tx,
    );
    if (
      !visibleToTeams(access.grant.teamIds, scenario.teamIds) ||
      (!access.financial && scenario.workflow === "MARGIN_RECOVERY")
    )
      fail("Scenario outside your scope.");
    const action = await tx.pulseIntervention.create({
      data: {
        organizationId,
        accountId: scenario.accountId,
        scenarioId,
        ownerId: userId,
        start: scenario.start,
        end: scenario.end,
      },
    });
    await audit(
      tx,
      organizationId,
      userId,
      "PROPOSED",
      action.id,
      {},
      scenario.accountId,
    );
    return { id: action.id };
  });
}
function weekWindows(start: Date, end: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const day = fmt.format(start),
    d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const out: Date[] = [];
  for (let i = 0; i < 3; i++) {
    const key = d.toISOString().slice(0, 10),
      w = periodBounds(key, key, timezone).start;
    if (w >= end) break;
    out.push(w);
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return out;
}
async function approve(
  tx: Tx,
  userId: string,
  action: NonNullable<
    Awaited<ReturnType<typeof db.pulseIntervention.findUnique>>
  >,
  scenario: NonNullable<
    Awaited<ReturnType<typeof db.pulseScenario.findUnique>>
  >,
) {
  const access = await accountAccess(
      userId,
      action.organizationId,
      action.accountId,
      undefined,
      tx,
    ),
    p = parametersSchema.parse(scenario.parameters);
  if (scenario.accountRevision !== access.account.revision)
    fail("Source data changed. Save a fresh scenario before approval.");
  if (action.end <= new Date()) fail("Action window has expired.");
  if (!(scenario.result as { sufficient?: boolean }).sufficient)
    fail("Insufficient raw evidence to approve.");
  if (p.scopeResetPct && access.grant.role !== "COO_EXECUTIVE")
    fail("Commercial changes require COO approval.");
  const limits = access.account.approvalLimits as Record<string, number>,
    limit = Math.min(
      overtimeLimit(access.grant.role),
      limits[access.grant.role] ?? overtimeLimit(access.grant.role),
    );
  await tx.pulseReservation.updateMany({
    where: {
      organizationId: action.organizationId,
      released: false,
      intervention: { end: { lte: new Date() } },
    },
    data: { released: true },
  });
  const weeks = weekWindows(action.start, action.end, access.bpo.timezone);
  for (const week of weeks) {
    const spent = await tx.pulseReservation.aggregate({
      where: {
        organizationId: action.organizationId,
        accountId: action.accountId,
        week,
      },
      _sum: { overtimeHours: true },
    });
    if ((spent._sum.overtimeHours || 0) + p.overtimeHours > limit)
      fail("Weekly overtime approval limit exceeded.");
  }
  let donorAccountId = action.accountId;
  if (p.redeployFte > 0) {
    if (!p.donorTeamId) fail("Choose a donor team.");
    if (!scenario.teamIds.length || scenario.teamIds.includes(p.donorTeamId))
      fail("Donor must be outside the receiving team scope.");
    const donor = await tx.pulseTeam.findFirst({
      where: { id: p.donorTeamId, organizationId: action.organizationId },
    });
    if (!donor) fail("Donor unavailable.");
    donorAccountId = donor.accountId;
    const donorAccess = await accountAccess(
      userId,
      action.organizationId,
      donor.accountId,
      [donor.id],
      tx,
    );
    if (
      donor.accountId !== action.accountId &&
      (!hasFinancials(access.grant.role) ||
        !hasFinancials(donorAccess.grant.role) ||
        donorAccess.account.fenced ||
        access.account.fenced ||
        donorAccess.account.vertical !== access.account.vertical)
    )
      fail("Cross-account transfer is not permitted.");
    const workers = await tx.pulseWorker.findMany({
      where: {
        organizationId: action.organizationId,
        accountId: donor.accountId,
        teamId: donor.id,
        active: true,
      },
    });
    const needed = await tx.pulseWorkType.findMany({
      where: {
        organizationId: action.organizationId,
        accountId: action.accountId,
        requiredSkill: { not: null },
      },
    });
    const certs = await tx.pulseRecord.findMany({
      where: {
        organizationId: action.organizationId,
        accountId: donor.accountId,
        teamId: donor.id,
        kind: "CERTIFICATION",
      },
    });
    const qualified = workers
      .filter((w) =>
        needed.every((wt) =>
          certs.some(
            (c) =>
              c.workerId === w.id &&
              data(c).skill === wt.requiredSkill &&
              Date.parse(String(data(c).validUntil)) >= +action.end &&
              +c.occurredAt <= +action.start,
          ),
        ),
      )
      .reduce((s, w) => s + w.fte, 0);
    const donorFacts = await tx.pulseRecord.findMany({
        where: {
          organizationId: action.organizationId,
          accountId: donor.accountId,
          teamId: donor.id,
        },
      }),
      types = await tx.pulseWorkType.findMany({
        where: {
          organizationId: action.organizationId,
          accountId: donor.accountId,
        },
      });
    const m = calculateMetrics(donorFacts, types, {
      start: new Date(+action.start - 7 * 86400000),
      end: action.start,
      asOf: new Date(),
    });
    if (
      m.slaPct === null ||
      m.slaPct < 97 ||
      m.capacityHours - m.demandHours < p.redeployFte * 34
    )
      fail("Donor has insufficient SLA or capacity buffer.");
    for (const week of weeks) {
      const used = await tx.pulseReservation.aggregate({
        where: {
          organizationId: action.organizationId,
          teamId: donor.id,
          week,
          released: false,
        },
        _sum: { redeployFte: true },
      });
      if (
        p.redeployFte + (used._sum.redeployFte || 0) >
        Math.min(qualified, (m.capacityHours - m.demandHours) / 34)
      )
        fail("Donor capacity already reserved.");
    }
  }
  for (const week of weeks) {
    await tx.pulseReservation.create({
      data: {
        interventionId: action.id,
        organizationId: action.organizationId,
        accountId: action.accountId,
        week,
        overtimeHours: p.overtimeHours,
      },
    });
    if (p.redeployFte)
      await tx.pulseReservation.create({
        data: {
          interventionId: action.id,
          organizationId: action.organizationId,
          accountId: donorAccountId,
          teamId: p.donorTeamId,
          week,
          redeployFte: p.redeployFte,
        },
      });
  }
}
export async function transitionAction(
  userId: string,
  input: {
    organizationId: string;
    id: string;
    version: number;
    status: string;
  },
) {
  const committed = await serial(async (tx) => {
    const action = await tx.pulseIntervention.findFirst({
      where: { id: input.id, organizationId: input.organizationId },
      include: { scenario: true },
    });
    if (!action) fail("Intervention unavailable.");
    const access = await accountAccess(
      userId,
      input.organizationId,
      action.accountId,
      undefined,
      tx,
    );
    if (
      !visibleToTeams(access.grant.teamIds, action.scenario.teamIds) ||
      (!access.financial && action.scenario.workflow === "MARGIN_RECOVERY")
    )
      fail("Intervention outside your scope.");
    if (
      action.version !== input.version ||
      !canTransition(
        action.status,
        input.status,
        access.grant.role,
        action.ownerId === userId,
      )
    )
      fail("Invalid or stale transition.");
    if (input.status === "APPROVED")
      await approve(tx, userId, action, action.scenario);
    let observation: ReturnType<typeof json> | undefined;
    if (input.status === "VERIFIED") {
      if (action.end > new Date()) fail("Observation window is still open.");
      const facts = await tx.pulseRecord.findMany({
          where: {
            organizationId: input.organizationId,
            accountId: action.accountId,
            ...(action.scenario.teamIds.length
              ? { teamId: { in: action.scenario.teamIds } }
              : {}),
          },
        }),
        types = await tx.pulseWorkType.findMany({
          where: {
            organizationId: input.organizationId,
            accountId: action.accountId,
            ...(action.scenario.teamIds.length
              ? {
                  process: {
                    teams: { some: { id: { in: action.scenario.teamIds } } },
                  },
                }
              : {}),
          },
        });
      const actual = calculateMetrics(facts, types, {
        start: action.start,
        end: action.end,
        asOf: new Date(),
      });
      if (!actual.arrivals || !actual.paidHours)
        fail("Insufficient observed records.");
      observation = json(actual);
    }
    if (["CANCELLED", "VERIFIED"].includes(input.status))
      await tx.pulseReservation.updateMany({
        where: { interventionId: action.id },
        data: { released: true },
      });
    await tx.pulseIntervention.update({
      where: { id: action.id, version: input.version },
      data: {
        status: input.status,
        version: { increment: 1 },
        ...(observation ? { observation } : {}),
      },
    });
    await audit(
      tx,
      input.organizationId,
      userId,
      input.status,
      action.id,
      { previous: action.status },
      action.accountId,
    );
    return {
      organizationId: input.organizationId,
      accountId: action.accountId,
      ownerId: action.ownerId,
      id: action.id,
      version: action.version + 1,
      status: input.status,
    };
  });
  const { notifyActionOwner } = await import("./notifications");
  await notifyActionOwner(committed);
  return { success: true };
}
