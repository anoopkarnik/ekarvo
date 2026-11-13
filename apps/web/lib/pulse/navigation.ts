export const pulseSuites = [
  "command",
  "decision",
  "plan",
  "perform",
  "develop",
  "actions",
  "config",
] as const;
export const pulseAdminSections = [
  "members",
  "clients",
  "structure",
  "imports",
  "mapping",
] as const;
export type PulseSuite = (typeof pulseSuites)[number];
export type PulseAdminSection = (typeof pulseAdminSections)[number];
export const selectedSuite = (value: string | null): PulseSuite =>
  pulseSuites.includes(value as PulseSuite) ? (value as PulseSuite) : "command";
export const selectedAdminSection = (
  value: string | null,
): PulseAdminSection =>
  pulseAdminSections.includes(value as PulseAdminSection)
    ? (value as PulseAdminSection)
    : "members";
export function selectPulseOrganization<T extends { id: string }>(
  organizations: T[],
  activeId: string | null,
) {
  return organizations.find((o) => o.id === activeId);
}
