// @vitest-environment node
import { randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { POST as Handler } from "./route";

const values = {
  name: "Ada",
  email: "ada@example.com",
  organization: "Operations",
  role: "Lead",
  workflow: "Review weekly plan",
  criteria: "Less waiting",
  product: "operations-os",
};
let directory: string, POST: typeof Handler;
const request = (
  body: unknown = { ...values, requestId: randomUUID() },
  options: {
    url?: string;
    headers?: Record<string, string>;
    raw?: string;
  } = {},
) => {
  const url = options.url ?? "http://localhost:3011/api/contact";
  return new Request(url, {
    method: "POST",
    headers: {
      origin: new URL(url).origin,
      "content-type": "application/json",
      ...options.headers,
    },
    body: options.raw ?? JSON.stringify(body),
  });
};
const status = async (req: Request, expected: number) => {
  const response = await POST(req);
  expect(response.status).toBe(expected);
  expect(response.headers.get("cache-control")).toBe("no-store");
  return response.json();
};
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "ekarvo-contact-test-"));
  vi.stubEnv("EKARVO_DATA_DIR", join(directory, "requests"));
  vi.resetModules();
  ({ POST } = await import("./route"));
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

describe("POST /api/contact", () => {
  it.each(["localhost", "127.0.0.1", "[::1]"])(
    "accepts same-origin %s and returns only the private receipt",
    async (host) => {
      const id = randomUUID();
      const receipt = await status(
        request(
          { ...values, requestId: id },
          { url: `http://${host}:3011/api/contact` },
        ),
        201,
      );
      expect(receipt).toEqual({
        id,
        createdAt: expect.any(String),
        deleteToken: expect.stringMatching(/^[a-f0-9-]{36}$/),
        message: "Your workflow request has been saved on this computer.",
      });
    },
  );
  it("preserves receipts under concurrent identical submissions and rejects changed content", async () => {
    const body = { ...values, requestId: randomUUID() };
    const receipts = await Promise.all(
      Array.from({ length: 6 }, () => status(request(body), 201)),
    );
    for (const receipt of receipts) expect(receipt).toEqual(receipts[0]);
    expect(
      await status(request({ ...body, workflow: "changed" }), 409),
    ).toEqual({
      message: "This request changed after saving. Start a new brief.",
    });
    expect(await status(request(body), 201)).toEqual(receipts[0]);
  });
  it.each([
    { url: "https://example.com/api/contact" },
    { headers: { origin: "http://evil.example" } },
    { headers: { origin: "http://localhost:9999" } },
    { headers: { origin: "null" } },
    { headers: { origin: "" } },
  ])("rejects public hosts and cross/missing origins: %j", async (options) => {
    await status(request(undefined, options), 403);
    expect(await readdir(directory)).toEqual([]);
  });
  it.each(["text/plain", "application/jsonp", ""])(
    "rejects content type %s",
    async (contentType) => {
      await status(
        request(undefined, { headers: { "content-type": contentType } }),
        415,
      );
    },
  );
  it("rejects declared and actual oversized bytes even when character count is lower", async () => {
    await status(
      request(undefined, { headers: { "content-length": "16385" } }),
      413,
    );
    await status(request(undefined, { raw: " ".repeat(16385) }), 413);
    await status(
      request(undefined, {
        raw: JSON.stringify({
          ...values,
          requestId: randomUUID(),
          ignored: "é".repeat(9000),
        }),
      }),
      413,
    );
  });
  it.each(["broken", "null", "[]", "1"])(
    "rejects malformed/non-object JSON %s",
    async (raw) => {
      await status(request(undefined, { raw }), 400);
    },
  );
  it("rejects a filled honeypot without storing data", async () => {
    await status(
      request({ ...values, requestId: randomUUID(), website: "bot" }),
      400,
    );
    expect(await readdir(directory)).toEqual([]);
  });
  it("returns field errors and rejects missing/non-v4 request IDs", async () => {
    const body = {
      ...values,
      requestId: randomUUID(),
      name: "",
      email: "bad",
      product: "bad",
    };
    expect(await status(request(body), 422)).toMatchObject({
      message: "Check the marked fields.",
      errors: {
        name: "Complete this field.",
        email: "Enter a valid email address.",
        product: "Select a product.",
      },
    });
    for (const requestId of [
      undefined,
      "../unsafe",
      "00000000-0000-1000-8000-000000000000",
    ]) {
      expect(await status(request({ ...values, requestId }), 422)).toEqual({
        message: "Reload the page before saving.",
      });
    }
  });
  it("normalizes reference values, accepts product choices and discards extra fields", async () => {
    for (const product of [
      "operations-os",
      "autonomous-execution",
      "not-sure",
    ]) {
      const receipt = await status(
        request({
          ...values,
          name: " Ada ",
          product,
          role: undefined,
          criteria: undefined,
          secret: "not stored",
          requestId: randomUUID(),
        }),
        201,
      );
      expect(receipt.id).toBeTruthy();
    }
  });
  it("blocks the eleventh valid attempt despite spoofed forwarded addresses", async () => {
    for (let i = 0; i < 10; i++)
      await status(
        request(undefined, { headers: { "x-forwarded-for": `192.0.2.${i}` } }),
        201,
      );
    await status(
      request(undefined, { headers: { "x-forwarded-for": "192.0.2.99" } }),
      429,
    );
  });
  it("returns recoverable 503 when local storage is unavailable", async () => {
    const blocked = join(directory, "file");
    await writeFile(blocked, "not a directory");
    vi.stubEnv("EKARVO_DATA_DIR", join(blocked, "requests"));
    expect(await status(request(), 503)).toEqual({
      message:
        "We could not confirm the save. Your entries are still here. Please try again.",
    });
  });
});
