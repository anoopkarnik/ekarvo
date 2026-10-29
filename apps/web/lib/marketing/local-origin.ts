const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** NextURL rewrites loopback hostnames to localhost; HTTP Host retains the
 * browser's authority. Never infer either authority or scheme from forwarding
 * headers for this direct, local-only service. */
export function isSameLocalOrigin(request: Request): boolean {
  try {
    const url = new URL(request.url);
    if (
      !loopback.has(url.hostname) ||
      !["http:", "https:"].includes(url.protocol)
    )
      return false;
    const host = request.headers.get("host");
    // Native Request callers may omit Host. An explicit invalid Host never falls back.
    if (
      host !== null &&
      !/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/i.test(host)
    )
      return false;
    const effective = new URL(`${url.protocol}//${host ?? url.host}`);
    return (
      loopback.has(effective.hostname) &&
      effective.port === url.port &&
      request.headers.get("origin") === effective.origin
    );
  } catch {
    return false;
  }
}
