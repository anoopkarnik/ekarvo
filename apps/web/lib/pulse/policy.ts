export const PULSE_ROLES = [
  "COO_EXECUTIVE",
  "OPS_MANAGER",
  "TEAM_LEAD",
] as const;
export type PulseRole = (typeof PULSE_ROLES)[number];
export type AccountGrant = {
  accountId: string;
  role: PulseRole;
  teamIds: string[];
};
export function authorizeAccount(
  grants: AccountGrant[],
  accountId: string,
  requestedTeams?: string[],
) {
  const grant = grants.find((g) => g.accountId === accountId);
  if (
    !grant ||
    (grant.role === "TEAM_LEAD" &&
      (!grant.teamIds.length ||
        requestedTeams?.some((t) => !grant.teamIds.includes(t))))
  )
    throw new Error("Account or team access denied");
  return {
    ...grant,
    teamIds:
      grant.role === "TEAM_LEAD"
        ? requestedTeams?.length
          ? requestedTeams
          : grant.teamIds
        : (requestedTeams ?? []),
  };
}
export const hasFinancials = (role: string) =>
  role === "COO_EXECUTIVE" || role === "OPS_MANAGER";
export const overtimeLimit = (role: string) =>
  role === "COO_EXECUTIVE"
    ? 220
    : role === "OPS_MANAGER"
      ? 140
      : role === "TEAM_LEAD"
        ? 40
        : 0;
export function redactFinancials<T extends Record<string, unknown>>(
  value: T,
  role: string,
) {
  if (hasFinancials(role)) return value;
  const safe = { ...value };
  delete safe.finance;
  delete safe.laborCost;
  return safe;
}
export function canTransition(
  from: string,
  to: string,
  role: string,
  isOwner: boolean,
) {
  if (!PULSE_ROLES.includes(role as PulseRole)) return false;
  if (from === "PROPOSED")
    return ["APPROVED", "REJECTED", "CANCELLED"].includes(to);
  if (from === "APPROVED")
    return to === "CANCELLED" || (to === "IN_PROGRESS" && isOwner);
  if (from === "IN_PROGRESS")
    return to === "CANCELLED" || (to === "COMPLETED" && isOwner);
  return from === "COMPLETED" && to === "VERIFIED" && hasFinancials(role);
}
