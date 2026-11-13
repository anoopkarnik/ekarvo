import type { PulseRole } from "./generated/prisma/client";
export type DemoGrant = {
  accountId: string;
  role: PulseRole;
  teamIds: string[];
};
export type DemoUser = {
  id: string;
  key: string;
  name: string;
  email: string;
  isItAdmin: boolean;
  grants: DemoGrant[];
};
export function buildPulseDemoUsers(
  organizationId: string,
  inputAccounts: { id: string; code: string }[],
  inputTeams: { id: string; accountId: string }[],
): DemoUser[] {
  const accounts = [...inputAccounts].sort((a, b) =>
    a.code.localeCompare(b.code, "en", { numeric: true }),
  );
  const teams = [...inputTeams].sort(
    (a, b) =>
      accounts.findIndex((v) => v.id === a.accountId) -
        accounts.findIndex((v) => v.id === b.accountId) ||
      a.id.localeCompare(b.id),
  );
  if (
    accounts.length !== 6 ||
    teams.length !== 12 ||
    accounts.some((a) => teams.filter((t) => t.accountId === a.id).length !== 2)
  )
    throw new Error(
      "Demo staff require six reference clients with two teams each.",
    );
  const user = (
    key: string,
    name: string,
    grants: DemoGrant[],
    isItAdmin = false,
  ): DemoUser => ({
    id: `${organizationId}:demo-user:${key}`,
    key,
    name,
    email: `${key}@pulse-demo.test`,
    isItAdmin,
    grants,
  });
  const grant = (
    accountId: string,
    role: PulseRole,
    teamIds: string[] = [],
  ): DemoGrant => ({ accountId, role, teamIds });
  return [
    user("itadmin", "Demo IT Admin", [], true),
    user(
      "coo",
      "Demo COO",
      accounts.map((a) => grant(a.id, "COO_EXECUTIVE")),
    ),
    ...[0, 1].map((i) =>
      user(
        `manager${i + 1}`,
        `Demo Operations Manager ${i + 1}`,
        accounts.slice(i * 3, i * 3 + 3).map((a) => grant(a.id, "OPS_MANAGER")),
      ),
    ),
    ...teams.map((t, i) =>
      user(
        `teamlead${String(i + 1).padStart(2, "0")}`,
        `Demo Team Lead ${i + 1}`,
        [grant(t.accountId, "TEAM_LEAD", [t.id])],
      ),
    ),
  ];
}
