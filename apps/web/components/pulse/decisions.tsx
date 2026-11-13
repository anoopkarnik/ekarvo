"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { canTransition } from "@/lib/pulse/policy";
import type { Parameters } from "@/lib/pulse/metrics";
import type { Dashboard } from "./PulseWorkspace";
import { dateKey } from "./PulseWorkspace";
import {
  Button,
  Field,
  Input,
  Metric,
  Notice,
  Panel,
  Table,
  selectClass,
  usePulseText,
} from "./ui";
type InputScope = {
  organizationId: string;
  accountId: string;
  from: string;
  through: string;
  teamIds?: string[];
};
const levers = [
  "demandSurgePct",
  "ptoDeltaPct",
  "defectRatePct",
  "overtimeHours",
  "redeployFte",
  "coachingHours",
  "auditPct",
  "reprioritizePct",
  "reworkReductionPct",
  "overtimeReductionPct",
  "scopeResetPct",
  "automationPct",
] as const;
export function DecisionLab({
  input,
  d,
  userId,
}: {
  input: InputScope;
  d: Dashboard;
  userId: string;
}) {
  const trpc = useTRPC(),
    cache = useQueryClient(),
    t = usePulseText();
  const [name, setName] = useState(""),
    [workflow, setWorkflow] = useState<
      "SERVICE_RECOVERY" | "QUALITY_RECOVERY" | "MARGIN_RECOVERY"
    >("SERVICE_RECOVERY"),
    [p, setP] = useState<Parameters>({}),
    [start, setStart] = useState(dateKey(new Date())),
    [end, setEnd] = useState(dateKey(new Date(Date.now() + 6 * 86400000)));
  const donors = useQuery(
    trpc.pulse.donors.queryOptions({ organizationId: input.organizationId }),
  );
  const save = useMutation(
    trpc.pulse.saveScenario.mutationOptions({
      onSuccess: () =>
        cache.invalidateQueries({ queryKey: trpc.pulse.pathKey() }),
    }),
  );
  const params = {
    demandSurgePct: 0,
    ptoDeltaPct: 0,
    overtimeHours: 0,
    redeployFte: 0,
    coachingHours: 0,
    sopRollout: false,
    auditPct: 0,
    overtimeReductionPct: 0,
    reworkReductionPct: 0,
    scopeResetPct: 0,
    automationPct: 0,
    reprioritizePct: 0,
    ...p,
  };
  return (
    <div className="space-y-5">
      <Panel title={t("decision")}>
        <Notice>{t("receivingHelp")}</Notice>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({
              ...input,
              name,
              workflow,
              parameters: params,
              actionStart: start,
              actionEnd: end,
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Field label={t("scenarioName")}>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label={t("workflow")}>
              <select
                className={selectClass}
                value={workflow}
                onChange={(e) => setWorkflow(e.target.value as typeof workflow)}
              >
                {[
                  "SERVICE_RECOVERY",
                  "QUALITY_RECOVERY",
                  ...(d.role === "TEAM_LEAD" ? [] : ["MARGIN_RECOVERY"]),
                ].map((w) => (
                  <option key={w} value={w}>
                    {t(w)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("actionStart")}>
              <Input
                type="date"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label={t("actionEnd")}>
              <Input
                type="date"
                required
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {levers
              .filter(
                (k) =>
                  d.role !== "TEAM_LEAD" ||
                  ![
                    "scopeResetPct",
                    "overtimeReductionPct",
                    "automationPct",
                  ].includes(k),
              )
              .map((k) => (
                <Field key={k} label={t(k)}>
                  <Input
                    type="number"
                    step="0.5"
                    min={
                      k === "demandSurgePct"
                        ? -50
                        : k === "ptoDeltaPct"
                          ? -20
                          : 0
                    }
                    max={k === "overtimeHours" ? 220 : 500}
                    value={p[k] ?? ""}
                    onChange={(e) =>
                      setP({
                        ...p,
                        [k]:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              ))}
            <Field label={t("donorTeamId")}>
              <select
                className={selectClass}
                value={p.donorTeamId || ""}
                onChange={(e) =>
                  setP({ ...p, donorTeamId: e.target.value || undefined })
                }
              >
                <option value="">—</option>
                {(donors.data || [])
                  .filter((team) => !input.teamIds?.includes(team.id))
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.account.name} · {team.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label={t("sopRollout")}>
              <input
                type="checkbox"
                className="size-5 accent-teal-700"
                checked={!!p.sopRollout}
                onChange={(e) => setP({ ...p, sopRollout: e.target.checked })}
              />
            </Field>
          </div>
          {save.error && <Notice error>{save.error.message}</Notice>}
          {save.isSuccess && <Notice>{t("saved")}</Notice>}
          <Button
            className="bg-teal-700 hover:bg-teal-800"
            disabled={save.isPending}
          >
            {t("compare")}
          </Button>
        </form>
      </Panel>
      <ActionLedger input={input} d={d} userId={userId} />
    </div>
  );
}
export function ActionLedger({
  input,
  d,
  userId,
}: {
  input: InputScope;
  d: Dashboard;
  userId: string;
}) {
  const trpc = useTRPC(),
    cache = useQueryClient(),
    t = usePulseText();
  const { data: scenarios, error } = useQuery(
    trpc.pulse.scenarios.queryOptions(input),
  );
  const events = useQuery(trpc.pulse.audit.queryOptions(input));
  const refresh = () =>
    cache.invalidateQueries({ queryKey: trpc.pulse.pathKey() });
  const propose = useMutation(
      trpc.pulse.propose.mutationOptions({ onSuccess: refresh }),
    ),
    transition = useMutation(
      trpc.pulse.transition.mutationOptions({ onSuccess: refresh }),
    );
  if (error) return <Notice error>{error.message}</Notice>;
  if (!scenarios) return <Notice>{t("loading")}</Notice>;
  return (
    <div className="space-y-5">
      {(propose.error || transition.error) && (
        <Notice error>
          {propose.error?.message || transition.error?.message}
        </Notice>
      )}
      {!scenarios.length && <Notice>{t("empty")}</Notice>}
      <div className="grid gap-5 xl:grid-cols-2">
        {scenarios.map((s) => {
          const result = s.result as Record<string, unknown>,
            base = (result.comparableBaseline || s.baseline) as Record<
              string,
              unknown
            >,
            action = s.interventions[0];
          return (
            <Panel
              key={s.id}
              title={s.name}
              action={
                <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  {t("simulated")}
                </span>
              }
            >
              <p className="mb-4 text-xs text-slate-500">
                {t(s.workflow)} · {String(s.start).slice(0, 10)} →{" "}
                {String(s.end).slice(0, 10)}
              </p>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <Metric label={t("gap")} value={result.gap} />
                <Metric
                  label={t("projectedBacklog")}
                  value={result.projectedBacklog}
                />
              </div>
              <Table
                headers={[
                  t("name"),
                  t("baseline"),
                  t("simulated"),
                  t("observation"),
                ]}
                rows={[
                  ["backlog", "projectedBacklog"],
                  ["capacityHours", "capacityHours"],
                  ["demandHours", "demandHours"],
                ].map(([actual, sim]) => [
                  t(actual!),
                  String(base[actual!] ?? "—"),
                  String(result[sim!] ?? "—"),
                  action?.observation
                    ? String(
                        (action.observation as Record<string, unknown>)[
                          actual!
                        ] ?? "—",
                      )
                    : "—",
                ])}
              />
              {result.finance && d.role !== "TEAM_LEAD" ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Metric
                    label={t("marginPct")}
                    value={
                      (result.finance as Record<string, unknown>).marginPct
                    }
                    suffix="%"
                  />
                  <Metric
                    label={t("contribution")}
                    value={
                      (result.finance as Record<string, unknown>).netImpact
                    }
                    suffix=" USD"
                  />
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {!action ? (
                  <Button
                    disabled={propose.isPending}
                    onClick={() =>
                      propose.mutate({
                        organizationId: input.organizationId,
                        scenarioId: s.id,
                      })
                    }
                  >
                    {t("propose")}
                  </Button>
                ) : (
                  <>
                    <span className="self-center rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">
                      {t(action.status)}
                    </span>
                    {(
                      [
                        "APPROVED",
                        "REJECTED",
                        "IN_PROGRESS",
                        "COMPLETED",
                        "VERIFIED",
                        "CANCELLED",
                      ] as const
                    )
                      .filter((status) =>
                        canTransition(
                          action.status,
                          status,
                          d.role,
                          action.ownerId === userId,
                        ),
                      )
                      .map((status) => (
                        <Button
                          key={status}
                          variant={
                            status === "APPROVED" ? "default" : "outline"
                          }
                          disabled={transition.isPending}
                          onClick={() =>
                            transition.mutate({
                              organizationId: input.organizationId,
                              id: action.id,
                              version: action.version,
                              status,
                            })
                          }
                        >
                          {t(status)}
                        </Button>
                      ))}
                  </>
                )}
              </div>
              {action?.status === "COMPLETED" && !action.observation && (
                <p className="mt-3 text-xs text-slate-500">
                  {t("pendingObservation")}
                </p>
              )}
            </Panel>
          );
        })}
      </div>
      <Panel title={t("auditTrail")}>
        <Table
          headers={[t("date"), t("status"), t("owner")]}
          rows={(events.data || []).map((e) => [
            String(e.createdAt).slice(0, 19),
            e.action,
            e.actorId,
          ])}
        />
      </Panel>
    </div>
  );
}
