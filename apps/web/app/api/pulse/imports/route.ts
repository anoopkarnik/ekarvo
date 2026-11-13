import { boundedBody } from "@/lib/pulse/request-body";
import { NextRequest } from "next/server";
import { z } from "zod";
import db from "@workspace/database/client";
import { guardRoute } from "@/server/routeGuard";
import { requireIt } from "@/lib/pulse/access";
import { stageImport } from "@/lib/pulse/imports";
import { importKindSchema, id } from "@/lib/pulse/schemas";
import { csvCell, MAX_BYTES, templateColumns } from "@/lib/pulse/csv";
const fields = z.object({
  organizationId: id,
  accountId: id,
  kind: importKindSchema,
  source: id,
  mappingId: id.optional(),
});
export async function POST(req: NextRequest) {
  const guard = await guardRoute(req, "/api/pulse/imports");
  if (!guard.ok)
    return Response.json({ error: guard.error }, { status: guard.status });
  try {
    const bytes = await boundedBody(req, MAX_BYTES + 1024 * 1024);
    const form = await new Request(req.url, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") || "" },
      body: bytes,
    }).formData();
    const parsed = fields.safeParse(Object.fromEntries(form));
    if (!parsed.success)
      return Response.json(
        { error: "Invalid import fields." },
        { status: 400 },
      );
    const file = form.get("file");
    if (!(file instanceof File) || file.size > MAX_BYTES)
      return Response.json(
        { error: "Choose a CSV file no larger than 10 MiB." },
        { status: 400 },
      );
    const input = parsed.data;
    await requireIt(guard.session.user.id, input.organizationId);
    const mapping = input.mappingId
      ? await db.pulseMapping.findFirst({
          where: {
            id: input.mappingId,
            organizationId: input.organizationId,
            accountId: input.accountId,
            kind: input.kind,
          },
        })
      : null;
    if (input.mappingId && !mapping)
      return Response.json({ error: "Mapping unavailable." }, { status: 400 });
    return Response.json(
      await stageImport(
        guard.session.user.id,
        input.organizationId,
        input.accountId,
        input.kind,
        input.source,
        await file.text(),
        (mapping?.fields || {}) as Record<string, string>,
      ),
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Import failed." },
      { status: (e as { code?: string }).code === "FORBIDDEN" ? 403 : 400 },
    );
  }
}
export async function GET(req: NextRequest) {
  const guard = await guardRoute(req, "/api/pulse/imports");
  if (!guard.ok)
    return Response.json({ error: guard.error }, { status: guard.status });
  const parsed = z
    .object({
      organizationId: id,
      kind: importKindSchema.optional(),
      batchId: id.optional(),
    })
    .safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success)
    return Response.json({ error: "Invalid request." }, { status: 400 });
  try {
    const input = parsed.data;
    await requireIt(guard.session.user.id, input.organizationId);
    if (input.kind)
      return new Response(templateColumns[input.kind].join(",") + "\n", {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="pulse-${input.kind}.csv"`,
        },
      });
    const batch = await db.pulseImportBatch.findFirst({
      where: { id: input.batchId || "", organizationId: input.organizationId },
    });
    if (!batch)
      return Response.json({ error: "Batch not found." }, { status: 404 });
    const rows = await db.pulseImportRow.findMany({
      where: { batchId: batch.id, error: { not: null } },
      select: { row: true, error: true },
      orderBy: { row: "asc" },
    });
    return new Response(
      "row,error\n" +
        rows.map((r) => `${r.row},${csvCell(r.error)}`).join("\n"),
      {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="pulse-errors.csv"',
        },
      },
    );
  } catch {
    return Response.json({ error: "Access denied." }, { status: 403 });
  }
}
