type Point = readonly [number, number];
export interface Route { start: Point; control1: Point; control2: Point; end: Point }
export const WORKSTREAM_ROUTES: readonly Route[] = [
  { start: [125, 330], control1: [180, 330], control2: [245, 260], end: [300, 230] },
  { start: [300, 230], control1: [350, 250], control2: [410, 300], end: [455, 325] },
  { start: [455, 325], control1: [505, 310], control2: [550, 255], end: [610, 235] },
  { start: [610, 235], control1: [690, 280], control2: [690, 360], end: [640, 420] },
  { start: [640, 420], control1: [600, 465], control2: [485, 495], end: [415, 530] },
];

export function cubicPoint(route: Route, progress: number): { x: number; y: number } {
  const t = Math.max(0, Math.min(1, progress)), s = 1 - t;
  const coordinate = (axis: 0 | 1) => s ** 3 * route.start[axis] + 3 * s ** 2 * t * route.control1[axis]
    + 3 * s * t ** 2 * route.control2[axis] + t ** 3 * route.end[axis];
  return { x: coordinate(0), y: coordinate(1) };
}
export function routePath(route: Route): string {
  return `M${route.start.join(' ')} C${route.control1.join(' ')} ${route.control2.join(' ')} ${route.end.join(' ')}`;
}

export function getWorkItems(progress: number, routes: readonly Route[] = WORKSTREAM_ROUTES) {
  const phase = Math.max(0, Math.min(1, progress));
  return Array.from({ length: 4 }, (_, index) => {
    const distance = phase * 1.25 + 0.1 - index * 0.1;
    const position = Math.max(0, Math.min(1, distance)) * WORKSTREAM_ROUTES.length;
    const routeIndex = Math.min(WORKSTREAM_ROUTES.length - 1, Math.floor(position));
    return {
      ...cubicPoint(routes[routeIndex]!, position - routeIndex),
      progress: distance,
      status: distance < 0 ? 'queued' as const : distance >= 1 ? 'verified' as const : 'active' as const,
    };
  });
}

export const STATION_OFFSETS: readonly Point[] = [[-24, 14], [-12, -20], [0, 24], [20, -20], [24, 14], [-12, 24]];
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** 0 is assembled; 1 is fragmented. Pure scroll sampling makes jumps and reversals exact. */
export function getAssembly(index: number, progress: number) {
  if (index === 2) return smooth(progress);
  if (index === 3) return 1;
  if (index === 4) return 1 - smooth(progress);
  return 0;
}

export function displace(point: Point, station: number, amount: number): Point {
  const offset = STATION_OFFSETS[station]!;
  return [point[0] + offset[0] * amount, point[1] + offset[1] * amount];
}

export function getMapRoutes(amount: number): Route[] {
  return WORKSTREAM_ROUTES.map((route, index) => ({
    start: displace(route.start, index, amount),
    control1: displace(route.control1, index, amount),
    control2: displace(route.control2, index + 1, amount),
    end: displace(route.end, index + 1, amount),
  }));
}

/** A task activates a station only while passing its checkpoint. */
export function getStationAction(taskProgress: number, station: number) {
  const phase = clamp((taskProgress - station / 5 + 0.08) / 0.16);
  return { phase, activity: phase === 0 || phase === 1 ? 0 : Math.sin(Math.PI * phase) ** 2 };
}

export function getEvidenceReveal(taskProgress: number) {
  return smooth((taskProgress - 1) / 0.045);
}

/** Decorative activity has its own clock and never changes work-item progress. */
export function getAmbientSignal(elapsedMs: number, completed: boolean) {
  const position = (elapsedMs % 6000) / 1000;
  const routeIndex = Math.floor(position);
  const phase = position - routeIndex;
  return { routeIndex, phase, opacity: routeIndex === 5 && !completed ? 0 : smooth(phase / 0.12) * (1 - smooth((phase - 0.9) / 0.1)) };
}
