/** A single reversible edit. All story state is a function of scroll, never elapsed time. */
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export const ease = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function filmStateAt(progress: number) {
  const p = clamp(progress, 0, 6);
  const opened = .28 + .72 * ease(p, .15, .95);
  const alignment = ease(p, 3.15, 3.85);
  const permission = ease(p, 3.35, 3.95);
  const signal = p < 1.05 ? Math.min(.47, .22 + .25 * ease(p, 0, 1.05))
    : .47 + .53 * ease(p, 4.02, 4.9);
  return {
    progress: p,
    gap: opened * (1 - alignment),
    layers: ease(p, 1.5, 2.2) * (1 - ease(p, 2.65, 3.1)),
    permission,
    signal,
    verified: ease(p, 5.2, 5.55),
    wide: ease(p, 5.4, 6),
  };
}
