const attempts = new Map<string, number[]>();
const windowMs = 60000;
const maxKeys = 1000;

/** Process-local only. Routes use fixed local keys; forwarded IP headers are untrusted. */
export function checkLocalFormRateLimit(
  key: string,
  now = Date.now(),
): boolean {
  for (const [storedKey, times] of attempts) {
    const active = times.filter((time) => time > now - windowMs);
    if (active.length) attempts.set(storedKey, active);
    else attempts.delete(storedKey);
  }
  const active = attempts.get(key) ?? [];
  if (active.length >= 10 || (!attempts.has(key) && attempts.size >= maxKeys))
    return false;
  active.push(now);
  attempts.set(key, active);
  return true;
}
