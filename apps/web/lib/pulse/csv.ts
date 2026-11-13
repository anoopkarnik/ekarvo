import { parseRecord, type ImportKind } from "./schemas";
export const MAX_ROWS = 50000,
  MAX_BYTES = 10 * 1024 * 1024;
export function parseCsv(text: string) {
  if (new TextEncoder().encode(text).length > MAX_BYTES)
    throw new Error("CSV exceeds 10 MiB.");
  text = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const pushCell = () => {
    row.push(cell);
    cell = "";
    closed = false;
  };
  const pushRow = () => {
    pushCell();
    if (row.some(Boolean)) rows.push(row);
    row = [];
    if (rows.length > MAX_ROWS + 1) throw new Error("CSV exceeds 50,000 rows.");
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw new Error("Unexpected quote.");
      quoted = true;
    } else if (c === ",") pushCell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      pushRow();
    } else {
      if (closed) throw new Error("Unexpected text after quoted cell.");
      cell += c;
    }
  }
  if (quoted) throw new Error("Unclosed quoted cell.");
  if (cell || row.length) pushRow();
  const headers = rows.shift()?.map((h) => h.trim());
  if (
    !headers?.length ||
    headers.some((h) => !h) ||
    new Set(headers).size !== headers.length
  )
    throw new Error("CSV requires unique headers.");
  return rows.map((cells, i) => {
    if (cells.length !== headers.length)
      throw new Error(`Wrong number of columns on row ${i + 2}.`);
    return Object.fromEntries(
      headers.flatMap((h, j) =>
        cells[j]?.trim() ? [[h, cells[j]!.trim()]] : [],
      ),
    );
  });
}
export function validateRows(
  kind: ImportKind,
  rows: Record<string, unknown>[],
  mapping: Record<string, string> = {},
) {
  const seen = new Map<string, string>();
  return rows.map((input, i) => {
    let payload: Record<string, unknown> = input;
    try {
      payload = parseRecord(
        kind,
        Object.fromEntries(
          Object.entries(input).map(([k, v]) => [mapping[k] || k, v]),
        ),
      );
      const key = String(payload.externalId),
        encoded = JSON.stringify(payload);
      if (seen.has(key) && seen.get(key) !== encoded)
        throw new Error("Conflicting duplicate externalId.");
      seen.set(key, encoded);
      return { row: i + 2, payload, error: null };
    } catch (e) {
      return {
        row: i + 2,
        payload,
        error: e instanceof Error ? e.message : "Invalid row",
      };
    }
  });
}
export const csvCell = (s: unknown) => {
  const value = String(s ?? "");
  const safe =
    typeof s === "number" ? value : value.replace(/^[\s]*[=+@-]/, "'$&");
  return '"' + safe.replaceAll('"', '""') + '"';
};
export const templateColumns: Record<ImportKind, string[]> = {
  SITE: ["externalId", "name"],
  PROCESS: ["externalId", "name"],
  TEAM: ["externalId", "name", "processId", "siteId"],
  WORKER: [
    "externalId",
    "name",
    "teamId",
    "fte",
    "hourlyRate",
    "overtimeMultiplier",
    "active",
  ],
  WORK_TYPE: [
    "externalId",
    "name",
    "processId",
    "standardMinutes",
    "complexity",
    "slaHours",
    "requiredSkill",
    "automationEligible",
  ],
  SHIFT: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "hours",
    "start",
    "end",
  ],
  TIME_ENTRY: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "hours",
    "category",
    "hourlyRate",
    "overtime",
    "overtimeMultiplier",
  ],
  WORK_ITEM: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "workTypeId",
    "arrivedAt",
    "dueAt",
    "completedAt",
    "firstPass",
    "complexity",
    "sopVersion",
  ],
  WORK_EVENT: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "workItemId",
    "event",
    "minutes",
  ],
  QA: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "workItemId",
    "passed",
    "defect",
    "sopVersion",
  ],
  FINANCE: ["externalId", "occurredAt", "category", "amount", "currency"],
  CERTIFICATION: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "skill",
    "validUntil",
  ],
  ASSIGNMENT: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "start",
    "end",
    "fte",
  ],
  CONTRACT: [
    "externalId",
    "occurredAt",
    "pricingModel",
    "ratePerUnit",
    "monthlyBaseFee",
    "ratePerFteMonthly",
    "effectiveFrom",
    "effectiveTo",
    "targetSla",
    "penaltyMax",
  ],
  HANDOVER: ["externalId", "occurredAt", "teamId", "note", "ownerId", "status"],
  COACHING: [
    "externalId",
    "occurredAt",
    "teamId",
    "workerId",
    "note",
    "ownerId",
    "hours",
    "status",
  ],
  AUTOMATION: [
    "externalId",
    "occurredAt",
    "teamId",
    "workTypeId",
    "note",
    "ownerId",
    "status",
  ],
};
