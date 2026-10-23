import { describe, expect, it } from 'vitest';
import { sampleSectionScroll } from './scrollScene';

const sections = [{ index: 1, top: 0 }, { index: 2, top: 1000 }, { index: 3, top: 2600 }];
const sample = (scroll: number) => sampleSectionScroll(scroll, 1000, 4000, sections);

describe('section-driven ribbon progress', () => {
  it('starts at the hero and advances continuously through an unequal section', () => {
    expect(sample(0)).toEqual({ index: 1, progress: 0 });
    expect(sample(350)).toEqual({ index: 1, progress: 0.5 });
    expect(sample(700)).toEqual({ index: 2, progress: 0 });
    expect(sample(1500)).toEqual({ index: 2, progress: 0.5 });
  });
  it('reverses and supports a jump into the middle of the page', () => {
    sample(2700);
    expect(sample(1500)).toEqual({ index: 2, progress: 0.5 });
    expect(sample(350)).toEqual({ index: 1, progress: 0.5 });
  });
  it('reaches the final pose and clamps browser overscroll', () => {
    expect(sample(-100)).toEqual({ index: 1, progress: 0 });
    expect(sample(2650)).toEqual({ index: 3, progress: 0.5 });
    expect(sample(9000)).toEqual({ index: 3, progress: 1 });
  });
  it('handles a short page or an absent section measurement', () => {
    expect(sampleSectionScroll(0, 1000, 800, [{ index: 1, top: 0 }])).toEqual({ index: 1, progress: 0 });
    expect(sampleSectionScroll(0, 1000, 800, [])).toEqual({ index: 1, progress: 0 });
  });
});
