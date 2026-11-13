import { describe, expect, it } from "vitest";
import {
  authorizeAccount,
  canTransition,
  redactFinancials,
  overtimeLimit,
} from "./policy";

describe("Pulse authorization boundaries", () => {
  const grants = [
    { accountId: "a", role: "TEAM_LEAD" as const, teamIds: ["t"] },
  ];
  it("rejects unassigned clients and teams without falling back to a broader scope", () => {
    expect(() => authorizeAccount(grants, "b")).toThrow();
    expect(() => authorizeAccount(grants, "a", ["other"])).toThrow();
    expect(authorizeAccount(grants, "a").teamIds).toEqual(["t"]);
  });
  it("removes commercial fields rather than returning hidden client values", () => {
    expect(
      redactFinancials(
        { arrivals: 5, finance: { revenue: 100 }, laborCost: 50 },
        "TEAM_LEAD",
      ),
    ).toEqual({ arrivals: 5 });
  });
  it("enforces role-specific overtime limits and lifecycle transitions", () => {
    expect(
      ["TEAM_LEAD", "OPS_MANAGER", "COO_EXECUTIVE"].map((r) =>
        overtimeLimit(r),
      ),
    ).toEqual([40, 140, 220]);
    expect(canTransition("PROPOSED", "VERIFIED", "COO_EXECUTIVE", true)).toBe(
      false,
    );
    expect(canTransition("COMPLETED", "VERIFIED", "TEAM_LEAD", true)).toBe(
      false,
    );
    expect(canTransition("COMPLETED", "VERIFIED", "OPS_MANAGER", true)).toBe(
      true,
    );
    expect(canTransition("APPROVED", "IN_PROGRESS", "TEAM_LEAD", false)).toBe(
      false,
    );
  });
});
