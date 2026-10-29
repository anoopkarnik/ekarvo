import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import {
  chmod,
  link,
  mkdir,
  open,
  readFile,
  readdir,
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

/** Expiry follows the reference's file modification time, without extending it on retries. */
export async function purgeExpired(now = Date.now()) {
  const directory = dataDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  for (const name of await readdir(directory)) {
    if (
      !name.endsWith(".json") ||
      !requestIdSchema.safeParse(name.slice(0, -5)).success
    )
      continue;
    const path = join(directory, name);
    try {
      if (now - (await stat(path)).mtimeMs > lifetimeMs) await unlink(path);
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
}

export async function deleteRequest(
  id: string,
  token: string,
): Promise<boolean> {
  if (!requestIdSchema.safeParse(id).success) return false;
  const path = join(dataDirectory(), `${id}.json`);
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
}
