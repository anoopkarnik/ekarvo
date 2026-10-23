import React, { useEffect, useRef, type RefObject } from 'react';
import { Activity, Check, Database, Globe, Inbox, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import type { ComputedSceneState } from '../utils/sceneEngine';
import { clamp, cubicPoint, displace, getAmbientSignal, getAssembly, getEvidenceReveal, getMapRoutes, getStationAction, getWorkItems, routePath, smooth, WORKSTREAM_ROUTES, type Route } from '../utils/workstream';

interface WorkstreamMapProps {
  sceneStateRef: RefObject<ComputedSceneState>;
  renderRequestRef: RefObject<(() => void) | null>;
  hoveredProduct: 'none' | 'pulse' | 'drive';
  operatingModelMode: 'fragmented' | 'connected' | 'autonomous';
  reducedMotion: boolean;
  ambientPaused: boolean;
  modalOpen: boolean;
}
interface MapNode { id: string; label: string; detail: string; x: number; y: number; Icon: LucideIcon }
const NODES: readonly MapNode[] = [
  { id: 'intake', label: 'Intake', detail: 'Work arrives', x: 125, y: 330, Icon: Inbox },
  { id: 'pulse', label: 'Pulse', detail: 'Forecast · Decide', x: 300, y: 230, Icon: Activity },
  { id: 'approval', label: 'Approval', detail: 'Policy gate', x: 455, y: 325, Icon: ShieldCheck },
  { id: 'drive', label: 'Drive', detail: 'Execute', x: 610, y: 235, Icon: Workflow },
  { id: 'systems', label: 'Systems', detail: 'CRM · ERP', x: 640, y: 420, Icon: Database },
  { id: 'verify', label: 'Verify', detail: 'Read back · Confirm', x: 415, y: 530, Icon: Check },
];

function Station({ id, label, detail, x, y, Icon }: MapNode) {
  return (
    <g data-node={id} data-active={id === 'pulse' || id === 'drive'} transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="63" ry="27" fill="#03090c" opacity="0.6" filter="url(#workstream-shadow)" />
      <path d="M-57 0 L0 32 L57 0 L57 12 L0 45 L-57 12Z" fill="#0c181e" stroke="#23343b" />
      <path className="workstream-plate" d="M-57 0 L0 -33 L57 0 L0 33Z" fill="url(#workstream-tile)" stroke="#39515a" />
      <path className="workstream-rim" d="M-46 2 L0 28 L46 2" fill="none" stroke="#64857d" strokeWidth="1.3" opacity="0.55" />
      <Icon className="workstream-glyph" x={-13} y={-22} width={26} height={26} strokeWidth={1.5} color="#a7bdb6" />
      <g data-station-action opacity="0" stroke="#a4f2dc" strokeWidth="1.5">
        {id === 'intake' && <g data-intake-card><rect x="-10" y="-16" width="20" height="25" rx="3" fill="#164c40" /><path d="M-5 -8H5 M-5 -2H3" /></g>}
        {id === 'pulse' && <path data-scan d="M-35 0L0 -20L35 0" stroke="#a4f2dc" strokeWidth="2" />}
        {id === 'approval' && <><path data-gate-left d="M-28 -11L0 5V24L-28 8Z" fill="#176b5e" /><path data-gate-right d="M0 5L28 -11V8L0 24Z" fill="#21574f" /></>}
        {id === 'drive' && <g data-dispatch><path d="M-18 -4L-8 2L-18 8 M-3 -4L7 2L-3 8 M12 -4L22 2L12 8" /></g>}
        {id === 'systems' && <path data-system-light d="M-40 0L0 -23L40 0L0 23Z" fill="#5ddec4" fillOpacity="0.12" />}
        {id === 'verify' && <path data-verify-check d="M-15 -2L-4 8L17 -13" pathLength="1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      </g>
      <ellipse data-arrival-ripple cy="1" rx="48" ry="28" stroke="#5ddec4" strokeWidth="1.5" opacity="0" />
      <circle className="workstream-status" cx="0" cy="17" r="2.5" fill="#62887b" />
      <text className="workstream-label" x="0" y="-67" textAnchor="middle" fill="#dbe8e3" fontSize="21" fontWeight="600">{label}</text>
      <text x="0" y="-44" textAnchor="middle" fill="#8baba0" fontSize="15">{detail}</text>
    </g>
  );
}

/** Scroll owns work progress; a separate, pausable clock owns decorative signals. */
export function EkarvoWorkstreamMap({ sceneStateRef, renderRequestRef, hoveredProduct, operatingModelMode, reducedMotion, ambientPaused, modalOpen }: WorkstreamMapProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef({ hoveredProduct, operatingModelMode, reducedMotion, ambientPaused, modalOpen });

  useEffect(() => {
    stateRef.current = { hoveredProduct, operatingModelMode, reducedMotion, ambientPaused, modalOpen };
    renderRequestRef.current?.();
  }, [hoveredProduct, operatingModelMode, reducedMotion, ambientPaused, modalOpen, renderRequestRef]);

  useEffect(() => {
    const svg = svgRef.current, container = mountRef.current;
    if (!svg || !container) return;
    let frame = 0;
    let disposed = false;
    let elapsed = 0;
    let previousTime: number | null = null;
    let narrow = window.innerWidth < 768;
    const all = <T extends SVGElement>(selector: string) => [...svg.querySelectorAll<T>(selector)];
    const one = <T extends SVGElement>(selector: string) => svg.querySelector<T>(selector)!;
    const tokens = all<SVGGElement>('[data-work-item]');
    const receipts = all<SVGGElement>('[data-evidence]');
    const receiptChecks = all<SVGPathElement>('[data-receipt-check]');
    const stations = all<SVGGElement>('[data-node]');
    const actions = all<SVGGElement>('[data-station-action]');
    const ripples = all<SVGEllipseElement>('[data-arrival-ripple]');
    const lanes = all<SVGPathElement>('[data-active-lane]');
    const tracks = all<SVGPathElement>('[data-track]');
    const feedback = one<SVGPathElement>('[data-feedback]');
    const branch = one<SVGPathElement>('[data-browser-route]');
    const evidenceLabel = one<SVGTextElement>('[data-evidence-label]');
    const signal = one<SVGGElement>('[data-signal]');
    const signalHead = one<SVGCircleElement>('[data-signal-head]');
    const signalTrail = one<SVGPathElement>('[data-signal-trail]');
    const scan = one<SVGPathElement>('[data-scan]');
    const intake = one<SVGGElement>('[data-intake-card]');
    const gateLeft = one<SVGPathElement>('[data-gate-left]');
    const gateRight = one<SVGPathElement>('[data-gate-right]');
    const dispatch = one<SVGGElement>('[data-dispatch]');
    const verify = one<SVGPathElement>('[data-verify-check]');
    const set = (element: SVGElement, name: string, value: string | number) => element.setAttribute(name, String(value));

    const draw = (time: number) => {
      frame = 0;
      if (disposed || document.hidden) { previousTime = null; return; }
      const state = sceneStateRef.current;
      const interaction = stateRef.current;
      const reduced = interaction.reducedMotion;
      const running = !reduced && !interaction.ambientPaused && !interaction.modalOpen;
      if (running && previousTime !== null) elapsed += Math.min(64, Math.max(0, time - previousTime));
      previousTime = running ? time : null;
      const index = reduced ? 1 : state.activeSceneIndex;
      const local = reduced ? 0 : state.sceneLocalProgress;
      const progress = reduced ? 0.12 : clamp((index - 1 + local) / 12);
      const assembly = reduced ? 0 : index === 9 && interaction.operatingModelMode === 'fragmented' ? 1 : getAssembly(index, local);
      const displacement = assembly * (narrow ? 0.5 : 1);
      const routes = getMapRoutes(displacement);
      const items = getWorkItems(progress, routes);
      const connected = !reduced && index === 9 && interaction.operatingModelMode === 'connected';
      const connectionOpacity = (1 - assembly * 0.92) * (connected ? 0.5 : 1);
      const stageOpacity = (stage: number) => stage <= 1 ? 1 : stage >= 12 ? 0.8 : stage === 4 || stage === 5 || stage === 9 ? 0.62 : 0.22;
      const blend = smooth((local - 0.65) / 0.35);
      const opacity = reduced ? 0.34 : stageOpacity(index) + (stageOpacity(index + 1) - stageOpacity(index)) * blend;
      container.style.opacity = String(opacity * (narrow ? 0.2 : 1));
      container.dataset.ambient = running ? 'running' : 'paused';
      const visibility = 1 - smooth(assembly);
      const completed = items.some((item) => item.progress > 1) && assembly < 0.01;
      const ambient = getAmbientSignal(elapsed, completed);
      const returnRoute: Route = {
        start: displace([415, 530], 5, displacement), control1: displace([175, 625], 5, displacement),
        control2: displace([5, 380], 1, displacement), end: displace([300, 230], 1, displacement),
      };
      set(feedback, 'd', routePath(returnRoute));
      set(feedback, 'opacity', (completed ? 0.7 : 0.12) * connectionOpacity);
      const drive = routes[3]!.start, verifyPosition = routes[4]!.end;
      set(branch, 'd', `M${drive.join(' ')} C635 330 520 365 460 425 C450 470 440 490 ${verifyPosition.join(' ')}`);
      set(branch, 'opacity', connectionOpacity);
      lanes.forEach((lane, i) => {
        const d = routePath(routes[i]!);
        set(lane, 'd', d); set(tracks[i]!, 'd', d);
        set(tracks[i]!, 'opacity', 0.35 + 0.65 * (1 - assembly));
        // Preserve revealed architecture after assembly, including section boundaries.
        const distance = index >= 4 ? 1 - assembly : clamp(items[0]!.progress * 5 - i);
        set(lane, 'stroke-dashoffset', 1 - distance);
        set(lane, 'opacity', connectionOpacity);
      });
      const actionStates = NODES.map((_, station) => items.reduce((best, item) => {
        const action = getStationAction(item.progress, station);
        return action.activity > best.activity ? action : best;
      }, { phase: 0, activity: 0 }));
      stations.forEach((station, i) => {
        const node = NODES[i]!;
        const position = displace([node.x, node.y], i, displacement);
        const action = actionStates[i]!;
        const amplitude = reduced ? 0 : action.activity * visibility;
        const lift = amplitude * (narrow ? 2 : 5);
        // Move station and its action together; routes remain anchored to its platform centre.
        set(station, 'transform', `translate(${position[0]} ${position[1]})`);
        set(actions[i]!, 'transform', `translate(0 ${-lift})`);
        set(actions[i]!, 'opacity', amplitude);
        const emphasis = reduced ? '' : interaction.hoveredProduct !== 'none' ? interaction.hoveredProduct
          : index === 6 ? 'pulse' : index === 7 ? 'drive' : index === 11 ? 'approval' : index >= 12 ? 'verify' : '';
        station.dataset.active = String(emphasis ? node.id === emphasis : amplitude > 0.25 || node.id === 'pulse' || node.id === 'drive');
        const receiving = ambient.routeIndex === 5 ? 1 : ambient.routeIndex + 1;
        const ripple = clamp((ambient.phase - 0.7) / 0.3);
        set(ripples[i]!, 'opacity', !reduced && receiving === i && (ambient.routeIndex !== 5 || completed) ? Math.sin(Math.PI * ripple) * 0.65 * connectionOpacity : 0);
        set(ripples[i]!, 'transform', `scale(${0.8 + ripple * (narrow ? 0.15 : 0.35)})`);
      });
      set(intake, 'transform', `translate(0 ${-20 * (1 - actionStates[0]!.phase)})`);
      set(scan, 'transform', `translate(0 ${-15 + actionStates[1]!.phase * 30})`);
      const gate = actionStates[2]!.activity * (narrow ? 9 : 16);
      set(gateLeft, 'transform', `translate(${-gate} ${-gate * 0.5})`);
      set(gateRight, 'transform', `translate(${gate} ${-gate * 0.5})`);
      set(dispatch, 'transform', `translate(${actionStates[3]!.phase * 20 - 10} 0)`);
      set(verify, 'stroke-dasharray', 1);
      set(verify, 'stroke-dashoffset', 1 - smooth(actionStates[5]!.phase));
      items.forEach((item, i) => {
        set(tokens[i]!, 'transform', `translate(${item.x} ${item.y - 11})`);
        set(tokens[i]!, 'opacity', item.status === 'active' ? visibility : 0);
        const reveal = reduced ? 0 : getEvidenceReveal(item.progress);
        set(receipts[i]!, 'opacity', reveal * visibility);
        set(receipts[i]!, 'transform', `translate(${537 + i * 13 + (1 - reveal) * 20} ${492 - i * 9 - (1 - reveal) * 16})`);
        set(receiptChecks[i]!, 'stroke-dashoffset', 1 - smooth((reveal - 0.3) / 0.7));
      });
      set(evidenceLabel, 'opacity', reduced ? 0 : getEvidenceReveal(items[0]!.progress) * visibility);
      const signalRoute = ambient.routeIndex === 5 ? returnRoute : routes[ambient.routeIndex]!;
      const point = cubicPoint(signalRoute, ambient.phase);
      const trailPoints = Array.from({ length: 6 }, (_, i) => cubicPoint(signalRoute, Math.max(0, ambient.phase - 0.13 + i * 0.026)));
      set(signalHead, 'transform', `translate(${point.x} ${point.y})`);
      set(signalTrail, 'd', trailPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' '));
      set(signal, 'opacity', reduced ? 0 : ambient.opacity * connectionOpacity);
      if (running) frame = requestAnimationFrame(draw);
    };
    const invalidate = () => { if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(draw); };
    const onResize = () => { narrow = window.innerWidth < 768; invalidate(); };
    const onVisibility = () => {
      previousTime = null;
      cancelAnimationFrame(frame); frame = 0;
      invalidate();
    };
    renderRequestRef.current = invalidate;
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    invalidate();
    void document.fonts?.ready.then(invalidate);
    return () => {
      disposed = true;
      renderRequestRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sceneStateRef, renderRequestRef]);

  return (
    <div ref={mountRef} aria-hidden="true" className="ekarvo-workstream fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 780 680" className="ekarvo-workstream-stage" fill="none">
        <defs>
          <linearGradient id="workstream-floor" x1="0" y1="0" x2="0.85" y2="1">
            <stop stopColor="#19312e" stopOpacity="0.32" /><stop offset="1" stopColor="#101b20" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="workstream-tile" x1="0" y1="0" x2="0.5" y2="1">
            <stop stopColor="#20343b" /><stop offset="1" stopColor="#111f26" />
          </linearGradient>
          <linearGradient id="workstream-tile-active" x1="0" y1="0" x2="0.5" y2="1">
            <stop stopColor="#285047" /><stop offset="1" stopColor="#123b34" />
          </linearGradient>
          <filter id="workstream-shadow" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <path d="M25 350 L390 130 L755 350 L390 600Z" fill="url(#workstream-floor)" stroke="#244039" strokeOpacity="0.65" />
        <g stroke="#2b443e" strokeWidth="1" opacity="0.35">
          {[1, 2, 3, 4, 5, 6].map((line) => <React.Fragment key={line}>
            <path d={`M${25 + line * 52} ${350 - line * 31.4} L${390 + line * 52} ${600 - line * 35.7}`} />
            <path d={`M${390 + line * 52} ${130 + line * 31.4} L${25 + line * 52} ${350 + line * 35.7}`} />
          </React.Fragment>)}
        </g>
        <path data-feedback d="M415 530 C175 625 5 380 300 230" stroke="#5ddec4" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.12" />
        <path data-browser-route d="M610 235 C635 330 520 365 460 425 C450 470 440 490 415 530" stroke="#34534b" strokeWidth="2" strokeDasharray="3 7" />
        <g>
          {WORKSTREAM_ROUTES.map((route, index) => <React.Fragment key={index}>
            <path data-track={index} d={routePath(route)} stroke="#39554d" strokeWidth="3" />
            <path data-active-lane={index} pathLength="1" strokeDasharray="1" d={routePath(route)} stroke="#5ddec4" strokeWidth="2.5" opacity="0.6" />
          </React.Fragment>)}
        </g>
        <g transform="translate(460 425)">
          <path d="M-33 0 L0 -19 L33 0 L0 19Z" fill="#11262a" stroke="#3b5d54" />
          <Globe x={-10} y={-14} width={20} height={20} color="#8fb5a9" strokeWidth={1.4} />
          <text x="0" y="-35" textAnchor="middle" fill="#8baba0" fontSize="15">Browser</text>
        </g>
        <g data-signal opacity="0">
          <path data-signal-trail stroke="#5ddec4" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
          <circle data-signal-head r="4" fill="#c2ffec" stroke="#5ddec4" strokeWidth="5" strokeOpacity="0.2" />
        </g>
        {NODES.map((node) => <Station key={node.id} {...node} />)}
        {getWorkItems(0).map((item, index) => <g key={index} data-work-item={index} transform={`translate(${item.x} ${item.y - 11})`} opacity={item.status === 'active' ? 1 : 0}>
          <ellipse cy="13" rx="12" ry="5" fill="#03090c" opacity="0.6" />
          <path d="M-10 -5 L2 -12 L13 -5 L1 2Z M-10 -5 L-10 5 L1 12 L13 5 L13 -5 L1 2 L1 12" fill="#5ddec4" stroke="#a4f2dc" strokeWidth="1.2" />
        </g>)}
        {[0, 1, 2, 3].map((index) => <g key={index} data-evidence={index} transform={`translate(${537 + index * 13} ${492 - index * 9})`} opacity="0">
          <rect x="-16" y="-23" width="32" height="40" rx="4" fill="#16382f" stroke="#5ddec4" />
          <path d="M-8 -14H5 M-8 -8H2" stroke="#8fd9c2" strokeWidth="1.5" /><path data-receipt-check d="M-8 2L-2 8L9 -4" pathLength="1" strokeDasharray="1" strokeDashoffset="1" stroke="#b3edda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>)}
        <text data-evidence-label x="537" y="553" fill="#8fd9c2" fontSize="16" opacity="0">Evidence linked</text>
      </svg>
    </div>
  );
}
