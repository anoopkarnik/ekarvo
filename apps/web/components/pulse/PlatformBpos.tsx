"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button, Field, Input, Notice, Panel, Table, usePulseText } from "./ui";
export default function PlatformBpos() {
  const trpc = useTRPC(),
    cache = useQueryClient(),
    t = usePulseText(),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [mode, setMode] = useState<"CREATE_LOGIN" | "INVITE">("CREATE_LOGIN"),
    [staffName, setStaffName] = useState(""),
    [password, setPassword] = useState(""),
    [saved, setSaved] = useState(false),
    [appointmentModes, setAppointmentModes] = useState<
      Record<string, "CREATE_LOGIN" | "INVITE">
    >({}),
    [timezone, setTimezone] = useState("Asia/Kolkata");
  const refresh = () =>
    cache.invalidateQueries({ queryKey: trpc.adminBpo.pathKey() });
  const cancelInvite = useMutation(
    trpc.adminBpo.cancelInvitation.mutationOptions({ onSuccess: refresh }),
  );
  const q = useQuery(trpc.adminBpo.list.queryOptions());
  const provision = useMutation(
      trpc.adminBpo.provision.mutationOptions({
        onSuccess: () => {
          setSaved(true);
          setPassword("");
          provision.reset();
          refresh();
        },
      }),
    ),
    suspend = useMutation(
      trpc.adminBpo.suspend.mutationOptions({ onSuccess: refresh }),
    ),
    appoint = useMutation(
      trpc.adminBpo.appoint.mutationOptions({
        onSuccess: () => {
          setSaved(true);
          appoint.reset();
          refresh();
        },
      }),
    ),
    revoke = useMutation(
      trpc.adminBpo.revokeAdmin.mutationOptions({ onSuccess: refresh }),
    );
  if (q.error)
    return (
      <div className="p-5">
        <Notice error>{q.error.message}</Notice>
      </div>
    );
  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-5 text-slate-900">
      <h1 className="text-2xl font-semibold">{t("platform")}</h1>
      <Panel title={t("provision")}>
        <form
          className="grid items-end gap-4 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            provision.mutate({
              name,
              email,
              timezone,
              mode,
              ...(mode === "CREATE_LOGIN" ? { staffName, password } : {}),
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
          <Field label={t("accountMethod")}>
            <select
              className="rounded-md border border-slate-300 bg-white p-2 text-sm"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as typeof mode);
                setPassword("");
              }}
            >
              <option value="CREATE_LOGIN">{t("createItAdmin")}</option>
              <option value="INVITE">{t("invite")}</option>
            </select>
          </Field>
          {mode === "CREATE_LOGIN" && (
            <Field label={t("staffName")}>
              <Input
                required
                maxLength={50}
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </Field>
          )}
          <Field label={`${t("itAdmin")} · ${t("email")}`}>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {mode === "CREATE_LOGIN" && (
            <Field label={t("initialPassword")}>
              <Input
                type="password"
                required
                minLength={8}
                maxLength={50}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          )}
          <Field label={t("timezone")}>
            <Input
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </Field>
          <Button disabled={provision.isPending}>{t("provision")}</Button>
        </form>
        {saved && <Notice>{t("saved")}</Notice>}
      </Panel>
      {[
        q.error,
        provision.error,
        suspend.error,
        appoint.error,
        revoke.error,
        cancelInvite.error,
      ]
        .filter(Boolean)
        .map((e, i) => (
          <Notice key={i} error>
            {e!.message}
          </Notice>
        ))}
      {!q.data ? (
        <Notice>{t("loading")}</Notice>
      ) : (
        q.data.map((bpo) => (
          <Panel
            key={bpo.organizationId}
            title={bpo.organization.name}
            action={
              <Button
                variant="outline"
                disabled={suspend.isPending}
                onClick={() =>
                  suspend.mutate({
                    organizationId: bpo.organizationId,
                    suspended: !bpo.suspended,
                  })
                }
              >
                {t(bpo.suspended ? "resume" : "suspend")}
              </Button>
            }
          >
            <Table
              headers={[t("itAdmin"), t("email"), t("actions")]}
              rows={bpo.admins.map((a) => [
                a.member.user.name,
                a.member.user.email,
                <Button
                  key={a.memberId}
                  variant="outline"
                  onClick={() =>
                    revoke.mutate({
                      organizationId: bpo.organizationId,
                      memberId: a.memberId,
                    })
                  }
                >
                  {t("revoke")}
                </Button>,
              ])}
            />
            <div className="mt-4">
              <Table
                headers={[t("invite"), t("email"), t("actions")]}
                rows={bpo.organization.invitations.map((i) => [
                  t("itAdmin"),
                  i.email,
                  <Button
                    key={i.id}
                    variant="outline"
                    disabled={cancelInvite.isPending}
                    onClick={() =>
                      cancelInvite.mutate({
                        organizationId: bpo.organizationId,
                        id: i.id,
                      })
                    }
                  >
                    {t("revoke")}
                  </Button>,
                ])}
              />
            </div>
            <form
              className="mt-4 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const element = e.currentTarget;
                appoint.mutate(
                  {
                    organizationId: bpo.organizationId,
                    email: String(form.get("email")),
                    mode: form.get("mode") as "CREATE_LOGIN" | "INVITE",
                    ...(form.get("mode") === "CREATE_LOGIN"
                      ? {
                          staffName: String(form.get("staffName")),
                          password: String(form.get("password")),
                        }
                      : {}),
                  },
                  { onSuccess: () => element.reset() },
                );
              }}
            >
              <Field label={t("accountMethod")}>
                <select
                  name="mode"
                  className="rounded-md border border-slate-300 bg-white p-2 text-sm"
                  value={appointmentModes[bpo.organizationId] || "CREATE_LOGIN"}
                  onChange={(e) =>
                    setAppointmentModes({
                      ...appointmentModes,
                      [bpo.organizationId]: e.target.value as
                        | "CREATE_LOGIN"
                        | "INVITE",
                    })
                  }
                >
                  <option value="CREATE_LOGIN">{t("createItAdmin")}</option>
                  <option value="INVITE">{t("invite")}</option>
                </select>
              </Field>
              {appointmentModes[bpo.organizationId] !== "INVITE" && (
                <Field label={t("staffName")}>
                  <Input name="staffName" required maxLength={50} />
                </Field>
              )}
              <Field label={`${t("itAdmin")} · ${t("email")}`}>
                <Input name="email" required type="email" />
              </Field>
              {appointmentModes[bpo.organizationId] !== "INVITE" && (
                <Field label={t("initialPassword")}>
                  <Input
                    name="password"
                    type="password"
                    minLength={8}
                    maxLength={50}
                    autoComplete="new-password"
                    required
                  />
                </Field>
              )}
              <Button disabled={appoint.isPending}>
                {t(
                  appointmentModes[bpo.organizationId] === "INVITE"
                    ? "invite"
                    : "createItAdmin",
                )}
              </Button>
            </form>
          </Panel>
        ))
      )}
    </div>
  );
}
