export interface SectionAnchor { index: number; top: number }

/** Sample real section positions rather than intersection thresholds or assumed heights. */
export function sampleSectionScroll(
  scroll: number,
  viewport: number,
  height: number,
  sections: readonly SectionAnchor[],
): { index: number; progress: number } {
  const first = sections[0];
  const end = Math.max(0, height - viewport);
  if (!first || end === 0) return { index: first?.index ?? 1, progress: 0 };
  const y = Math.max(0, Math.min(end, scroll));
  const start = (i: number) => Math.max(0, Math.min(end, sections[i]!.top - (i === 0 ? 0 : viewport * 0.3)));
  for (let i = sections.length - 1; i >= 0; i--) {
    const from = start(i);
    if (y < from) continue;
    const to = i + 1 < sections.length ? start(i + 1) : end;
    return { index: sections[i]!.index, progress: to <= from ? 1 : Math.min(1, (y - from) / (to - from)) };
  }
  return { index: first.index, progress: 0 };
}
