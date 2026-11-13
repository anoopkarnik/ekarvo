import db from "@workspace/database/client";
import { accountAccess, type Tx } from "./access";
import { calculateMetrics, forecastDemand, periodBounds } from "./metrics";
export type QueryInput = {
  organizationId: string;
  accountId: string;
  from: string;
  through: string;
  teamIds?: string[];
};
export async function dashboard(
  userId: string,
  input: QueryInput,
  client: Tx = db,
) {
  const access = await accountAccess(
    userId,
    input.organizationId,
    input.accountId,
    input.teamIds,
    client,
  );
  const bounds = periodBounds(input.from, input.through, access.bpo.timezone);
  const assignedTeams = access.grants.find(
    (g) => g.accountId === input.accountId,
  )!.teamIds;
  const [records, workTypes, teamOptions, workers] = await Promise.all([
    client.pulseRecord.findMany({
      where: {
        ...access.where,
        occurredAt: { lt: bounds.end },
        ...(access.financial
          ? {}
          : { kind: { notIn: ["FINANCE", "CONTRACT"] } }),
      },
      orderBy: { occurredAt: "asc" },
    }),
    client.pulseWorkType.findMany({
      where: {
        organizationId: input.organizationId,
        accountId: input.accountId,
      },
    }),
    client.pulseTeam.findMany({
      where: {
        organizationId: input.organizationId,
        accountId: input.accountId,
        ...(access.grant.role === "TEAM_LEAD"
          ? { id: { in: assignedTeams } }
          : {}),
      },
      include: { process: { select: { id: true, name: true } } },
    }),
    client.pulseWorker.findMany({ where: { ...access.where } }),
  ]);
  const teams = access.grant.teamIds.length
    ? teamOptions.filter((t) => access.grant.teamIds.includes(t.id))
    : teamOptions;
  const visibleStandards = access.grant.teamIds.length
    ? workTypes.filter((w) => teams.some((t) => t.processId === w.processId))
    : workTypes;
  const metrics = calculateMetrics(records, visibleStandards, {
    ...bounds,
    asOf: new Date(),
  });
  const safeMetrics = ({ ...m }: typeof metrics) => {
    if (!access.financial) delete (m as Partial<typeof m>).finance;
    return m as Omit<typeof metrics, "finance"> & {
      finance?: typeof metrics.finance;
    };
  };
  const trends = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(+bounds.end - (7 - i) * 7 * 86400000),
      start = new Date(+end - 7 * 86400000);
    return {
      start: start.toISOString(),
      ...safeMetrics(
        calculateMetrics(records, visibleStandards, {
          start,
          end,
          asOf: new Date(),
        }),
      ),
    };
  });
  const teamMetrics = teams.map((team) => ({
    id: team.id,
    name: team.name,
    processId: team.processId,
    ...safeMetrics(
      calculateMetrics(
        records.filter((r) => r.teamId === team.id),
        visibleStandards.filter((w) => w.processId === team.processId),
        { ...bounds, asOf: new Date() },
      ),
    ),
  }));
  const opportunities = [
    ...(metrics.slaPct !== null && metrics.slaPct < access.account.targetSla
      ? [
          {
            workflow: "SERVICE_RECOVERY",
            signal: "SLA",
            value: metrics.slaPct,
            target: access.account.targetSla,
          },
        ]
      : []),
    ...(metrics.qaDefectPct !== null && metrics.qaDefectPct > 3
      ? [
          {
            workflow: "QUALITY_RECOVERY",
            signal: "QA",
            value: metrics.qaDefectPct,
            target: 3,
          },
        ]
      : []),
    ...(access.financial &&
    metrics.finance.marginPct !== null &&
    metrics.finance.marginPct < access.account.targetMargin
      ? [
          {
            workflow: "MARGIN_RECOVERY",
            signal: "MARGIN",
            value: metrics.finance.marginPct,
            target: access.account.targetMargin,
          },
        ]
      : []),
  ];
  return {
    scope: { teamIds: access.grant.teamIds, role: access.grant.role },
    account: {
      id: access.account.id,
      name: access.account.name,
      code: access.account.code,
      vertical: access.account.vertical,
      targetSla: access.account.targetSla,
      fenced: access.account.fenced,
      revision: access.account.revision,
      approvalLimits: access.account.approvalLimits as {
        TEAM_LEAD: number;
        OPS_MANAGER: number;
        COO_EXECUTIVE: number;
      },
      ...(access.financial
        ? { targetMargin: access.account.targetMargin }
        : {}),
    },
    role: access.grant.role,
    isItAdmin: access.isItAdmin,
    seeded: access.bpo.seeded,
    timezone: access.bpo.timezone,
    metrics: safeMetrics(metrics),
    trends,
    teams: teamMetrics,
    filterOptions: teamOptions.map((t) => ({
      id: t.id,
      name: t.name,
      processId: t.processId,
      processName: t.process.name,
    })),
    workers: workers.map((w) => ({
      id: w.id,
      name: w.name,
      teamId: w.teamId,
      fte: w.fte,
      active: w.active,
    })),
    workTypes: visibleStandards,
    forecast: forecastDemand(records, bounds.end, access.bpo.timezone),
    opportunities,
    activities: records
      .filter((r) =>
        ["HANDOVER", "COACHING", "AUTOMATION", "CERTIFICATION"].includes(
          r.kind,
        ),
      )
      .map((r) => ({
        id: r.id,
        kind: r.kind,
        teamId: r.teamId,
        workerId: r.workerId,
        payload: r.payload as Record<string, unknown>,
        occurredAt: r.occurredAt,
      })),
    evidence: records
      .filter((r) => ["WORK_ITEM", "QA"].includes(r.kind))
      .slice(-100)
      .map((r) => ({
        id: r.id,
        kind: r.kind,
        externalId: r.externalId,
        teamId: r.teamId,
        payload: r.payload as Record<string, unknown>,
        occurredAt: r.occurredAt,
      })),
  };
}
