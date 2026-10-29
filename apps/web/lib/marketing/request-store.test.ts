// @vitest-environment node
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactRequestSchema, deleteRequestSchema } from "./request-schema";
import { deleteRequest, purgeExpired, saveRequest } from "./request-store";

// Pause only the vulnerable fs boundary; every read/write still uses the real filesystem.
const filesystemHooks = vi.hoisted(() => ({
  beforeUnlink: undefined as undefined | ((path: unknown) => Promise<void>),
  lockContended: undefined as undefined | (() => void),
}));
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    unlink: async (...args: Parameters<typeof actual.unlink>) => {
      await filesystemHooks.beforeUnlink?.(args[0]);
      return actual.unlink(...args);
    },
    mkdir: async (...args: Parameters<typeof actual.mkdir>) => {
      try {
        return await actual.mkdir(...args);
      } catch (error) {
        if (
          (error as NodeJS.ErrnoException).code === "EEXIST" &&
          String(args[0]).endsWith(".lock")
        ) {
          filesystemHooks.lockContended?.();
        }
        throw error;
      }
    },
  };
});
function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const values = {
  name: "Ada",
  email: "ada@example.com",
  organization: "Operations",
  role: "Lead",
  workflow: "Review the weekly plan",
  criteria: "Fewer delays",
  product: "operations-os",
};
let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "ekarvo-store-test-"));
  vi.stubEnv("EKARVO_DATA_DIR", join(directory, "requests"));
});
afterEach(async () => {
  filesystemHooks.beforeUnlink = undefined;
  filesystemHooks.lockContended = undefined;
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

// These assertions catch incomplete publication, token replacement, unsafe paths and lost race conflicts.
describe("local request store", () => {
  it("publishes a complete private record and leaves no temporary files", async () => {
    const id = randomUUID();
    const record = await saveRequest(id, values);
    const dir = join(directory, "requests");
    expect((await stat(dir)).mode & 0o777).toBe(0o700);
    expect((await stat(join(dir, `${id}.json`))).mode & 0o777).toBe(0o600);
    expect(JSON.parse(await readFile(join(dir, `${id}.json`), "utf8"))).toEqual(
      record,
    );
    expect(record).toMatchObject({ id, ...values });
    expect(
      deleteRequestSchema.safeParse({ id, token: record.deleteToken }).success,
    ).toBe(true);
    expect(new Date(record.createdAt).getTime()).toBeGreaterThan(
      Date.now() - 5000,
    );
    expect(await readdir(dir)).toEqual([`${id}.json`]);
  });
  it("returns the original receipt for identical concurrent duplicates", async () => {
    const id = randomUUID();
    const records = await Promise.all(
      Array.from({ length: 20 }, () => saveRequest(id, values)),
    );
    for (const record of records) expect(record).toEqual(records[0]);
    expect(await readdir(join(directory, "requests"))).toEqual([`${id}.json`]);
  });
  it("rejects conflicting duplicates without replacing the saved record", async () => {
    const id = randomUUID();
    const record = await saveRequest(id, values);
    await expect(
      saveRequest(id, { ...values, workflow: "Different" }),
    ).rejects.toThrow("CONFLICT");
    expect(await saveRequest(id, values)).toEqual(record);
  });
  it("allows exactly one winner for concurrent conflicting bodies", async () => {
    const id = randomUUID();
    const results = await Promise.allSettled([
      saveRequest(id, values),
      saveRequest(id, { ...values, workflow: "Different" }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toMatchObject([
      { reason: { message: "CONFLICT" } },
    ]);
    const saved = JSON.parse(
      await readFile(join(directory, "requests", `${id}.json`), "utf8"),
    );
    expect(saved).toEqual(results.find((r) => r.status === "fulfilled")?.value);
  });
  it("normalizes field order and whitespace before comparing content", async () => {
    const id = randomUUID();
    const original = await saveRequest(id, values);
    const reordered = Object.fromEntries(
      Object.entries(values)
        .reverse()
        .map(([k, v]) => [k, ` ${v} `]),
    );
    expect(await saveRequest(id, reordered)).toEqual(original);
  });
  it("purges only expired request records beyond the 30-day boundary", async () => {
    const id = randomUUID(),
      recentId = randomUUID();
    await saveRequest(id, values);
    await saveRequest(recentId, values);
    const now = Date.now(),
      days30 = 30 * 86400000;
    const old = join(directory, "requests", `${id}.json`);
    const recent = join(directory, "requests", `${recentId}.json`);
    await utimes(
      old,
      (now - days30 - 1000) / 1000,
      (now - days30 - 1000) / 1000,
    );
    await utimes(
      recent,
      (now - days30 + 1000) / 1000,
      (now - days30 + 1000) / 1000,
    );
    await writeFile(join(directory, "requests", "unrelated.json"), "keep");
    await purgeExpired(now);
    expect(await readdir(join(directory, "requests"))).toEqual(
      expect.arrayContaining([`${recentId}.json`, "unrelated.json"]),
    );
    await expect(stat(old)).rejects.toMatchObject({ code: "ENOENT" });
    await purgeExpired(now + 2000);
    await expect(stat(recent)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("preserves invalid-token records and deletes only with the private token", async () => {
    const id = randomUUID(),
      record = await saveRequest(id, values);
    expect(await deleteRequest(id, randomUUID())).toBe(false);
    expect(await deleteRequest(id, "short")).toBe(false);
    expect(await saveRequest(id, values)).toEqual(record);
    expect(await deleteRequest(id, record.deleteToken)).toBe(true);
    expect(await deleteRequest(id, record.deleteToken)).toBe(false);
    expect(await deleteRequest(randomUUID(), randomUUID())).toBe(false);
  });
  it("keeps identical receipts when expiry pauses before unlink and another save intervenes", async () => {
    const id = randomUUID();
    await saveRequest(id, values);
    const path = join(directory, "requests", `${id}.json`);
    const expired = (Date.now() - 31 * 86400000) / 1000;
    await utimes(path, expired, expired);
    const inspected = gate(),
      resume = gate(),
      contended = gate();
    filesystemHooks.beforeUnlink = async (target) => {
      if (target !== path) return;
      filesystemHooks.beforeUnlink = undefined;
      inspected.resolve();
      await resume.promise;
    };
    filesystemHooks.lockContended = contended.resolve;
    const first = saveRequest(id, values);
    await inspected.promise;
    const second = saveRequest(id, values);
    // On the old code, the second save completes and publishes B before A unlinks.
    // With coordination, the same second operation first signals lock contention.
    await Promise.race([second, contended.promise]);
    resume.resolve();
    const [a, b] = await Promise.all([first, second]);
    expect(a).toEqual(b);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(a);
    expect(await deleteRequest(id, a.deleteToken)).toBe(true);
  });
  it("does not unlink a replacement with an earlier generation's deletion token", async () => {
    const id = randomUUID(),
      original = await saveRequest(id, values);
    const path = join(directory, "requests", `${id}.json`);
    const verified = gate(),
      resume = gate(),
      contended = gate();
    filesystemHooks.beforeUnlink = async (target) => {
      if (target !== path) return;
      filesystemHooks.beforeUnlink = undefined;
      verified.resolve();
      await resume.promise;
    };
    filesystemHooks.lockContended = contended.resolve;
    const firstDelete = deleteRequest(id, original.deleteToken);
    await verified.promise;
    const replace = (async () => {
      await deleteRequest(id, original.deleteToken);
      return saveRequest(id, values);
    })();
    await Promise.race([replace, contended.promise]);
    resume.resolve();
    const [, replacement] = await Promise.all([firstDelete, replace]);
    expect(replacement.deleteToken).not.toBe(original.deleteToken);
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual(replacement);
    expect(await deleteRequest(id, original.deleteToken)).toBe(false);
    expect(await deleteRequest(id, replacement.deleteToken)).toBe(true);
  });
  it("honors a lifecycle lock held by a separate process without blocking another ID", async () => {
    const id = randomUUID();
    await purgeExpired();
    const lockPath = join(directory, "requests", `.${id}.lock`);
    const child = spawn(
      process.execPath,
      [
        "-e",
        `
      const fs = require('node:fs/promises');
      (async () => {
        await fs.mkdir(process.argv[1], {mode: 0o700});
        process.send('held');
        process.on('message', async () => {
          await fs.rmdir(process.argv[1]);
          process.disconnect();
        });
      })().catch(error => { console.error(error); process.exit(1); });
    `,
        lockPath,
      ],
      { stdio: ["ignore", "pipe", "pipe", "ipc"] },
    );
    const held = new Promise<void>((done, fail) => {
      child.once("message", () => done());
      child.once("error", fail);
    });
    const exit = new Promise<void>((done) => child.once("exit", () => done()));
    const contended = gate();
    try {
      await held;
      filesystemHooks.lockContended = contended.resolve;
      const pending = saveRequest(id, values);
      const outcome = await Promise.race([
        pending.then(() => "published"),
        contended.promise.then(() => "blocked"),
      ]);
      const independent = await saveRequest(randomUUID(), values);
      // Release before asserting so a failing RED run never leaves a worker behind.
      child.send("release");
      await exit;
      expect(outcome).toBe("blocked");
      expect(independent.id).not.toBe(id);
      const receipt = await pending;
      expect(await deleteRequest(id, receipt.deleteToken)).toBe(true);
    } finally {
      child.kill();
    }
  });
  it("bounds waiting without stealing an unreleased filesystem lock", async () => {
    const id = randomUUID();
    await purgeExpired();
    const lock = join(directory, "requests", `.${id}.lock`);
    await mkdir(lock, { mode: 0o700 });
    await expect(saveRequest(id, values)).rejects.toThrow("REQUEST_LOCKED");
    expect((await stat(lock)).isDirectory()).toBe(true);
    expect(await readdir(join(directory, "requests"))).toEqual([`.${id}.lock`]);
  });
  it("rejects path traversal and invalid values before writing", async () => {
    await expect(saveRequest("../outside", values)).rejects.toThrow();
    await expect(
      saveRequest(randomUUID(), { ...values, workflow: "" }),
    ).rejects.toThrow();
    expect(await readdir(directory)).toEqual([]);
  });
});

describe("reference field validation", () => {
  it.each(
    Object.entries({
      name: 120,
      email: 254,
      organization: 200,
      role: 120,
      workflow: 2000,
      criteria: 1000,
      product: 50,
    }),
  )("rejects oversized %s", (field, limit) => {
    expect(
      contactRequestSchema.safeParse({
        ...values,
        requestId: randomUUID(),
        [field]: "a".repeat(limit + 1),
      }).success,
    ).toBe(false);
  });
  it("trims values and requires the reference required fields/product/UUID v4", () => {
    expect(
      contactRequestSchema.parse({
        ...values,
        requestId: randomUUID(),
        name: " Ada ",
      }).name,
    ).toBe("Ada");
    for (const field of [
      "name",
      "email",
      "organization",
      "workflow",
      "product",
      "requestId",
    ]) {
      expect(
        contactRequestSchema.safeParse({
          ...values,
          requestId: randomUUID(),
          [field]: "",
        }).success,
      ).toBe(false);
    }
    expect(
      contactRequestSchema.safeParse({
        ...values,
        requestId: "00000000-0000-1000-8000-000000000000",
      }).success,
    ).toBe(false);
    expect(
      contactRequestSchema.safeParse({
        ...values,
        requestId: randomUUID(),
        email: "bad",
      }).success,
    ).toBe(false);
    expect(
      contactRequestSchema.safeParse({
        ...values,
        requestId: randomUUID(),
        product: "unknown",
      }).success,
    ).toBe(false);
  });
});

describe("bounded rolling form limiter", () => {
  it("expires each attempt individually and keeps keys independent", async () => {
    vi.resetModules();
    const { checkLocalFormRateLimit } = await import("./local-rate-limit");
    expect(checkLocalFormRateLimit("contact", 0)).toBe(true);
    for (let i = 0; i < 9; i++)
      expect(checkLocalFormRateLimit("contact", 30000)).toBe(true);
    expect(checkLocalFormRateLimit("contact", 59999)).toBe(false);
    expect(checkLocalFormRateLimit("delete", 59999)).toBe(true);
    expect(checkLocalFormRateLimit("contact", 60000)).toBe(true);
    expect(checkLocalFormRateLimit("contact", 60001)).toBe(false);
    expect(checkLocalFormRateLimit("contact", 90000)).toBe(true);
  });
  it("bounds retained keys without evicting active limits and prunes expired entries", async () => {
    vi.resetModules();
    const { checkLocalFormRateLimit } = await import("./local-rate-limit");
    for (let i = 0; i < 1000; i++)
      expect(checkLocalFormRateLimit(`key-${i}`, 0)).toBe(true);
    expect(checkLocalFormRateLimit("overflow", 1)).toBe(false);
    expect(checkLocalFormRateLimit("overflow", 60000)).toBe(true);
  });
});
