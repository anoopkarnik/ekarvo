import { NextRequest } from "next/server";
import { guardRoute } from "@/server/routeGuard";
import { periodSchema } from "@/lib/pulse/schemas";
import { dashboard } from "@/lib/pulse/queries";
import { csvCell } from "@/lib/pulse/csv";

export async function GET(req: NextRequest) {
  const guard = await guardRoute(req, "/api/pulse/export");
  if (!guard.ok)
    return Response.json({ error: guard.error }, { status: guard.status });
  const params = req.nextUrl.searchParams;
  const parsed = periodSchema.safeParse({
    ...Object.fromEntries(params),
    teamIds: params.has("teamIds") ? params.getAll("teamIds") : undefined,
  });
  if (!parsed.success)
    return Response.json({ error: "Invalid export scope." }, { status: 400 });
  try {
    // Reuse the authorized DTO: IT-only users cannot export operations,
    // and Team Leads never receive financial fields or other teams' totals.
    const d = await dashboard(guard.session.user.id, parsed.data);
    const rows: unknown[][] = [
      ["state", "ACTUAL"],
      ["client", d.account.name],
      ["periodStart", d.metrics.evidence.start],
      ["periodEndExclusive", d.metrics.evidence.end],
      ["timezone", d.timezone],
      ["calculatorVersion", d.metrics.evidence.calculatorVersion],
    ];
    for (const [key, value] of Object.entries(d.metrics))
      if (typeof value === "number" || value === null) rows.push([key, value]);
    if (d.metrics.finance)
      for (const [key, value] of Object.entries(d.metrics.finance))
        rows.push([`finance.${key}`, value]);
    return new Response(
      "metric,value\r\n" +
        rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pulse-actuals.csv"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    const code = (e as { code?: string }).code;
    return Response.json(
      { error: "Export unavailable for this scope." },
      { status: code === "FORBIDDEN" || code === "NOT_FOUND" ? 403 : 400 },
    );
  }
}
