import { isSameLocalOrigin } from "@/lib/marketing/local-origin";
import { contactRequestSchema } from "@/lib/marketing/request-schema";
import { saveRequest } from "@/lib/marketing/request-store";
import { checkLocalFormRateLimit } from "@/lib/marketing/local-rate-limit";

export const runtime = "nodejs";
const maxBytes = 16 * 1024;
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    return json(
      { message: "This local form is not enabled on a public host." },
      403,
    );
  }
  if (!isSameLocalOrigin(request)) {
    return json({ message: "Reload this page and try again." }, 403);
  }
  if (
    request.headers
      .get("content-type")
      ?.split(";", 1)[0]
      ?.trim()
      .toLowerCase() !== "application/json"
  ) {
    return json({ message: "Unsupported request format." }, 415);
  }
  if (Number(request.headers.get("content-length") || 0) > maxBytes) {
    return json({ message: "The request is too large." }, 413);
  }
  let raw: unknown;
  try {
    // Bound bytes while reading, including chunked requests and multi-byte text.
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
            return json({ message: "The request is too large." }, 413);
          }
          text += decoder.decode(value, { stream: true });
        }
      } finally {
        reader.releaseLock();
      }
    }
    raw = JSON.parse(text + decoder.decode());
  } catch {
    return json({ message: "Check your entries and try again." }, 400);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return json({ message: "Invalid request." }, 400);
  }
  if ("website" in raw && raw.website) {
    return json({ message: "Unable to accept this request." }, 400);
  }
  const parsed = contactRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (field !== "requestId") errors[field] = issue.message;
    }
    if (Object.keys(errors).length)
      return json({ message: "Check the marked fields.", errors }, 422);
    return json({ message: "Reload the page before saving." }, 422);
  }
  // All callers are local; ignore spoofable forwarded address headers.
  if (!checkLocalFormRateLimit("contact:local")) {
    return json(
      { message: "Too many requests. Wait one minute, then try again." },
      429,
    );
  }
  try {
    const { requestId, ...values } = parsed.data;
    const receipt = await saveRequest(requestId, values);
    return json(
      {
        id: receipt.id,
        createdAt: receipt.createdAt,
        deleteToken: receipt.deleteToken,
        message: "Your workflow request has been saved on this computer.",
      },
      201,
    );
  } catch (error) {
    if ((error as Error).message === "CONFLICT") {
      return json(
        { message: "This request changed after saving. Start a new brief." },
        409,
      );
    }
    return json(
      {
        message:
          "We could not confirm the save. Your entries are still here. Please try again.",
      },
      503,
    );
  }
}
