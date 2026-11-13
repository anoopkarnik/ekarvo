"use client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/shadcn/sheet";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pulseSuites as suites, selectedSuite } from "@/lib/pulse/navigation";
import { usePulseWorkspace } from "./usePulseWorkspace";
import Link from "next/link";
import { Activity, ArrowUpRight, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import {
  Button,
  Field,
  Input,
  Metric,
  Notice,
  Panel,
  Table,
  Trend,
  selectClass,
  usePulseText,
} from "./ui";
import { DecisionLab, ActionLedger } from "./decisions";
import { ActivityForm, Configuration } from "./operations";
export type Dashboard = inferRouterOutputs<AppRouter>["pulse"]["dashboard"];
export const dateKey = (date: Date) => date.toISOString().slice(0, 10);
export default function PulseWorkspace() {
  const t = usePulseText(),
    router = useRouter();
  const {
    data,
    organization: org,
    loading,
    error,
    refetch,
  } = usePulseWorkspace();
  const [accountId, setAccount] = useState("");
  useEffect(() => {
    if (org?.isItAdmin && !org.suspended) router.replace("/pulse/admin");
  }, [org?.id, org?.isItAdmin, org?.suspended, router]);
  if (error)
    return (
      <div className="p-6">
        <Notice error>{t("error")}</Notice>
        <Button onClick={() => refetch()}>{t("retry")}</Button>
      </div>
    );
  if (loading || !data)
    return (
      <div className="p-6">
        <Notice>{t("loading")}</Notice>
      </div>
    );
  const account =
    org?.accounts.find((a) => a.id === accountId) || org?.accounts[0];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 px-5 py-4 text-white [&_label]:text-slate-300">
        <div className="flex items-center gap-3">
          <Activity className="size-8 rounded-lg bg-teal-600 p-1.5" />
          <div>
            <h1 className="text-sm font-bold tracking-wide">{t("brand")}</h1>
            <p className="text-xs text-teal-300">{t("tagline")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {account && (
            <Field label={t("client")}>
              <select
                className={selectClass}
                value={account.id}
                onChange={(e) => setAccount(e.target.value)}
              >
                {org!.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {data.platformAdmin && (
            <Link className="self-end p-3 text-xs" href="/admin/bpos">
              {t("platform")}
            </Link>
          )}
        </div>
      </header>
      {org?.suspended ? (
        <div className="p-6">
          <Notice error>{t("noAccess")}</Notice>
        </div>
      ) : account ? (
        <AccountWorkspace
          key={`${org!.id}:${account.id}`}
          organizationId={org!.id}
          accountId={account.id}
          userId={data.userId}
        />
      ) : (
        <div className="p-6">
          <Notice>{t("pending")}</Notice>
        </div>
      )}
    </div>
  );
}
export function AccountWorkspace({
  organizationId,
  accountId,
  userId,
}: {
  organizationId: string;
  accountId: string;
  userId: string;
}) {
  const trpc = useTRPC(),
    cache = useQueryClient(),
    t = usePulseText();
  const params = useSearchParams(),
    router = useRouter();
  const suite = selectedSuite(params.get("suite"));
  const setSuite = (value: typeof suite) => {
    const next = new URLSearchParams(params.toString());
    next.set("suite", value);
    router.push(`/pulse?${next}`, { scroll: false });
  };
  const [from, setFrom] = useState(
      dateKey(new Date(Date.now() - 7 * 86400000)),
    ),
    [through, setThrough] = useState(dateKey(new Date())),
    [team, setTeam] = useState(""),
    [processId, setProcess] = useState(""),
    [processTeams, setProcessTeams] = useState<string[]>([]),
    [intel, setIntel] = useState(false),
    [tour, setTour] = useState(false);
  const input = {
    organizationId,
    accountId,
    from,
    through,
    ...(team
      ? { teamIds: [team] }
      : processTeams.length
        ? { teamIds: processTeams }
        : {}),
  };
  const query = useQuery(trpc.pulse.dashboard.queryOptions(input));
  const portfolio = useQuery({
    ...trpc.pulse.portfolio.queryOptions({ organizationId, from, through }),
    enabled: suite === "command",
  });
  const refresh = () =>
    cache.invalidateQueries({ queryKey: trpc.pulse.pathKey() });
  if (query.error)
    return (
      <div className="p-6">
        <Notice error>{query.error.message}</Notice>
        <Button onClick={() => query.refetch()}>{t("retry")}</Button>
      </div>
    );
  const d = query.data;
  return (
    <>
      <div className="space-y-5 p-4 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-teal-700">
              {d ? t(d.role) : t("loading")}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t(suite)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {t(`${suite}Desc`)}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Field label={t("from")}>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field>
            <Field label={t("through")}>
              <Input
                type="date"
                value={through}
                min={from}
                onChange={(e) => setThrough(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => setIntel(true)}
              className="bg-teal-700 text-white hover:bg-teal-800"
            >
              <Sparkles className="size-4" />
              {t("intelligence")}
            </Button>
            {d?.seeded && (
              <Button variant="outline" onClick={() => setTour(!tour)}>
                {t("tour")}
              </Button>
            )}
            {d && (
              <Button variant="outline" asChild>
                <a
                  href={`/api/pulse/export?${new URLSearchParams([
                    ["organizationId", organizationId],
                    ["accountId", accountId],
                    ["from", from],
                    ["through", through],
                    ...(input.teamIds || []).map((id) => ["teamIds", id]),
                  ])}`}
                >
                  {t("exportActuals")}
                </a>
              </Button>
            )}
          </div>
        </div>
        {tour && (
          <Notice>
            <p>{t("tourText")}</p>
            <Button
              variant="link"
              onClick={() =>
                setSuite(suites[(suites.indexOf(suite) + 1) % suites.length]!)
              }
            >
              {t("next")}
            </Button>
          </Notice>
        )}
        {!d ? (
          <Notice>{t("loading")}</Notice>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <Field label={t("PROCESS")}>
                <select
                  className={selectClass}
                  value={processId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProcess(value);
                    setTeam("");
                    setProcessTeams(
                      value
                        ? d.filterOptions
                            .filter((v) => v.processId === value)
                            .map((v) => v.id)
                        : [],
                    );
                  }}
                >
                  <option value="">{t("allProcesses")}</option>
                  {[
                    ...new Map(
                      d.filterOptions.map((v) => [v.processId, v.processName]),
                    ).entries(),
                  ].map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("team")}>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className={selectClass}
                >
                  <option value="">{t("allTeams")}</option>
                  {d.filterOptions
                    .filter((tm) => !processId || tm.processId === processId)
                    .map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.name}
                      </option>
                    ))}
                </select>
              </Field>
              <span className="pb-2 text-xs text-slate-500">
                {d.timezone} · {t("actuals")}
              </span>
            </div>
            {suite === "command" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    ["arrivals", "completions", "backlog", "slaPct"] as const
                  ).map((k, i) => (
                    <Metric
                      key={k}
                      label={t(k)}
                      value={d.metrics[k]}
                      suffix={k === "slaPct" ? "%" : ""}
                      dark={i === 3}
                    />
                  ))}
                </div>
                <div className="grid gap-5 xl:grid-cols-5">
                  <div className="xl:col-span-3">
                    <Panel title={t("trends")}>
                      <Trend points={d.trends} />
                    </Panel>
                  </div>
                  <div className="xl:col-span-2">
                    <Panel title={t("opportunities")}>
                      {d.opportunities.length ? (
                        d.opportunities.map((o) => (
                          <button
                            key={o.workflow}
                            className="mb-2 flex w-full items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left"
                            onClick={() => setSuite("decision")}
                          >
                            <div>
                              <div className="text-sm font-semibold">
                                {t(o.workflow)}
                              </div>
                              <div className="mt-1 font-mono text-xs text-amber-800">{`${o.value}% / ${o.target}%`}</div>
                            </div>
                            <ArrowUpRight className="size-4" />
                          </button>
                        ))
                      ) : (
                        <Notice>{t("noEvidence")}</Notice>
                      )}
                    </Panel>
                  </div>
                </div>
                <Panel title={t("portfolio")}>
                  <Table
                    headers={[
                      t("client"),
                      t("role"),
                      t("arrivals"),
                      t("backlog"),
                      t("slaPct"),
                    ]}
                    rows={(portfolio.data || []).map((p) => [
                      p.account.name,
                      t(p.role),
                      p.metrics.arrivals,
                      p.metrics.backlog,
                      p.metrics.slaPct,
                    ])}
                  />
                </Panel>
                <TeamTable d={d} onSelect={setTeam} />
                <WorkTypes d={d} />
              </>
            )}
            {suite === "plan" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    [
                      "paidHours",
                      "unavailableHours",
                      "reworkHours",
                      "capacityHours",
                    ] as const
                  ).map((k) => (
                    <Metric key={k} label={t(k)} value={d.metrics[k]} />
                  ))}
                </div>
                <div className="grid gap-5 xl:grid-cols-2">
                  <Panel title={t("forecast")}>
                    <Table
                      headers={[t("date"), t("arrivals")]}
                      rows={d.forecast.days.map((v) => [v.date, v.units])}
                    />
                    {!d.forecast.sufficient && (
                      <Notice>{t("noEvidence")}</Notice>
                    )}
                  </Panel>
                  <Panel title={t("handover")}>
                    <ActivityForm
                      input={input}
                      d={d}
                      kind="HANDOVER"
                      onSaved={refresh}
                    />
                  </Panel>
                </div>
                <Button onClick={() => setSuite("decision")}>
                  {t("openWorkflow")}
                </Button>
                <TeamTable d={d} onSelect={setTeam} />
                <WorkTypes d={d} />
                <Activities d={d} kinds={["HANDOVER"]} />
              </>
            )}
            {suite === "perform" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    [
                      "firstPassPct",
                      "qaDefectPct",
                      "employeeCoveragePct",
                      "transactionCoveragePct",
                    ] as const
                  ).map((k) => (
                    <Metric
                      key={k}
                      label={t(k)}
                      value={d.metrics[k]}
                      suffix="%"
                    />
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric
                    label={t("earnedHours")}
                    value={d.metrics.earnedHours}
                  />
                  <Metric
                    label={t("productivityPct")}
                    value={d.metrics.productivityPct}
                    suffix="%"
                  />
                </div>
                <Panel title={t("qualitySegments")}>
                  <Table
                    headers={[
                      t("sopVersion"),
                      t("audited"),
                      t("defects"),
                      t("qaDefectPct"),
                    ]}
                    rows={d.metrics.qualitySegments.map((s) => [
                      s.sop,
                      s.audits,
                      s.defects,
                      s.defectPct,
                    ])}
                  />
                </Panel>
                <Panel title={t("defects")}>
                  <Table
                    headers={[t("name"), t("count")]}
                    rows={d.metrics.defects.map((v) => [v.label, v.count])}
                  />
                  <p className="mt-3 text-xs text-slate-500">{`${t("audited")}: ${d.metrics.audited} · ${t("completions")}: ${d.metrics.completions}`}</p>
                </Panel>
                {d.metrics.finance && (
                  <Panel title={t("finance")}>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {(
                        [
                          "revenue",
                          "labor",
                          "overhead",
                          "rework",
                          "contribution",
                          "marginPct",
                        ] as const
                      ).map((k) => (
                        <Metric
                          key={k}
                          label={t(k)}
                          value={d.metrics.finance![k]}
                          suffix={k === "marginPct" ? "%" : " USD"}
                        />
                      ))}
                    </div>
                  </Panel>
                )}
                <Panel title={t("evidence")}>
                  <Table
                    headers={[t("id"), t("kind"), t("date"), t("team")]}
                    rows={d.evidence.map((r) => [
                      r.externalId,
                      t(r.kind),
                      String(r.occurredAt).slice(0, 10),
                      d.teams.find((tm) => tm.id === r.teamId)?.name,
                    ])}
                  />
                </Panel>
              </>
            )}
            {suite === "develop" && (
              <>
                <Panel title={t("skills")}>
                  <Table
                    headers={[
                      t("worker"),
                      t("team"),
                      t("requiredSkill"),
                      t("validUntil"),
                    ]}
                    rows={d.activities
                      .filter((a) => a.kind === "CERTIFICATION")
                      .map((a) => {
                        const p = a.payload as Record<string, unknown>;
                        return [
                          d.workers.find((w) => w.id === a.workerId)?.name,
                          d.teams.find((tm) => tm.id === a.teamId)?.name,
                          String(p.skill),
                          String(p.validUntil).slice(0, 10),
                        ];
                      })}
                  />
                </Panel>
                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title={t("coaching")}>
                    <ActivityForm
                      input={input}
                      d={d}
                      kind="COACHING"
                      onSaved={refresh}
                    />
                  </Panel>
                  <Panel title={t("automation")}>
                    <ActivityForm
                      input={input}
                      d={d}
                      kind="AUTOMATION"
                      onSaved={refresh}
                    />
                  </Panel>
                </div>
                <WorkTypes d={d} />
                <Activities d={d} kinds={["COACHING", "AUTOMATION"]} />
              </>
            )}
            {suite === "decision" && (
              <DecisionLab input={input} d={d} userId={userId} />
            )}
            {suite === "actions" && (
              <ActionLedger input={input} d={d} userId={userId} />
            )}
            {suite === "config" && (
              <Configuration input={input} d={d} onSaved={refresh} />
            )}
          </>
        )}
      </div>
      {intel && <Intelligence input={input} onClose={() => setIntel(false)} />}
    </>
  );
}
function TeamTable({
  d,
  onSelect,
}: {
  d: Dashboard;
  onSelect: (id: string) => void;
}) {
  const t = usePulseText();
  return (
    <Panel title={t("drilldown")}>
      <Table
        headers={[
          t("team"),
          t("arrivals"),
          t("completions"),
          t("backlog"),
          t("slaPct"),
          t("capacityHours"),
        ]}
        rows={d.teams.map((tm) => [
          <button
            key={tm.id}
            className="text-left font-semibold text-teal-700 underline"
            onClick={() => onSelect(tm.id)}
          >
            {tm.name}
          </button>,
          tm.arrivals,
          tm.completions,
          tm.backlog,
          tm.slaPct,
          tm.capacityHours,
        ])}
      />
    </Panel>
  );
}
function WorkTypes({ d }: { d: Dashboard }) {
  const t = usePulseText();
  return (
    <Panel title={t("workTypes")}>
      <Table
        headers={[
          t("name"),
          t("standardMinutes"),
          t("complexity"),
          t("slaHours"),
          t("requiredSkill"),
          t("backlog"),
          t("overdue"),
        ]}
        rows={d.workTypes.map((w) => [
          w.name,
          w.standardMinutes,
          w.complexity,
          w.slaHours,
          w.requiredSkill,
          d.metrics.queues.find((q) => q.id === w.id)?.backlog,
          d.metrics.queues.find((q) => q.id === w.id)?.overdue,
        ])}
      />
    </Panel>
  );
}
function Activities({ d, kinds }: { d: Dashboard; kinds: string[] }) {
  const t = usePulseText();
  return (
    <Panel title={t("actions")}>
      <Table
        headers={[t("kind"), t("note"), t("status"), t("date")]}
        rows={d.activities
          .filter((a) => kinds.includes(a.kind))
          .map((a) => {
            const p = a.payload as Record<string, unknown>;
            return [
              t(a.kind),
              String(p.note || ""),
              t(String(p.status)),
              String(a.occurredAt).slice(0, 10),
            ];
          })}
      />
    </Panel>
  );
}
function Intelligence({
  input,
  onClose,
}: {
  input: {
    organizationId: string;
    accountId: string;
    from: string;
    through: string;
  };
  onClose: () => void;
}) {
  const t = usePulseText();
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full gap-0 border-slate-200 bg-white text-slate-900 sm:max-w-lg">
        <SheetDescription className="sr-only">{t("question")}</SheetDescription>
        <div className="flex items-center justify-between bg-slate-950 p-5 text-white">
          <SheetTitle className="text-white">{t("intelligence")}</SheetTitle>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
        <form
          className="space-y-4 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/pulse/intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...input, question }),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              setAnswer(
                result.answer ||
                  `${t("evidenceOnly")}\n${t("arrivals")}: ${result.evidence.metrics.arrivals}\n${t("completions")}: ${result.evidence.metrics.completions}\n${t("backlog")}: ${result.evidence.metrics.backlog}`,
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label={t("question")}>
            <textarea
              autoFocus
              className={`${selectClass} min-h-24`}
              required
              maxLength={2000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </Field>
          <Button disabled={busy}>{busy ? t("loading") : t("ask")}</Button>
        </form>
        {error && <Notice error>{error}</Notice>}
        <div className="overflow-y-auto whitespace-pre-wrap px-5 pb-5 text-sm leading-7">
          {answer}
        </div>
      </SheetContent>
    </Sheet>
  );
}
