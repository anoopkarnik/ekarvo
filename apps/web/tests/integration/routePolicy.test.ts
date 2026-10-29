// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveRoutePolicy } from "@/lib/route-policy";

const apiDir = path.resolve(__dirname, "../../app/api");

function listRouteFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listRouteFiles(full);
    return entry.name === "route.ts" ? [full] : [];
  });
}

const routes = listRouteFiles(apiDir).map((file) => {
  const routePath =
    "/api/" +
    path.relative(apiDir, path.dirname(file)).split(path.sep).join("/");
  return {
    file,
    routePath,
    // Concrete URL for matching: [param] / [...all] segments become "x".
    samplePath: routePath.replace(/\[[^\]]+\]/g, "x"),
    source: fs.readFileSync(file, "utf-8"),
  };
});

const inputMarkers = {
  zod: "safeParse(",
  "image-upload": "normalizeImageUpload(",
  "form-data": "formData(",
} as const;

describe("route trust contract", () => {
  it("finds the API routes on disk", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)("$routePath has a policy entry", ({ samplePath }) => {
    expect(resolveRoutePolicy(samplePath)).toBeDefined();
  });

  it.each(routes)(
    "$routePath enforces its session policy through guardRoute",
    ({ samplePath, source }) => {
      const policy = resolveRoutePolicy(samplePath);
      if (policy?.auth !== "session") return;

      expect(source).toContain(`guardRoute(req, "${policy.path}")`);
    },
  );

  it.each(routes)(
    "$routePath validates input the way its policy declares",
    ({ samplePath, source }) => {
      const policy = resolveRoutePolicy(samplePath);
      const marker =
        policy && inputMarkers[policy.input as keyof typeof inputMarkers];
      if (!marker) return;

      expect(source).toContain(marker);
    },
  );

  it("matches on path segments, not raw string prefixes", () => {
    expect(resolveRoutePolicy("/landing")?.auth).toBe("public");
    expect(resolveRoutePolicy("/landing/pricing")?.auth).toBe("public");
    expect(resolveRoutePolicy("/landingx")).toBeUndefined();
    expect(resolveRoutePolicy("/publicity")).toBeUndefined();
    expect(resolveRoutePolicy("/api/v1/projects/abc")?.auth).toBe("api-key");
    expect(resolveRoutePolicy("/api/v1/projects/abc/nope")).toBeUndefined();
  });
});

describe("local marketing form route policy", () => {
  it.each([
    ["/api/contact", 16384],
    ["/api/delete-request", 1024],
  ] as const)(
    "publishes %s only at its exact path with handler-owned origin/rate checks",
    (path, bytes) => {
      expect(resolveRoutePolicy(path)).toEqual({
        path,
        match: "exact",
        auth: "public",
        rateLimit: "none",
        maxBodyBytes: bytes,
        input: "zod",
        cors: "self-managed",
      });
      expect(resolveRoutePolicy(`${path}/nested`)).toBeUndefined();
      expect(resolveRoutePolicy(`${path}-other`)).toBeUndefined();
    },
  );
});

// Exercise the middleware boundary as well: declared-size rejection happens before handlers.
describe("local form middleware ceilings", () => {
  it.each([
    ["/api/contact", 16384],
    ["/api/delete-request", 1024],
  ] as const)(
    "keeps %s public and its oversized response private without adding CORS",
    async (path, bytes) => {
      const { default: middleware } = await import("@/middleware");
      const { NextRequest } = await import("next/server");
      const accepted = await middleware(
        new NextRequest(`http://localhost:3011${path}`, {
          method: "POST",
          headers: {
            origin: "http://localhost:3011",
            "content-length": String(bytes),
          },
        }),
      );
      expect(accepted.status).toBe(200);
      expect(accepted.headers.get("location")).toBeNull();
      expect(accepted.headers.get("access-control-allow-origin")).toBeNull();
      const rejected = await middleware(
        new NextRequest(`http://localhost:3011${path}`, {
          method: "POST",
          headers: {
            origin: "http://localhost:3011",
            "content-length": String(bytes + 1),
          },
        }),
      );
      expect(rejected.status).toBe(413);
      expect(await rejected.json()).toEqual({
        message: "The request is too large.",
      });
      expect(rejected.headers.get("cache-control")).toBe("no-store");
      expect(rejected.headers.get("access-control-allow-origin")).toBeNull();
    },
  );
});
