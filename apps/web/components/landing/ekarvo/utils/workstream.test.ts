import { describe, expect, it } from 'vitest';
import { cubicPoint, getWorkItems, getAssembly, getMapRoutes, getStationAction, getEvidenceReveal, getAmbientSignal } from './workstream';

describe('scroll-driven work items', () => {
  it('follows a curved route instead of cutting straight through checkpoints', () => {
    const route = { start: [0, 0], control1: [0, 10], control2: [10, 10], end: [10, 0] } as const;
    expect(cubicPoint(route, 0)).toEqual({ x: 0, y: 0 });
    expect(cubicPoint(route, 0.5)).toEqual({ x: 5, y: 7.5 });
    expect(cubicPoint(route, 1)).toEqual({ x: 10, y: 0 });
  });
  it('creates evidence only after a work item reaches verification', () => {
    expect(getWorkItems(0).filter((item) => item.status === 'verified')).toHaveLength(0);
    expect(getWorkItems(0.5).some((item) => item.status === 'active')).toBe(true);
    expect(getWorkItems(1).filter((item) => item.status === 'verified')).toHaveLength(4);
  });
  it('reverses work and evidence when scrolling back', () => {
    getWorkItems(1);
    expect(getWorkItems(0).filter((item) => item.status === 'verified')).toHaveLength(0);
    expect(getWorkItems(0.5)).toEqual(getWorkItems(0.5));
  });
});

describe('workstream choreography', () => {
  it('separates through fragmentation, holds through handoffs, and reconnects reversibly', () => {
    expect(getAssembly(1, 1)).toBe(0);
    expect(getAssembly(2, 0)).toBe(0);
    expect(getAssembly(2, 0.5)).toBeCloseTo(0.5);
    expect(getAssembly(3, 0.5)).toBe(1);
    expect(getAssembly(4, 0.5)).toBeCloseTo(0.5);
    expect(getAssembly(4, 1)).toBe(0);
    expect(getAssembly(2, 0)).toBe(0);
  });
  it('keeps adjacent routes joined to their displaced station', () => {
    const routes = getMapRoutes(1);
    expect(routes[0]!.end).toEqual([288, 210]);
    expect(routes[1]!.start).toEqual([288, 210]);
    expect(cubicPoint(routes[0]!, 1)).toEqual({ x: 288, y: 210 });
    expect(getMapRoutes(0)[0]!.end).toEqual([300, 230]);
  });
  it('opens the approval gate around an arriving task and closes it after departure', () => {
    expect(getStationAction(0.28, 2).activity).toBe(0);
    expect(getStationAction(0.4, 2).activity).toBe(1);
    expect(getStationAction(0.52, 2).activity).toBe(0);
    expect(getStationAction(0.4, 2).phase).toBeCloseTo(0.5);
  });
  it('reveals evidence only beyond verification and retracts it on reverse scroll', () => {
    expect(getEvidenceReveal(0.999)).toBe(0);
    expect(getEvidenceReveal(1)).toBe(0);
    expect(getEvidenceReveal(1.02)).toBeGreaterThan(0);
    expect(getEvidenceReveal(1.05)).toBe(1);
    expect(getEvidenceReveal(0.9)).toBe(0);
  });
  it('cycles one ambient signal without producing a return signal before completion', () => {
    expect(getAmbientSignal(5500, false).opacity).toBe(0);
    expect(getAmbientSignal(5500, true).routeIndex).toBe(5);
    expect(getAmbientSignal(3300, false)).toEqual(getAmbientSignal(3300, true));
    expect(getAmbientSignal(6500, true)).toEqual(getAmbientSignal(500, true));
  });
});
