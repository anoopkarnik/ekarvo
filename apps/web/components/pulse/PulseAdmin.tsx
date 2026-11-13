"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  selectedAdminSection,
  type PulseAdminSection,
} from "@/lib/pulse/navigation";
import { usePulseWorkspace } from "./usePulseWorkspace";
import { useTRPC } from "@/trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { templateColumns } from "@/lib/pulse/csv";
import type { ImportKind } from "@/lib/pulse/schemas";
import type { AccountGrant, PulseRole } from "@/lib/pulse/policy";
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
type Administration = inferRouterOutputs<AppRouter>["pulse"]["administration"];
export default function PulseAdmin() {
  const t = usePulseText(),
    router = useRouter();
  const { data, organization: org, error, loading } = usePulseWorkspace();
  useEffect(() => {
    if (org && !org.isItAdmin && !org.suspended && org.accounts.length)
      router.replace("/pulse");
  }, [org, router]);
  if (error) return <Notice error>{error.message}</Notice>;
  if (loading || !data) return <Notice>{t("loading")}</Notice>;
  if (!org?.isItAdmin || org.suspended)
    return <Notice error>{t("noAccess")}</Notice>;
  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-5 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("admin")}</h1>
      </div>
      <AdministrationView key={org.id} organizationId={org.id} />
    </div>
  );
}
function AdministrationView({ organizationId }: { organizationId: string }) {
  const trpc = useTRPC(),
    cache = useQueryClient(),
    t = usePulseText();
  const q = useQuery(
    trpc.pulse.administration.queryOptions({ organizationId }),
  );
  const params = useSearchParams(),
    router = useRouter();
  const tab = selectedAdminSection(params.get("tab"));
  const setTab = (value: PulseAdminSection) => {
    const next = new URLSearchParams(params.toString());
    next.set("tab", value);
    router.push(`/pulse/admin?${next}`, { scroll: false });
  };
  const [selected, setSelected] = useState("");
  const refresh = () =>
    cache.invalidateQueries({ queryKey: trpc.pulse.pathKey() });
  if (q.error) return <Notice error>{q.error.message}</Notice>;
  if (!q.data) return <Notice>{t("loading")}</Notice>;
  const d = q.data,
    accountId =
      d.accounts.find((a) => a.id === selected)?.id || d.accounts[0]?.id || "";
  return (
    <>
      {tab === "clients" ? (
        <Clients organizationId={organizationId} d={d} refresh={refresh} />
      ) : (
        <>
          {tab !== "members" && (
            <Field label={t("client")}>
              <select
                className={selectClass}
                value={accountId}
                onChange={(e) => setSelected(e.target.value)}
              >
                {d.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {!accountId ? (
            <Notice>
              <p>{t("createClientFirst")}</p>
              <Button
                type="button"
                variant="link"
                onClick={() => setTab("clients")}
              >
                {t("clients")}
              </Button>
            </Notice>
          ) : tab === "members" ? (
            <Members organizationId={organizationId} d={d} refresh={refresh} />
          ) : tab === "structure" ? (
            <Structure
              key={accountId}
              organizationId={organizationId}
              accountId={accountId}
              d={d}
              refresh={refresh}
            />
          ) : tab === "imports" ? (
            <Imports
              organizationId={organizationId}
              accountId={accountId}
              d={d}
              refresh={refresh}
            />
          ) : (
            <Mapping
              organizationId={organizationId}
              accountId={accountId}
              d={d}
              refresh={refresh}
            />
          )}
        </>
      )}
    </>
  );
}
function Clients({
  organizationId,
  d,
  refresh,
}: {
  organizationId: string;
  d: Administration;
  refresh: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText();
  const save = useMutation(
    trpc.pulse.client.mutationOptions({ onSuccess: refresh }),
  );
  const [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [vertical, setVertical] = useState<
      "HEALTHCARE_RCM" | "FINANCE_ACCOUNTING" | "INSURANCE"
    >("HEALTHCARE_RCM");
  return (
    <Panel title={t("clients")}>
      <form
        className="mb-5 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            organizationId,
            name,
            code,
            vertical,
            archived: false,
          });
        }}
      >
        <Field label={t("name")}>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t("code")}>
          <Input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <Field label={t("vertical")}>
          <select
            className={selectClass}
            value={vertical}
            onChange={(e) => setVertical(e.target.value as typeof vertical)}
          >
            {["HEALTHCARE_RCM", "FINANCE_ACCOUNTING", "INSURANCE"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Button disabled={save.isPending}>{t("save")}</Button>
      </form>
      {save.error && <Notice error>{save.error.message}</Notice>}
      <Table
        headers={[t("name"), t("code"), t("vertical"), t("status")]}
        rows={d.accounts.map((a) => [
          a.name,
          a.code,
          a.vertical,
          <Button
            key={a.id}
            variant="outline"
            disabled={save.isPending}
            onClick={() =>
              save.mutate({
                organizationId,
                id: a.id,
                name: a.name,
                code: a.code,
                vertical: a.vertical as typeof vertical,
                archived: !a.archived,
              })
            }
          >
            {t(a.archived ? "resume" : "archive")}
          </Button>,
        ])}
      />
    </Panel>
  );
}
function Members({
  organizationId,
  d,
  refresh,
}: {
  organizationId: string;
  d: Administration;
  refresh: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText();
  const [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    [password, setPassword] = useState(""),
    [mode, setMode] = useState<"CREATE_LOGIN" | "INVITE">("CREATE_LOGIN"),
    [created, setCreated] = useState(false),
    [memberId, setMember] = useState(""),
    [grants, setGrants] = useState<AccountGrant[]>([]);
  const invite = useMutation(
      trpc.pulse.invite.mutationOptions({ onSuccess: refresh }),
    ),
    update = useMutation(
      trpc.pulse.member.mutationOptions({ onSuccess: refresh }),
    ),
    revoke = useMutation(
      trpc.pulse.revokeInvitation.mutationOptions({ onSuccess: refresh }),
    );
  const create = useMutation(
    trpc.pulse.createUser.mutationOptions({
      onSuccess: () => {
        setPassword("");
        setName("");
        setEmail("");
        setGrants([]);
        setCreated(true);
        create.reset();
        refresh();
      },
    }),
  );
  return (
    <div className="space-y-5">
      <Panel title={t("members")}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setCreated(false);
            if (memberId) update.mutate({ organizationId, memberId, grants });
            else if (mode === "CREATE_LOGIN")
              create.mutate({ organizationId, name, email, password, grants });
            else invite.mutate({ organizationId, email, grants });
          }}
        >
          {memberId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMember("");
                setEmail("");
                setGrants([]);
              }}
            >
              {t("cancel")}
            </Button>
          ) : (
            <>
              <Field label={t("accountMethod")}>
                <select
                  className={selectClass}
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value as typeof mode);
                    setPassword("");
                    create.reset();
                    invite.reset();
                  }}
                >
                  <option value="CREATE_LOGIN">{t("createUser")}</option>
                  <option value="INVITE">{t("inviteExisting")}</option>
                </select>
              </Field>
              {mode === "CREATE_LOGIN" && (
                <Field label={t("name")}>
                  <Input
                    required
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                  />
                </Field>
              )}
              <Field label={t("email")}>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              {mode === "CREATE_LOGIN" && (
                <Field label={t("initialPassword")}>
                  <Input
                    required
                    type="password"
                    minLength={8}
                    maxLength={50}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              )}
            </>
          )}
          {grants.map((g, i) => (
            <div
              key={i}
              className="grid items-start gap-3 rounded-lg border bg-slate-50 p-4 md:grid-cols-4"
            >
              <Field label={t("client")}>
                <select
                  className={selectClass}
                  value={g.accountId}
                  onChange={(e) =>
                    setGrants(
                      grants.map((v, j) =>
                        i === j
                          ? { ...v, accountId: e.target.value, teamIds: [] }
                          : v,
                      ),
                    )
                  }
                >
                  {d.accounts
                    .filter((a) => !a.archived)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label={t("role")}>
                <select
                  className={selectClass}
                  value={g.role}
                  onChange={(e) =>
                    setGrants(
                      grants.map((v, j) =>
                        i === j
                          ? {
                              ...v,
                              role: e.target.value as PulseRole,
                              teamIds: [],
                            }
                          : v,
                      ),
                    )
                  }
                >
                  {["COO_EXECUTIVE", "OPS_MANAGER", "TEAM_LEAD"].map((r) => (
                    <option key={r} value={r}>
                      {t(r)}
                    </option>
                  ))}
                </select>
              </Field>
              {g.role === "TEAM_LEAD" ? (
                <Field label={t("team")}>
                  <select
                    multiple
                    required
                    className={selectClass}
                    value={g.teamIds}
                    onChange={(e) =>
                      setGrants(
                        grants.map((v, j) =>
                          i === j
                            ? {
                                ...v,
                                teamIds: [...e.target.selectedOptions].map(
                                  (o) => o.value,
                                ),
                              }
                            : v,
                        ),
                      )
                    }
                  >
                    {d.teams
                      .filter((tm) => tm.accountId === g.accountId)
                      .map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name}
                        </option>
                      ))}
                  </select>
                </Field>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setGrants(grants.filter((_, j) => i !== j))}
              >
                {t("remove")}
              </Button>
            </div>
          ))}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const next = d.accounts.find(
                  (a) =>
                    !a.archived && !grants.some((g) => g.accountId === a.id),
                );
                if (next)
                  setGrants([
                    ...grants,
                    { accountId: next.id, role: "OPS_MANAGER", teamIds: [] },
                  ]);
              }}
            >
              {t("addAssignment")}
            </Button>
            <Button
              disabled={
                invite.isPending ||
                create.isPending ||
                update.isPending ||
                (!memberId && !grants.length)
              }
            >
              {t(
                memberId
                  ? "save"
                  : mode === "CREATE_LOGIN"
                    ? "createUser"
                    : "invite",
              )}
            </Button>
          </div>
          {created && <Notice>{t("userCreated")}</Notice>}
          {(create.error || invite.error || update.error || revoke.error) && (
            <Notice error>
              {create.error?.message ||
                invite.error?.message ||
                update.error?.message ||
                revoke.error?.message}
            </Notice>
          )}
        </form>
        <div className="mt-5">
          <Table
            headers={[t("name"), t("email"), t("role"), t("edit")]}
            rows={d.members.map((m) => [
              m.user.name,
              m.user.email,
              [
                ...(m.bpoAdmin ? [t("itAdmin")] : []),
                ...m.pulseGrants.map(
                  (g) =>
                    `${d.accounts.find((a) => a.id === g.accountId)?.name}: ${t(g.role)}`,
                ),
              ].join(" · "),
              <Button
                key={m.id}
                variant="outline"
                disabled={!!m.bpoAdmin}
                onClick={() => {
                  setMember(m.id);
                  setEmail(m.user.email);
                  setGrants(
                    m.pulseGrants.map((g) => ({
                      accountId: g.accountId,
                      role: g.role,
                      teamIds: g.teams.map((tm) => tm.teamId),
                    })),
                  );
                }}
              >
                {t("edit")}
              </Button>,
            ])}
          />
        </div>
      </Panel>
      <Panel title={t("invite")}>
        <Table
          headers={[t("email"), t("role"), t("status")]}
          rows={d.invitations.map((i) => [
            i.email,
            i.bpoAdminInvite
              ? t("itAdmin")
              : i.pulseGrants.map((g) => t(g.role)).join(", "),
            !i.bpoAdminInvite && (
              <Button
                variant="outline"
                onClick={() => revoke.mutate({ organizationId, id: i.id })}
              >
                {t("revoke")}
              </Button>
            ),
          ])}
        />
      </Panel>
    </div>
  );
}
function Structure({
  organizationId,
  accountId,
  d,
  refresh,
}: {
  organizationId: string;
  accountId: string;
  d: Administration;
  refresh: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText();
  const [kind, setKind] = useState<
      "SITE" | "PROCESS" | "TEAM" | "WORKER" | "WORK_TYPE"
    >("SITE"),
    [values, setValues] = useState<Record<string, unknown>>({});
  const save = useMutation(
    trpc.pulse.master.mutationOptions({ onSuccess: refresh }),
  );
  const reference = (key: string) =>
    key === "processId"
      ? d.processes.filter((v) => v.accountId === accountId)
      : key === "siteId"
        ? d.sites.filter((v) => v.accountId === accountId)
        : key === "teamId"
          ? d.teams.filter((v) => v.accountId === accountId)
          : null;
  return (
    <Panel title={t("structure")}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ organizationId, accountId, kind, payload: values });
        }}
      >
        <Field label={t("kind")}>
          <select
            className={selectClass}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as typeof kind);
              setValues({});
            }}
          >
            {["SITE", "PROCESS", "TEAM", "WORKER", "WORK_TYPE"].map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-3 md:grid-cols-3">
          {templateColumns[kind].map((key) => {
            const options = reference(key);
            return (
              <Field key={key} label={t(key)}>
                {options ? (
                  <select
                    className={selectClass}
                    value={String(values[key] || "")}
                    required={key !== "siteId"}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [key]: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">—</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={String(values[key] ?? "")}
                    required={[
                      "externalId",
                      "name",
                      "hourlyRate",
                      "standardMinutes",
                    ].includes(key)}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [key]: e.target.value || undefined,
                      })
                    }
                  />
                )}
              </Field>
            );
          })}
        </div>
        {save.error && <Notice error>{save.error.message}</Notice>}
        <Button disabled={save.isPending}>{t("save")}</Button>
      </form>
      <div className="mt-5">
        <Table
          headers={[t("kind"), t("externalId"), t("name")]}
          rows={[
            ...d.sites.map((v) => ({ ...v, kind: "SITE" })),
            ...d.processes.map((v) => ({ ...v, kind: "PROCESS" })),
            ...d.teams.map((v) => ({ ...v, kind: "TEAM" })),
            ...d.workers.map((v) => ({ ...v, kind: "WORKER" })),
            ...d.workTypes.map((v) => ({ ...v, kind: "WORK_TYPE" })),
          ]
            .filter((v) => v.accountId === accountId)
            .map((v) => [t(v.kind), v.externalId, v.name])}
        />
      </div>
    </Panel>
  );
}
function Imports({
  organizationId,
  accountId,
  d,
  refresh,
}: {
  organizationId: string;
  accountId: string;
  d: Administration;
  refresh: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText();
  const [kind, setKind] = useState<ImportKind>("WORK_ITEM"),
    [source, setSource] = useState("csv"),
    [mappingId, setMapping] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const commit = useMutation(
    trpc.pulse.commitImport.mutationOptions({ onSuccess: refresh }),
  );
  return (
    <Panel title={t("imports")}>
      <p className="mb-4 text-sm text-slate-500">{t("importHelp")}</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(e.currentTarget);
          form.set("organizationId", organizationId);
          form.set("accountId", accountId);
          if (!mappingId) form.delete("mappingId");
          try {
            const response = await fetch("/api/pulse/imports", {
              method: "POST",
              body: form,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            await refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={t("kind")}>
            <select
              className={selectClass}
              name="kind"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as ImportKind);
                setMapping("");
              }}
            >
              {Object.keys(templateColumns).map((k) => (
                <option key={k} value={k}>
                  {t(k)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("source")}>
            <Input
              name="source"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </Field>
          <Field label={t("mapping")}>
            <select
              className={selectClass}
              name="mappingId"
              value={mappingId}
              onChange={(e) => setMapping(e.target.value)}
            >
              <option value="">—</option>
              {d.mappings
                .filter((m) => m.accountId === accountId && m.kind === kind)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={t("file")}>
            <Input name="file" type="file" accept=".csv,text/csv" required />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button disabled={busy}>{t("stage")}</Button>
          <a
            className="text-sm text-teal-700 underline"
            href={`/api/pulse/imports?organizationId=${encodeURIComponent(organizationId)}&kind=${kind}`}
          >
            {t("template")}
          </a>
        </div>
        {(error || commit.error) && (
          <Notice error>{error || commit.error?.message}</Notice>
        )}
      </form>
      <div className="mt-5">
        <Table
          headers={[t("date"), t("kind"), t("rows"), t("status"), t("actions")]}
          rows={d.imports
            .filter((b) => b.accountId === accountId)
            .map((b) => [
              String(b.createdAt).slice(0, 16),
              t(b.kind),
              b.rowCount,
              b.status,
              <div key={b.id} className="flex gap-2">
                {["VALIDATED", "QUEUED"].includes(b.status) && (
                  <Button
                    disabled={commit.isPending}
                    onClick={() => commit.mutate({ organizationId, id: b.id })}
                  >
                    {t("publish")}
                  </Button>
                )}
                {b.errorCount > 0 && (
                  <a
                    className="text-teal-700 underline"
                    href={`/api/pulse/imports?organizationId=${encodeURIComponent(organizationId)}&batchId=${b.id}`}
                  >
                    {t("errors")}
                  </a>
                )}
              </div>,
            ])}
        />
      </div>
    </Panel>
  );
}
function Mapping({
  organizationId,
  accountId,
  d,
  refresh,
}: {
  organizationId: string;
  accountId: string;
  d: Administration;
  refresh: () => unknown;
}) {
  const trpc = useTRPC(),
    t = usePulseText(),
    [name, setName] = useState(""),
    [kind, setKind] = useState<ImportKind>("WORK_ITEM"),
    [fields, setFields] = useState([{ source: "", target: "externalId" }]);
  const save = useMutation(
    trpc.pulse.mapping.mutationOptions({ onSuccess: refresh }),
  );
  return (
    <Panel title={t("mapping")}>
      <Notice>{t("unconnected")}</Notice>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            organizationId,
            accountId,
            name,
            kind,
            fields: Object.fromEntries(
              fields.filter((f) => f.source).map((f) => [f.source, f.target]),
            ),
          });
        }}
      >
        <Field label={t("name")}>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t("kind")}>
          <select
            className={selectClass}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as ImportKind);
              setFields([{ source: "", target: "externalId" }]);
            }}
          >
            {Object.keys(templateColumns).map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </Field>
        {fields.map((f, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <Field label={t("sourceField")}>
              <Input
                value={f.source}
                onChange={(e) =>
                  setFields(
                    fields.map((v, j) =>
                      i === j ? { ...v, source: e.target.value } : v,
                    ),
                  )
                }
              />
            </Field>
            <Field label={t("canonicalField")}>
              <select
                className={selectClass}
                value={f.target}
                onChange={(e) =>
                  setFields(
                    fields.map((v, j) =>
                      i === j ? { ...v, target: e.target.value } : v,
                    ),
                  )
                }
              >
                {templateColumns[kind].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        ))}
        <Button
          variant="outline"
          type="button"
          onClick={() =>
            setFields([...fields, { source: "", target: "externalId" }])
          }
        >
          {t("addMapping")}
        </Button>
        <Button disabled={save.isPending}>{t("save")}</Button>
        {save.error && <Notice error>{save.error.message}</Notice>}
      </form>
      <div className="mt-4">
        <Table
          headers={[t("name"), t("kind"), t("status")]}
          rows={d.mappings
            .filter((m) => m.accountId === accountId)
            .map((m) => [m.name, t(m.kind), t("unconnected")])}
        />
      </div>
    </Panel>
  );
}
