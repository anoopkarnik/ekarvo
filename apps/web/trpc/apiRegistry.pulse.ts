import type { ApiGroup } from "./apiRegistry.types";
export const PULSE_API_GROUPS: ApiGroup[] = [
  {
    group: "pulse",
    label: "Pulse operations",
    calls: [
      ...[
        "bootstrap",
        "dashboard",
        "portfolio",
        "donors",
        "commercial",
        "audit",
        "scenarios",
        "administration",
      ].map((name) => ({
        name,
        type: "query" as const,
        access: "authenticated" as const,
      })),
      ...[
        "contract",
        "standard",
        "saveScenario",
        "propose",
        "transition",
        "activity",
        "configure",
        "client",
        "invite",
        "createUser",
        "member",
        "revokeInvitation",
        "master",
        "mapping",
        "commitImport",
      ].map((name) => ({
        name,
        type: "mutation" as const,
        access: "authenticated" as const,
      })),
    ],
  },
  {
    group: "adminBpo",
    label: "BPO provisioning",
    calls: [
      { name: "list", type: "query", access: "admin" },
      ...[
        "provision",
        "appoint",
        "suspend",
        "cancelInvitation",
        "revokeAdmin",
      ].map((name) => ({
        name,
        type: "mutation" as const,
        access: "admin" as const,
      })),
    ],
  },
];
