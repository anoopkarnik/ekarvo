"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import type { Dashboard } from "./PulseWorkspace";
import {
  Button,
  Field,
  Input,
  Notice,
  Panel,
  Table,
  selectClass,
  usePulseText,
} from "./ui";
type Scope = { organizationId: string; accountId: string };
export function ActivityForm({
  input,
  d,
  kind,
  onSaved,
}: {
  input: Scope;
  d: Dashboard;
  kind: "HANDOVER" | "COACHING" | "AUTOMATION";
  onSaved: () => unknown;
}) {
  const t = usePulseText(),
    trpc = useTRPC();
  const [teamId, setTeam] = useState(d.teams[0]?.id || ""),
    [workerId, setWorker] = useState(""),
    [workTypeId, setType] = useState(""),
    [note, setNote] = useState(""),
    [hours, setHours] = useState(1);
  const mutation = useMutation(
    trpc.pulse.activity.mutationOptions({
      onSuccess: () => {
        setNote("");
        onSaved();
      },
    }),
  );
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({
          ...input,
          kind,
          payload: {
            teamId,
            note,
            ...(kind === "COACHING" ? { workerId, hours } : {}),
            ...(kind === "AUTOMATION" ? { workTypeId } : {}),
          },
        });
      }}
    >
      <Field label={t("team")}>
        <select
          required
          className={selectClass}
          value={teamId}
          onChange={(e) => {
            setTeam(e.target.value);
            setWorker("");
            setType("");
          }}
        >
          {d.teams.map((tm) => (
            <option key={tm.id} value={tm.id}>
              {tm.name}
            </option>
          ))}
        </select>
      </Field>
      {kind === "COACHING" && (
        <>
          <Field label={t("worker")}>
            <select
              required
              className={selectClass}
              value={workerId}
              onChange={(e) => setWorker(e.target.value)}
            >
              <option value="">—</option>
              {d.workers
                .filter((w) => w.teamId === teamId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={t("hours")}>
            <Input
              type="number"
              min={0}
              max={80}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </Field>
        </>
      )}
      {kind === "AUTOMATION" && (
        <Field label={t("workTypeId")}>
          <select
            required
            className={selectClass}
            value={workTypeId}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">—</option>
            {d.workTypes
              .filter(
                (w) =>
                  w.processId ===
                  d.teams.find((tm) => tm.id === teamId)?.processId,
              )
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
          </select>
        </Field>
      )}
      <Field label={t("note")}>
        <textarea
          className={`${selectClass} min-h-24`}
          required
          maxLength={4000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {mutation.error && <Notice error>{mutation.error.message}</Notice>}
      <Button disabled={mutation.isPending || !teamId}>{t("save")}</Button>
    </form>
  );
}
export function Configuration({
  input,
  d,
  onSaved,
}: {
  input: Scope;
  d: Dashboard;
  onSaved: () => unknown;
}) {
  const t = usePulseText(),
    trpc = useTRPC(),
    [sla, setSla] = useState(d.account.targetSla),
    [margin, setMargin] = useState(d.account.targetMargin || 28),
    [fenced, setFenced] = useState(d.account.fenced),
    [limits, setLimits] = useState(d.account.approvalLimits);
  const mutation = useMutation(
    trpc.pulse.configure.mutationOptions({ onSuccess: onSaved }),
  );
  return (
    <div className="space-y-5">
      {d.role === "COO_EXECUTIVE" ? (
        <Panel title={t("config")}>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({
                ...input,
                targetSla: sla,
                targetMargin: margin,
                fenced,
                limits,
              });
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("targetSla")}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={sla}
                  onChange={(e) => setSla(Number(e.target.value))}
                />
              </Field>
              <Field label={t("targetMargin")}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                />
              </Field>
              {(["TEAM_LEAD", "OPS_MANAGER", "COO_EXECUTIVE"] as const).map(
                (role) => (
                  <Field
                    key={role}
                    label={`${t(role)} · ${t("overtimeHours")}`}
                  >
                    <Input
                      type="number"
                      min={0}
                      max={
                        { TEAM_LEAD: 40, OPS_MANAGER: 140, COO_EXECUTIVE: 220 }[
                          role
                        ]
                      }
                      value={limits[role]}
                      onChange={(e) =>
                        setLimits({ ...limits, [role]: Number(e.target.value) })
                      }
                    />
                  </Field>
                ),
              )}
              <Field label={t("fenced")}>
                <input
                  className="size-5 accent-teal-700"
                  type="checkbox"
                  checked={fenced}
                  onChange={(e) => setFenced(e.target.checked)}
                />
              </Field>
            </div>
            {mutation.error && <Notice error>{mutation.error.message}</Notice>}
            {mutation.isSuccess && <Notice>{t("saved")}</Notice>}
            <Button disabled={mutation.isPending}>{t("save")}</Button>
          </form>
        </Panel>
      ) : (
        <Notice>{t("commercialRestricted")}</Notice>
      )}
      {d.role !== "TEAM_LEAD" && (
        <Commercial input={input} d={d} onSaved={onSaved} />
      )}{" "}
      {d.role === "COO_EXECUTIVE" && (
        <Panel title={t("workTypes")}>
          {d.workTypes.map((w) => (
            <StandardEditor
              key={w.id}
              input={input}
              standard={w}
              onSaved={onSaved}
            />
          ))}
        </Panel>
      )}
      {d.isItAdmin && (
        <Link
          className="inline-flex rounded-lg bg-teal-700 px-4 py-3 text-sm text-white"
          href={`/pulse/admin?organizationId=${input.organizationId}`}
        >
          {t("imports")}
        </Link>
      )}
    </div>
  );
}

function Commercial({
  input,
  d,
  onSaved,
}: {
  input: Scope;
  d: Dashboard;
  onSaved: () => unknown;
}) {
  const t = usePulseText(),
    trpc = useTRPC();
  const q = useQuery(trpc.pulse.commercial.queryOptions(input));
  const [fields, setFields] = useState({
    externalId: "",
    occurredAt: new Date().toISOString(),
    pricingModel: "PER_UNIT" as "PER_UNIT" | "FTE" | "HYBRID",
    ratePerUnit: 0,
    monthlyBaseFee: 0,
    ratePerFteMonthly: 0,
    effectiveFrom: new Date().toISOString(),
    effectiveTo: new Date(Date.now() + 365 * 86400000).toISOString(),
    targetSla: d.account.targetSla,
    penaltyMax: 0,
  });
  const save = useMutation(
    trpc.pulse.contract.mutationOptions({
      onSuccess: () => {
        q.refetch();
        onSaved();
      },
    }),
  );
  return (
    <Panel title={t("CONTRACT")}>
      <Table
        headers={[
          t("externalId"),
          t("pricingModel"),
          t("ratePerUnit"),
          t("effectiveFrom"),
          t("effectiveTo"),
        ]}
        rows={(q.data || []).map((r) => [
          r.externalId,
          String(r.payload.pricingModel),
          String(r.payload.ratePerUnit),
          String(r.payload.effectiveFrom).slice(0, 10),
          String(r.payload.effectiveTo).slice(0, 10),
        ])}
      />
      {d.role === "COO_EXECUTIVE" && (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({ ...input, payload: fields });
          }}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={t("externalId")}>
              <Input
                required
                value={fields.externalId}
                onChange={(e) =>
                  setFields({ ...fields, externalId: e.target.value })
                }
              />
            </Field>
            <Field label={t("pricingModel")}>
              <select
                className={selectClass}
                value={fields.pricingModel}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    pricingModel: e.target.value as typeof fields.pricingModel,
                  })
                }
              >
                {["PER_UNIT", "FTE", "HYBRID"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            {(
              [
                "ratePerUnit",
                "monthlyBaseFee",
                "ratePerFteMonthly",
                "targetSla",
                "penaltyMax",
              ] as const
            ).map((k) => (
              <Field key={k} label={t(k)}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={fields[k]}
                  onChange={(e) =>
                    setFields({ ...fields, [k]: Number(e.target.value) })
                  }
                />
              </Field>
            ))}
            {(["effectiveFrom", "effectiveTo"] as const).map((k) => (
              <Field key={k} label={t(k)}>
                <Input
                  type="datetime-local"
                  required
                  value={fields[k].slice(0, 16)}
                  onChange={(e) =>
                    setFields({
                      ...fields,
                      [k]: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </Field>
            ))}
          </div>
          {save.error && <Notice error>{save.error.message}</Notice>}
          <Button disabled={save.isPending}>{t("save")}</Button>
        </form>
      )}
    </Panel>
  );
}
function StandardEditor({
  input,
  standard,
  onSaved,
}: {
  input: Scope;
  standard: Dashboard["workTypes"][number];
  onSaved: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText(),
    [weight, setWeight] = useState(standard.complexity),
    [minutes, setMinutes] = useState(standard.standardMinutes);
  const save = useMutation(
    trpc.pulse.standard.mutationOptions({ onSuccess: onSaved }),
  );
  return (
    <form
      className="space-y-3 border-b border-slate-200 py-4 last:border-0"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({
          ...input,
          payload: {
            externalId: standard.externalId,
            name: standard.name,
            processId: standard.processId,
            standardMinutes: minutes,
            complexity: weight,
            slaHours: standard.slaHours,
            requiredSkill: standard.requiredSkill || undefined,
            automationEligible: standard.automationEligible,
          },
        });
      }}
    >
      <h3 className="text-sm font-semibold">{standard.name}</h3>
      <div className="grid items-end gap-3 sm:grid-cols-3">
        <Field label={t("complexity")}>
          <Input
            type="number"
            min={0.1}
            max={10}
            step="0.05"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </Field>
        <Field label={t("standardMinutes")}>
          <Input
            type="number"
            min={0.1}
            max={10000}
            step="0.1"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </Field>
        <Button disabled={save.isPending}>{t("save")}</Button>
      </div>
      {save.error && <Notice error>{save.error.message}</Notice>}
    </form>
  );
}
