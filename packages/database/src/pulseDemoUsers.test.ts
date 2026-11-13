import { expect, it } from "vitest";
import { buildPulseDemoUsers } from "./pulseDemoUsers";
const accounts = Array.from({ length: 6 }, (_, i) => ({
  id: `client${i}`,
  code: `PULSE-${i + 1}`,
}));
const teams = accounts.flatMap((a) =>
  [0, 1].map((i) => ({ id: `${a.id}-team${i}`, accountId: a.id })),
);
it("defines sixteen separate staff logins, disjoint manager clients and exactly one lead per team", () => {
  const users = buildPulseDemoUsers("bpo", accounts, teams);
  expect(users).toHaveLength(16);
  expect(new Set(users.map((u) => u.email)).size).toBe(16);
  expect(users.filter((u) => u.isItAdmin)).toHaveLength(1);
  expect(users[0]!.grants).toEqual([]);
  expect(users.find((u) => u.key === "coo")!.grants).toHaveLength(6);
  const managers = users.filter((u) => u.key.startsWith("manager"));
  expect(managers.map((u) => u.grants.length)).toEqual([3, 3]);
  expect(
    new Set(managers.flatMap((u) => u.grants.map((g) => g.accountId))).size,
  ).toBe(6);
  const leads = users.filter((u) => u.key.startsWith("teamlead"));
  expect(leads).toHaveLength(12);
  expect(
    new Set(leads.flatMap((u) => u.grants.flatMap((g) => g.teamIds))).size,
  ).toBe(12);
  expect(users).toEqual(
    buildPulseDemoUsers("bpo", [...accounts].reverse(), [...teams].reverse()),
  );
});
it("rejects an incomplete reference structure instead of silently assigning the wrong teams", () => {
  expect(() => buildPulseDemoUsers("bpo", accounts.slice(1), teams)).toThrow();
});
