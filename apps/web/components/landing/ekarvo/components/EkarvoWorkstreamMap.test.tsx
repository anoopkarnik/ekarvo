import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EkarvoWorkstreamMap } from './EkarvoWorkstreamMap';
import { computeSceneStateByIndex } from '../utils/sceneEngine';

const frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
let hidden = false;
beforeEach(() => {
  frames.clear();
  hidden = false;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function tick(time: number) {
  await act(async () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback(time)); });
}
function setup() {
  const props = {
    sceneStateRef: { current: computeSceneStateByIndex(1, 0.4) },
    renderRequestRef: { current: null as (() => void) | null },
    hoveredProduct: 'none' as const, operatingModelMode: 'autonomous' as const,
    reducedMotion: false, ambientPaused: false, modalOpen: false,
  };
  const view = render(<EkarvoWorkstreamMap {...props} />);
  const signal = () => view.container.querySelector('[data-signal-head]')?.getAttribute('transform');
  const token = () => view.container.querySelector('[data-work-item]')?.getAttribute('transform');
  return { props, ...view, signal, token };
}

describe('workstream animation lifecycle', () => {
  it('keeps a paused ambient signal in place when scroll crosses task completion', async () => {
    const view = setup();
    await tick(100); await tick(150);
    view.rerender(<EkarvoWorkstreamMap {...view.props} ambientPaused />);
    await tick(200);
    const signal = view.signal();
    view.props.sceneStateRef.current = computeSceneStateByIndex(12, 0.8);
    view.props.renderRequestRef.current?.();
    await tick(250);
    expect(view.signal()).toBe(signal);
    view.props.sceneStateRef.current = computeSceneStateByIndex(1, 0.4);
    view.props.renderRequestRef.current?.();
    await tick(300);
    expect(view.signal()).toBe(signal);
  });
  it('preserves assembled route strokes when entering platform architecture', async () => {
    const view = setup();
    view.props.sceneStateRef.current = computeSceneStateByIndex(4, 0.999);
    await tick(100);
    const offsets = () => [...view.container.querySelectorAll('[data-active-lane]')].map((lane) => Number(lane.getAttribute('stroke-dashoffset')));
    offsets().forEach((offset) => expect(offset).toBeLessThan(0.0001));
    view.props.sceneStateRef.current = computeSceneStateByIndex(5, 0);
    view.props.renderRequestRef.current?.();
    await tick(150);
    expect(offsets()).toEqual([0, 0, 0, 0, 0]);
  });
  it('moves ambient signals while preserving task progress, and pause leaves scroll working', async () => {
    const view = setup();
    await tick(100);
    const signal = view.signal(), task = view.token();
    await tick(150);
    expect(view.signal()).toBeDefined();
    expect(view.signal()).not.toBe(signal);
    expect(view.token()).toBe(task);
    view.rerender(<EkarvoWorkstreamMap {...view.props} ambientPaused />);
    await tick(200);
    const paused = view.signal();
    await tick(10000);
    expect(view.signal()).toBe(paused);
    expect(frames.size).toBe(0);
    view.props.sceneStateRef.current = computeSceneStateByIndex(7, 0.5);
    view.props.renderRequestRef.current?.();
    await tick(11000);
    expect(view.token()).not.toBe(task);
    expect(view.container.querySelector('[data-evidence]')?.getAttribute('opacity')).toBe('0');
  });
  it('suspends on hidden tabs and modals, resumes without catching up, and cleans up', async () => {
    const view = setup();
    await tick(100); await tick(150);
    const signal = view.signal();
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    await tick(10000);
    expect(view.signal()).toBe(signal);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    await tick(20000);
    expect(view.signal()).toBe(signal);
    await tick(20050);
    expect(view.signal()).not.toBe(signal);
    view.rerender(<EkarvoWorkstreamMap {...view.props} modalOpen />);
    await tick(20100);
    const modalSignal = view.signal();
    await tick(30000);
    expect(view.signal()).toBe(modalSignal);
    expect(frames.size).toBe(0);
    view.rerender(<EkarvoWorkstreamMap {...view.props} />);
    await tick(40000);
    expect(view.signal()).toBe(modalSignal);
    view.unmount();
    expect(frames.size).toBe(0);
    expect(view.props.renderRequestRef.current).toBeNull();
  });
  it('keeps a static assembled scene under reduced motion even when scrolling', async () => {
    const view = setup();
    view.rerender(<EkarvoWorkstreamMap {...view.props} reducedMotion />);
    await tick(100);
    const task = view.token();
    const station = view.container.querySelector('[data-node="pulse"]')?.getAttribute('transform');
    view.props.sceneStateRef.current = computeSceneStateByIndex(3, 0.5);
    view.props.renderRequestRef.current?.();
    await tick(200);
    expect(view.token()).toBe(task);
    expect(view.container.querySelector('[data-node="pulse"]')?.getAttribute('transform')).toBe(station);
    expect(view.container.querySelector('[data-signal]')?.getAttribute('opacity')).toBe('0');
    expect(frames.size).toBe(0);
  });
});
