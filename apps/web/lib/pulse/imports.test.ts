import { describe, expect, it } from "vitest";
import { parseCsv, validateRows } from "./csv";
describe("CSV staging", () => {
  it("handles quoted commas, escaped quotes and multiline cells", () => {
    expect(parseCsv('externalId,note\r\nx,"hello,\n""world"""\r\n')).toEqual([
      { externalId: "x", note: 'hello,\n"world"' },
    ]);
  });
  it("rejects malformed and ambiguous CSV", () => {
    expect(() => parseCsv("id,id\na,b")).toThrow();
    expect(() => parseCsv('id\n"unfinished')).toThrow();
  });
  it("does not turn false text into true and rejects negative hours", () => {
    const result = validateRows("TIME_ENTRY", [
      {
        externalId: "x",
        occurredAt: "2026-11-01T00:00:00Z",
        teamId: "t",
        workerId: "w",
        hours: "2",
        category: "PRODUCTIVE",
        hourlyRate: "10",
        overtime: "false",
      },
    ]);
    expect(result[0]?.payload.overtime).toBe(false);
    expect(
      validateRows("TIME_ENTRY", [{ externalId: "x", hours: "-2" }])[0]?.error,
    ).toBeTruthy();
  });
  it("rejects conflicting duplicates within one file", () => {
    expect(
      validateRows("SITE", [
        { externalId: "x", name: "A" },
        { externalId: "x", name: "B" },
      ])[1]?.error,
    ).toContain("duplicate");
  });
});
