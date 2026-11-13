import type { Prisma } from "./generated/prisma/client";
import { createHash } from "node:crypto";
const CLIENTS = [
  ["Meridian Healthcare RCM", "HEALTHCARE_RCM"],
  ["Aegis Health Systems", "HEALTHCARE_RCM"],
  ["Vanguard Global Financial", "FINANCE_ACCOUNTING"],
  ["Northstar Logistics", "FINANCE_ACCOUNTING"],
  ["Summit P&C Insurance", "INSURANCE"],
  ["Aurora Life Assurance", "INSURANCE"],
] as const;
export function buildPulseSeed(organizationId: string, anchor: Date) {
  const day = 86400000,
    monday = new Date(anchor);
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const first = +monday - 56 * day;
  const accounts: Prisma.ClientAccountCreateManyInput[] = [],
    sites: Prisma.PulseSiteCreateManyInput[] = [],
    processes: Prisma.PulseProcessCreateManyInput[] = [],
    teams: Prisma.PulseTeamCreateManyInput[] = [],
    workers: Prisma.PulseWorkerCreateManyInput[] = [],
    workTypes: Prisma.PulseWorkTypeCreateManyInput[] = [],
    records: (Prisma.PulseRecordCreateManyInput & {
      payload: Record<string, unknown>;
    })[] = [];
  const add = (
    accountId: string,
    kind: Prisma.PulseRecordCreateManyInput["kind"],
    externalId: string,
    occurredAt: Date,
    payload: Record<string, unknown>,
    teamId?: string,
    workerId?: string,
  ) => {
    const data = {
      externalId,
      occurredAt: occurredAt.toISOString(),
      ...(teamId ? { teamId } : {}),
      ...(workerId ? { workerId } : {}),
      ...payload,
    };
    records.push({
      id: `${organizationId}:${externalId}`,
      organizationId,
      accountId,
      kind,
      externalId,
      source: "pulse-demo",
      occurredAt,
      teamId,
      workerId,
      payload: data,
      fingerprint: createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex"),
    });
  };
  CLIENTS.forEach(([name, vertical], a) => {
    const accountId = `${organizationId}:client:${a}`,
      common = { organizationId, accountId };
    accounts.push({
      id: accountId,
      organizationId,
      code: `PULSE-${a + 1}`,
      name,
      vertical,
      fenced: a === 0,
      targetSla: 96,
      targetMargin: 28,
    });
    const siteId = `${accountId}:site`;
    sites.push({
      ...common,
      id: siteId,
      externalId: `site-${a}`,
      name: a % 2 ? "Hyderabad" : "Manila",
    });
    add(accountId, "CONTRACT", `contract-${a}`, new Date(first), {
      pricingModel: "PER_UNIT",
      ratePerUnit: a === 2 ? 14 : 20,
      monthlyBaseFee: 0,
      effectiveFrom: new Date(first).toISOString(),
      effectiveTo: new Date(+anchor + 365 * day).toISOString(),
      targetSla: 96,
      penaltyMax: 5000,
    });
    for (let t = 0; t < 2; t++) {
      const processId = `${accountId}:process:${t}`,
        teamId = `${accountId}:team:${t}`;
      processes.push({
        ...common,
        id: processId,
        externalId: `process-${a}-${t}`,
        name: t ? "Exceptions" : "Standard processing",
      });
      teams.push({
        ...common,
        id: teamId,
        externalId: `team-${a}-${t}`,
        name: `${name.split(" ")[0]} ${t ? "Specialists" : "Operations"}`,
        processId,
        siteId,
      });
      for (let w = 0; w < 2; w++)
        workTypes.push({
          ...common,
          id: `${processId}:type:${w}`,
          externalId: `type-${a}-${t}-${w}`,
          name: w ? "Complex case" : "Routine case",
          processId,
          standardMinutes: w ? 75 : 45,
          complexity: w ? 1.4 : 1,
          slaHours: 24,
          requiredSkill: vertical,
          automationEligible: w === 0,
        });
      for (let w = 0; w < 10; w++) {
        const workerId = `${teamId}:worker:${w}`;
        workers.push({
          ...common,
          id: workerId,
          externalId: `worker-${a}-${t}-${w}`,
          name: `${["Alex", "Sam", "Priya", "Maya", "Jordan", "Ravi", "Jamie", "Avery", "Morgan", "Taylor"][w]} ${a + 1}${t + 1}`,
          teamId,
          fte: 1,
          hourlyRate: a === 2 ? 12 : 8,
          overtimeMultiplier: 1.5,
          active: true,
        });
        add(
          accountId,
          "CERTIFICATION",
          `cert-${a}-${t}-${w}`,
          new Date(first),
          {
            skill: vertical,
            validUntil: new Date(+anchor + 365 * day).toISOString(),
          },
          teamId,
          workerId,
        );
        add(
          accountId,
          "ASSIGNMENT",
          `assignment-${a}-${t}-${w}`,
          new Date(first),
          {
            start: new Date(first).toISOString(),
            end: new Date(+anchor + 365 * day).toISOString(),
            fte: 1,
          },
          teamId,
          workerId,
        );
        for (let d = 0; first + d * day <= +anchor; d++) {
          const at = new Date(first + d * day + 6 * 3600000);
          if (+at > +anchor || [0, 6].includes(at.getUTCDay())) continue;
          const key = `${a}-${t}-${w}-${d}`,
            recent = d >= 42,
            leave = a === 0 && recent && w < 2;
          add(
            accountId,
            "SHIFT",
            `shift-${key}`,
            at,
            {
              hours: 8,
              start: at.toISOString(),
              end: new Date(+at + 8 * 3600000).toISOString(),
            },
            teamId,
            workerId,
          );
          add(
            accountId,
            "TIME_ENTRY",
            `time-${key}`,
            at,
            {
              hours: 7,
              category: leave ? "LEAVE" : "PRODUCTIVE",
              hourlyRate: a === 2 ? 12 : 8,
              overtime: false,
              overtimeMultiplier: 1.5,
            },
            teamId,
            workerId,
          );
          add(
            accountId,
            "TIME_ENTRY",
            `shrink-${key}`,
            at,
            {
              hours: 1,
              category: a === 1 && recent ? "REWORK" : "BREAK",
              hourlyRate: a === 2 ? 12 : 8,
              overtime: false,
              overtimeMultiplier: 1.5,
            },
            teamId,
            workerId,
          );
          if (a === 2 && recent)
            add(
              accountId,
              "TIME_ENTRY",
              `ot-${key}`,
              at,
              {
                hours: 2,
                category: "PRODUCTIVE",
                hourlyRate: 12,
                overtime: true,
                overtimeMultiplier: 1.5,
              },
              teamId,
              workerId,
            );
          if (leave) continue;
          for (let u = 0; u < 5; u++) {
            const externalId = `work-${key}-${u}`,
              workItemId = `${organizationId}:${externalId}`,
              late = a === 0 && recent && (w + u) % 4 === 0,
              defect =
                a === 1 && recent
                  ? (w + u + d) % 5 === 0
                  : (w + u + d) % 31 === 0,
              completed = new Date(+at + (late ? 28 : 4) * 3600000);
            const done = +completed < +anchor && !late;
            add(
              accountId,
              "WORK_ITEM",
              externalId,
              at,
              {
                workTypeId: `${processId}:type:${u % 2}`,
                arrivedAt: at.toISOString(),
                dueAt: new Date(+at + 24 * 3600000).toISOString(),
                ...(done
                  ? { completedAt: completed.toISOString(), firstPass: !defect }
                  : {}),
                complexity: a === 2 && recent ? 1.8 : 1,
                sopVersion: a === 1 && recent ? "4.2" : "4.1",
              },
              teamId,
              workerId,
            );
            if (done) {
              add(
                accountId,
                "WORK_EVENT",
                `event-${key}-${u}`,
                completed,
                { workItemId, event: "COMPLETED", minutes: u % 2 ? 75 : 45 },
                teamId,
                workerId,
              );
              if (u === 0)
                add(
                  accountId,
                  "QA",
                  `qa-${key}-${u}`,
                  completed,
                  {
                    workItemId,
                    passed: !defect,
                    ...(defect ? { defect: "Procedure deviation" } : {}),
                    sopVersion: a === 1 && recent ? "4.2" : "4.1",
                  },
                  teamId,
                  workerId,
                );
            }
          }
        }
      }
    }
    for (let d = 0; first + d * day <= +anchor; d++) {
      const at = new Date(first + d * day + 18 * 3600000);
      if (+at > +anchor || [0, 6].includes(at.getUTCDay())) continue;
      const completed = records.filter(
        (r) =>
          r.accountId === accountId &&
          r.kind === "WORK_ITEM" &&
          typeof r.payload.completedAt === "string" &&
          String(r.payload.completedAt).slice(0, 10) ===
            at.toISOString().slice(0, 10),
      ).length;
      add(accountId, "FINANCE", `revenue-${a}-${d}`, at, {
        category: "REVENUE",
        amount: completed * (a === 2 ? 14 : 20),
        currency: "USD",
      });
      add(accountId, "FINANCE", `overhead-${a}-${d}`, at, {
        category: "OVERHEAD",
        amount: a === 2 ? 180 : 100,
        currency: "USD",
      });
    }
  });
  return { accounts, sites, processes, teams, workers, workTypes, records };
}
