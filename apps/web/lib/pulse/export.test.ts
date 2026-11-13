import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { csvCell, parseCsv } from "./csv";
const mocks = vi.hoisted(() => ({ guard: vi.fn(), dashboard: vi.fn() }));
vi.mock("@/server/routeGuard", () => ({ guardRoute: mocks.guard }));
vi.mock("./queries", () => ({ dashboard: mocks.dashboard }));
import { GET } from "@/app/api/pulse/export/route";
const request = () =>
  new NextRequest(
    "http://localhost/api/pulse/export?organizationId=bpo&accountId=client&from=2026-11-01&through=2026-11-07&teamIds=team",
  );
beforeEach(() => {
  vi.resetAllMocks();
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: "u" } } });
  mocks.dashboard.mockResolvedValue({
    account: { name: "=SUM(A1)" },
    timezone: "UTC",
    metrics: {
      arrivals: 10,
      slaPct: null,
      evidence: {
        start: "2026-11-01",
        end: "2026-11-08",
        calculatorVersion: "pulse-raw-v1",
      },
    },
  });
});
it("exports only the current authorized scope and escapes spreadsheet formulas", async () => {
  const response = await GET(request());
  const csv = await response.text();
  expect(response.status).toBe(200);
  expect(parseCsv(csv)).toContainEqual({ metric: "arrivals", value: "10" });
  expect(csv).not.toContain("finance");
  expect(csv).toContain("'=SUM(A1)");
  expect(response.headers.get("Cache-Control")).toContain("no-store");
  expect(mocks.dashboard).toHaveBeenCalledWith(
    "u",
    expect.objectContaining({
      organizationId: "bpo",
      accountId: "client",
      teamIds: ["team"],
    }),
  );
});
it("denies direct requests without a session or with revoked operational access", async () => {
  mocks.guard.mockResolvedValueOnce({
    ok: false,
    error: "Unauthorized",
    status: 401,
  });
  expect((await GET(request())).status).toBe(401);
  expect(mocks.dashboard).not.toHaveBeenCalled();
  mocks.dashboard.mockRejectedValue({ code: "FORBIDDEN" });
  expect((await GET(request())).status).toBe(403);
});
it("includes commercial values only when present in the server-authorized DTO", async () => {
  const value = await mocks.dashboard();
  value.metrics.finance = { revenue: 2500, labor: 1000 };
  mocks.dashboard.mockResolvedValue(value);
  expect(parseCsv(await (await GET(request())).text())).toContainEqual({
    metric: "finance.revenue",
    value: "2500",
  });
});
it("preserves negative numeric actuals while neutralizing formula-like text", () => {
  expect(csvCell(-100)).toBe('"-100"');
  expect(csvCell("\t=SUM(A1)")).toBe('"\'\t=SUM(A1)"');
});
