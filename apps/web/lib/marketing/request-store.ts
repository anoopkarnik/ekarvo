import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import {
  chmod,
  link,
  mkdir,
  open,
  readFile,
  readdir,
  rmdir,
  stat,
  unlink,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  requestIdSchema,
  workflowValuesSchema,
  type WorkflowRequestValues,
} from "./request-schema";

type RequestRecord = WorkflowRequestValues & {
  id: string;
  createdAt: string;
  deleteToken: string;
  hash: string;
};
const dataDirectory = () =>
  resolve(process.env.EKARVO_DATA_DIR || ".data/requests");
const missing = (error: unknown) =>
  (error as NodeJS.ErrnoException).code === "ENOENT";
const lifetimeMs = 30 * 86400000;

async function ensureDirectory(directory: string) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
}

/**
 * Atomic mkdir coordinates every lifecycle mutation across processes sharing this directory.
 * Never steal an old lock: its owner may still be running. A crashed owner's lock requires
 * operator removal after stopping all writers; bounded waiting becomes a recoverable 503.
 */
async function withRequestLock<T>(
  directory: string,
  id: string,
  work: () => Promise<T>,
): Promise<T> {
  const lock = join(directory, `.${id}.lock`);
  for (let attempt = 0; ; attempt++) {
    try {
      await mkdir(lock, { mode: 0o700 });
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (attempt >= 200) throw new Error("REQUEST_LOCKED");
      await new Promise<void>((done) => setTimeout(done, 10));
    }
  }
  try {
    return await work();
  } finally {
    await rmdir(lock);
  }
}

/** Expiry follows the reference's file modification time, without extending it on retries. */
export async function purgeExpired(now = Date.now()) {
  const directory = dataDirectory();
  await ensureDirectory(directory);
  for (const name of await readdir(directory)) {
    if (
      !name.endsWith(".json") ||
      !requestIdSchema.safeParse(name.slice(0, -5)).success
    )
      continue;
    const path = join(directory, name);
    try {
      // A cheap precheck avoids waiting for locks on live records unrelated to this save.
      if (now - (await stat(path)).mtimeMs <= lifetimeMs) continue;
      await withRequestLock(directory, name.slice(0, -5), async () => {
        // The pathname may now refer to a newly published generation; inspect it again
        // while holding the same lock that publication and token deletion require.
        if (now - (await stat(path)).mtimeMs > lifetimeMs) await unlink(path);
      });
    } catch (error) {
      if (!missing(error)) throw error;
    }
  }
}

export async function saveRequest(
  requestId: string,
  input: unknown,
): Promise<RequestRecord> {
  // Validate here as well as at the HTTP boundary: IDs must never become arbitrary paths.
  const id = requestIdSchema.parse(requestId);
  const values = workflowValuesSchema.parse(input);
  const directory = dataDirectory();
  await purgeExpired();
  return withRequestLock(directory, id, async () => {
    const path = join(directory, `${id}.json`);
    const hash = createHash("sha256")
      .update(JSON.stringify(values))
      .digest("hex");
    const existing = async () => {
      const record = JSON.parse(await readFile(path, "utf8")) as RequestRecord;
      if (record.hash !== hash) throw new Error("CONFLICT");
      return record;
    };
    try {
      return await existing();
    } catch (error) {
      if (!missing(error)) throw error;
    }

    const record: RequestRecord = {
      id,
      createdAt: new Date().toISOString(),
      deleteToken: randomUUID(),
      hash,
      ...values,
    };
    const temporary = join(directory, `.${randomUUID()}.tmp`);
    try {
      const file = await open(temporary, "wx", 0o600);
      try {
        await file.writeFile(JSON.stringify(record, null, 2));
        await file.sync();
      } finally {
        await file.close();
      }
      // A hard link publishes the complete file atomically and never overwrites a winner.
      await link(temporary, path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST")
        return await existing();
      throw error;
    } finally {
      await unlink(temporary).catch((error: unknown) => {
        if (!missing(error)) throw error;
      });
    }
    return record;
  });
}

export async function deleteRequest(
  id: string,
  token: string,
): Promise<boolean> {
  if (!requestIdSchema.safeParse(id).success) return false;
  const directory = dataDirectory();
  await ensureDirectory(directory);
  return withRequestLock(directory, id, async () => {
    const path = join(directory, `${id}.json`);
    try {
      const record = JSON.parse(await readFile(path, "utf8")) as RequestRecord;
      const expected = Buffer.from(record.deleteToken);
      const received = Buffer.from(token);
      if (
        expected.length !== received.length ||
        !timingSafeEqual(expected, received)
      )
        return false;
      await unlink(path);
      return true;
    } catch (error) {
      if (missing(error)) return false;
      throw error;
    }
  });
}
