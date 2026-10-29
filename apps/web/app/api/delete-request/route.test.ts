// @vitest-environment node
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { POST as Handler } from "./route";
import { saveRequest } from "@/lib/marketing/request-store";

let directory: string, POST: typeof Handler;
const values = {
  name: "Ada",
  email: "ada@example.com",
  organization: "Operations",
  workflow: "Review weekly plan",
  product: "not-sure",
};
const request = (
  body: unknown = { id: randomUUID(), token: randomUUID() },
  options: {
    url?: string;
    headers?: Record<string, string>;
    raw?: string;
  } = {},
) => {
  const url = options.url ?? "http://localhost:3011/api/delete-request";
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
  directory = await mkdtemp(join(tmpdir(), "ekarvo-delete-test-"));
  vi.stubEnv("EKARVO_DATA_DIR", join(directory, "requests"));
  vi.resetModules();
  ({ POST } = await import("./route"));
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

describe("POST /api/delete-request", () => {
  it.each(["localhost", "127.0.0.1", "[::1]"])(
    "deletes a valid receipt on %s and reports already-deleted",
    async (host) => {
      const receipt = await saveRequest(randomUUID(), values);
      const body = { id: receipt.id, token: receipt.deleteToken };
      expect(
        await status(
          request(body, { url: `http://${host}:3011/api/delete-request` }),
          200,
        ),
      ).toEqual({ message: "The saved request has been deleted." });
      await status(request(body), 404);
    },
  );
  it("does not disclose whether an invalid token or unknown ID matched", async () => {
    const receipt = await saveRequest(randomUUID(), values);
    const wrong = await status(
      request({ id: receipt.id, token: randomUUID() }),
      404,
    );
    expect(await status(request(), 404)).toEqual(wrong);
    expect(
      JSON.parse(
        await readFile(
          join(directory, "requests", `${receipt.id}.json`),
          "utf8",
        ),
      ),
    ).toMatchObject({ deleteToken: receipt.deleteToken });
  });
  it.each([
    { url: "https://example.com/api/delete-request" },
    { headers: { origin: "http://evil.example" } },
    { headers: { origin: "http://localhost:9999" } },
    { headers: { origin: "" } },
  ])("rejects public hosts/cross or missing origins: %j", async (options) => {
    await status(request(undefined, options), 403);
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
  it("rejects declared and actual oversized bytes", async () => {
    await status(
      request(undefined, { headers: { "content-length": "1025" } }),
      413,
    );
    await status(request(undefined, { raw: " ".repeat(1025) }), 413);
    await status(
      request(undefined, {
        raw: JSON.stringify({
          id: randomUUID(),
          token: randomUUID(),
          ignored: "é".repeat(600),
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
  it.each([
    {},
    { id: "../unsafe", token: randomUUID() },
    { id: randomUUID(), token: "short" },
    { id: "00000000-0000-1000-8000-000000000000", token: randomUUID() },
  ])("rejects invalid receipt fields %j", async (body) => {
    await status(request(body), 422);
  });
  it("limits invalid-token attempts as well as successful deletions", async () => {
    for (let i = 0; i < 10; i++)
      await status(
        request(undefined, { headers: { "x-forwarded-for": `192.0.2.${i}` } }),
        404,
      );
    await status(request(), 429);
  });
  it("returns recoverable 503 when local storage cannot be read", async () => {
    const blocked = join(directory, "file");
    await writeFile(blocked, "not a directory");
    vi.stubEnv("EKARVO_DATA_DIR", blocked);
    await status(request(), 503);
  });
});

describe("Next normalized loopback request origins", () => {
  it("deletes on the exact Host authority after Next normalizes the URL", async () => {
    const receipt = await saveRequest(randomUUID(), values);
    await status(
      request(
        { id: receipt.id, token: receipt.deleteToken },
        {
          headers: { host: "127.0.0.1:3011", origin: "http://127.0.0.1:3011" },
        },
      ),
      200,
    );
  });
  it.each<Record<string, string>>([
    { host: "127.0.0.1:9999", origin: "http://127.0.0.1:9999" },
    { host: "127.0.0.1:3011", origin: "http://localhost:3011" },
    { host: "127.0.0.1:3011", origin: "http://127.0.0.1:9999" },
    { host: "127.0.0.1:3011", origin: "https://127.0.0.1:3011" },
    { host: "evil.example:3011", origin: "http://evil.example:3011" },
    { host: "localhost:3011@evil.example", origin: "http://localhost:3011" },
    { host: "localhost:3011/path", origin: "http://localhost:3011" },
    { host: "localhost:99999", origin: "http://localhost:3011" },
    { host: "", origin: "http://localhost:3011" },
    {
      host: "127.0.0.1:3011",
      origin: "http://localhost:3011",
      "x-forwarded-host": "localhost:3011",
      "x-forwarded-proto": "http",
    },
  ])(
    "rejects cross-origin, invalid or forwarded authority %j",
    async (headers) => {
      await status(request(undefined, { headers }), 403);
    },
  );
});
