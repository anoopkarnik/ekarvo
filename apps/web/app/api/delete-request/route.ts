import { isSameLocalOrigin } from "@/lib/marketing/local-origin";
import { deleteRequestSchema } from "@/lib/marketing/request-schema";
import { deleteRequest } from "@/lib/marketing/request-store";
import { checkLocalFormRateLimit } from "@/lib/marketing/local-rate-limit";

export const runtime = "nodejs";
const maxBytes = 1024;
const json = (message: string, status = 200) =>
  Response.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );

export async function POST(request: Request) {
  if (!isSameLocalOrigin(request)) {
    return json("Request not permitted.", 403);
  }
  if (
    request.headers
      .get("content-type")
      ?.split(";", 1)[0]
      ?.trim()
      .toLowerCase() !== "application/json"
  ) {
    return json("Unsupported request format.", 415);
  }
  if (Number(request.headers.get("content-length") || 0) > maxBytes) {
    return json("The request is too large.", 413);
  }
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    const decoder = new TextDecoder();
    let text = "",
      size = 0;
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > maxBytes) {
            await reader.cancel();
            return json("The request is too large.", 413);
          }
          text += decoder.decode(value, { stream: true });
        }
      } finally {
        reader.releaseLock();
      }
    }
    raw = JSON.parse(text + decoder.decode());
  } catch {
    return json("Invalid receipt.", 400);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return json("Invalid receipt.", 400);
  const parsed = deleteRequestSchema.safeParse(raw);
  if (!parsed.success)
    return json("Enter a valid request ID and deletion token.", 422);
  if (!checkLocalFormRateLimit("delete:local")) {
    return json("Too many requests. Wait one minute, then try again.", 429);
  }
  try {
    const removed = await deleteRequest(parsed.data.id, parsed.data.token);
    return removed
      ? json("The saved request has been deleted.")
      : json(
          "No matching request was found. Check the receipt, or the request may already be deleted.",
          404,
        );
  } catch {
    return json("We could not confirm deletion. Please try again.", 503);
  }
}
