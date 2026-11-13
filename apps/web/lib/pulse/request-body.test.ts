import { expect, it } from "vitest";
import { boundedBody } from "./request-body";
it("rejects chunked payloads without relying on Content-Length", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(6));
      controller.enqueue(new Uint8Array(6));
      controller.close();
    },
  });
  await expect(
    boundedBody(
      new Request("http://localhost", {
        method: "POST",
        body,
        duplex: "half",
      } as RequestInit),
      10,
    ),
  ).rejects.toThrow("Payload too large");
});
it("preserves a valid bounded payload", async () => {
  const result = await boundedBody(
    new Request("http://localhost", { method: "POST", body: "hello" }),
    10,
  );
  expect(new TextDecoder().decode(result)).toBe("hello");
});
