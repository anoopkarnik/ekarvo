export interface SceneConfig {
  index: number;
  id: string;
  code: string;
  sectionLabel: string;
  title: string;
  subtitle: string;
  scrollWeight: number;
  entryThemeProgress: number;
  exitThemeProgress: number;
  cameraTarget: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };
  networkMode:
    | 'arrival'
    | 'hero'
    | 'fragmented'
    | 'columns'
    | 'shift'
    | 'dual_sculptures'
    | 'pulse_instrument'
    | 'drive_engine'
    | 'simulation'
    | 'transformation'
    | 'atlas'
    | 'trust_layers'
    | 'resolved';
  signalCohesion: number;
}

export const SCENES: SceneConfig[] = [
  {
    index: 0,
    id: 'scene-00',
    code: '00',
    sectionLabel: 'Introduction',
    title: 'EKARVO',
    subtitle: 'Autonomous Enterprise Operations',
    scrollWeight: 0.4,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0, 14], lookAt: [0, 0, 0], fov: 45 },
    networkMode: 'arrival',
    signalCohesion: 0.35,
  },
  {
    index: 1,
    id: 'scene-01',
    code: '01',
    sectionLabel: 'Overview',
    title: 'See the work. Move the work.',
    subtitle: 'Understand operations, decide, execute, verify.',
    scrollWeight: 1.5,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [-1.8, 0.4, 9.5], lookAt: [1.6, 0, 0], fov: 48 },
    networkMode: 'hero',
    signalCohesion: 0.45,
  },
  {
    index: 2,
    id: 'scene-02',
    code: '02',
    sectionLabel: 'Operational Fragmentation',
    title: "Work doesn't live in one system.",
    subtitle: 'The cost is in the gaps between teams and tools.',
    scrollWeight: 1.8,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 1.2, 13.5], lookAt: [0, -0.4, 0], fov: 54 },
    networkMode: 'fragmented',
    signalCohesion: 0.12,
  },
  {
    index: 3,
    id: 'scene-03',
    code: '03',
    sectionLabel: 'The Handoff Gap',
    title: 'More tools. Same handoffs.',
    subtitle: 'Who connects the decision to the action?',
    scrollWeight: 1.7,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.5, 12], lookAt: [0, 0, 0], fov: 50 },
    networkMode: 'columns',
    signalCohesion: 0.25,
  },
  {
    index: 4,
    id: 'scene-04',
    code: '04',
    sectionLabel: 'Closed-Loop Architecture',
    title: 'What if the system could close the loop?',
    subtitle: 'Introducing EKARVO.',
    scrollWeight: 1.8,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.2, 10.5], lookAt: [0, 0, 0], fov: 46 },
    networkMode: 'shift',
    signalCohesion: 0.85,
  },
  {
    index: 5,
    id: 'scene-05',
    code: '05',
    sectionLabel: 'Platform Architecture',
    title: 'Intelligence Meets Execution.',
    subtitle: 'Two platforms. One connected operating model.',
    scrollWeight: 2.3,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.3, 11.2], lookAt: [0, 0, 0], fov: 46 },
    networkMode: 'dual_sculptures',
    signalCohesion: 0.92,
  },
  {
    index: 6,
    id: 'scene-06',
    code: '06',
    sectionLabel: 'EKARVO Pulse',
    title: 'Know the operation. Change the outcome.',
    subtitle: 'EKARVO Pulse: The Operating Intelligence Platform',
    scrollWeight: 3.2,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [-2.8, 0.6, 8.2], lookAt: [-1.5, 0, 0], fov: 42 },
    networkMode: 'pulse_instrument',
    signalCohesion: 0.94,
  },
  {
    index: 7,
    id: 'scene-07',
    code: '07',
    sectionLabel: 'EKARVO Drive',
    title: "Work doesn't stop at a recommendation.",
    subtitle: 'EKARVO Drive: The Autonomous Execution Platform',
    scrollWeight: 3.2,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [2.4, 0.4, 8.5], lookAt: [1.2, 0, 0], fov: 48 },
    networkMode: 'drive_engine',
    signalCohesion: 0.96,
  },
  {
    index: 8,
    id: 'scene-08',
    code: '08',
    sectionLabel: 'Closed-Loop Workflows',
    title: 'From Signal to Outcome.',
    subtitle: 'Watch intelligence become verified action across any operation.',
    scrollWeight: 2.6,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.8, 12.5], lookAt: [0, 0, 0], fov: 44 },
    networkMode: 'simulation',
    signalCohesion: 0.98,
  },
  {
    index: 9,
    id: 'scene-09',
    code: '09',
    sectionLabel: 'Operating Model Evolution',
    title: 'Not just automated tasks. A better way to operate.',
    subtitle: 'Human judgment. Digital execution. One coordinated operation.',
    scrollWeight: 1.7,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 1.8, 13.0], lookAt: [0, 0, 0], fov: 50 },
    networkMode: 'transformation',
    signalCohesion: 0.95,
  },
  {
    index: 10,
    id: 'scene-10',
    code: '10',
    sectionLabel: 'Capability Architecture',
    title: 'One platform vision. Purpose-built capabilities.',
    subtitle: '27 modular capabilities across Pulse and Drive.',
    scrollWeight: 1.6,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.4, 11.8], lookAt: [0, 0, 0], fov: 46 },
    networkMode: 'atlas',
    signalCohesion: 0.97,
  },
  {
    index: 11,
    id: 'scene-11',
    code: '11',
    sectionLabel: 'Enterprise Governance',
    title: 'Autonomy without losing control.',
    subtitle: 'Context, Authority, Execution, and Verification.',
    scrollWeight: 1.6,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0.6, 10.2], lookAt: [0, 0, 0], fov: 44 },
    networkMode: 'trust_layers',
    signalCohesion: 0.99,
  },
  {
    index: 12,
    id: 'scene-12',
    code: '12',
    sectionLabel: 'Get Started',
    title: 'Work. Done. Verified.',
    subtitle: 'Bring intelligence and execution together with EKARVO.',
    scrollWeight: 1.4,
    entryThemeProgress: 0,
    exitThemeProgress: 0,
    cameraTarget: { pos: [0, 0, 10.5], lookAt: [0, 0, 0], fov: 45 },
    networkMode: 'resolved',
    signalCohesion: 1.0,
  },
];

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function interpolateHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const clamped = clamp(t, 0, 1);
  return rgbToHex(lerp(r1, r2, clamped), lerp(g1, g2, clamped), lerp(b1, b2, clamped));
}

export interface ComputedSceneState {
  globalProgress: number;
  activeSceneIndex: number;
  activeScene: SceneConfig;
  sceneLocalProgress: number;
  themeProgress: number;
  isLightDominant: boolean;
  colors: {
    bgHex: string;
    surfaceHex: string;
    borderHex: string;
    textPrimaryHex: string;
    textSecondaryHex: string;
    accentHex: string;
  };
  camera: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };
  signalCohesion: number;
}

export function computeSceneStateByIndex(
  sceneIndexInput: number,
  localProgressInput: number
): ComputedSceneState {
  const activeSceneIndex = clamp(Math.round(sceneIndexInput), 0, SCENES.length - 1);
  const sceneLocalProgress = clamp(localProgressInput, 0, 1);
  const activeScene = SCENES[activeSceneIndex]!;
  const nextScene = SCENES[Math.min(activeSceneIndex + 1, SCENES.length - 1)]!;

  const rawThemeProgress = lerp(
    activeScene.entryThemeProgress,
    activeScene.exitThemeProgress,
    sceneLocalProgress
  );

  const isLightDominant = rawThemeProgress >= 0.5;
  const themeProgress = isLightDominant
    ? lerp(0.84, 1.0, (rawThemeProgress - 0.5) * 2)
    : lerp(0.0, 0.16, rawThemeProgress * 2);

  const bgHex = interpolateHex('#090D11', '#F7F8F5', themeProgress);
  const surfaceHex = interpolateHex('#121A20', '#FFFFFF', themeProgress);
  const borderHex = interpolateHex('#26333C', '#DCE3DF', themeProgress);

  const textPrimaryHex = isLightDominant ? '#172127' : '#EEF3F0';
  const textSecondaryHex = isLightDominant ? '#495861' : '#8C9A9F';
  const accentHex = isLightDominant ? '#176B5E' : '#5DDEC4';

  const blendCamera = clamp((sceneLocalProgress - 0.7) / 0.3, 0, 1);
  const cameraPos: [number, number, number] = [
    lerp(activeScene.cameraTarget.pos[0], nextScene.cameraTarget.pos[0], blendCamera),
    lerp(activeScene.cameraTarget.pos[1], nextScene.cameraTarget.pos[1], blendCamera),
    lerp(activeScene.cameraTarget.pos[2], nextScene.cameraTarget.pos[2], blendCamera),
  ];
  const cameraLookAt: [number, number, number] = [
    lerp(activeScene.cameraTarget.lookAt[0], nextScene.cameraTarget.lookAt[0], blendCamera),
    lerp(activeScene.cameraTarget.lookAt[1], nextScene.cameraTarget.lookAt[1], blendCamera),
    lerp(activeScene.cameraTarget.lookAt[2], nextScene.cameraTarget.lookAt[2], blendCamera),
  ];
  const cameraFov = lerp(activeScene.cameraTarget.fov, nextScene.cameraTarget.fov, blendCamera);

  const signalCohesion = lerp(
    activeScene.signalCohesion,
    nextScene.signalCohesion,
    sceneLocalProgress
  );

  const globalProgress = clamp(
    (activeSceneIndex + sceneLocalProgress) / SCENES.length,
    0,
    1
  );

  return {
    globalProgress,
    activeSceneIndex,
    activeScene,
    sceneLocalProgress,
    themeProgress,
    isLightDominant,
    colors: {
      bgHex,
      surfaceHex,
      borderHex,
      textPrimaryHex,
      textSecondaryHex,
      accentHex,
    },
    camera: {
      pos: cameraPos,
      lookAt: cameraLookAt,
      fov: cameraFov,
    },
    signalCohesion,
  };
}

export function computeSceneStateFromScroll(globalProgressInput: number): ComputedSceneState {
  const globalProgress = clamp(globalProgressInput, 0, 1);
  const totalWeight = SCENES.reduce((acc, s) => acc + s.scrollWeight, 0);
  const targetWeight = globalProgress * totalWeight;

  let accumulated = 0;
  let activeSceneIndex = 0;
  let sceneLocalProgress = 0;

  for (let i = 0; i < SCENES.length; i++) {
    const w = SCENES[i]!.scrollWeight;
    if (targetWeight <= accumulated + w || i === SCENES.length - 1) {
      activeSceneIndex = i;
      sceneLocalProgress = w > 0 ? clamp((targetWeight - accumulated) / w, 0, 1) : 0;
      break;
    }
    accumulated += w;
  }

  const state = computeSceneStateByIndex(activeSceneIndex, sceneLocalProgress);
  return {
    ...state,
    globalProgress,
  };
}

// --- OPERATIONAL FRAGMENTATION DOMAINS (INDUSTRY AGNOSTIC) ---
export interface OperationalDomain {
  id: string;
  name: string;
  visualRepresentation: string;
  attemptedTarget: string;
  gapAnnotation: string;
  queueDepth: number;
  latencyLabel: string;
  description: string;
}

export const FRAGMENTATION_DOMAINS: OperationalDomain[] = [
  {
    id: 'demand',
    name: 'Demand',
    visualRepresentation: 'Incoming work across digital channels, APIs, and service queues',
    attemptedTarget: 'Capacity',
    gapAnnotation: 'Capacity blind spot',
    queueDepth: 1420,
    latencyLabel: 'Delayed intake routing',
    description:
      'Work arrives across customer portals, service desks, and partner feeds without live visibility into which teams or systems have available capacity.',
  },
  {
    id: 'workforce',
    name: 'Workforce',
    visualRepresentation: 'Human teams and specialist groups across functions',
    attemptedTarget: 'Execution',
    gapAnnotation: 'Manual handoff required',
    queueDepth: 860,
    latencyLabel: 'Context lost across tools',
    description:
      'Specialists switch between multiple applications, emails, and spreadsheets just to assemble the context needed to make a single decision.',
  },
  {
    id: 'capacity',
    name: 'Capacity',
    visualRepresentation: 'Resource allocation and skill availability',
    attemptedTarget: 'Performance',
    gapAnnotation: 'Static schedules',
    queueDepth: 610,
    latencyLabel: 'Disconnected from live volume',
    description:
      'Staffing plans remain locked in static forecasts while real-time workload shifts across regions, queues, and priority tiers.',
  },
  {
    id: 'performance',
    name: 'Performance',
    visualRepresentation: 'Service level and throughput telemetry',
    attemptedTarget: 'Quality',
    gapAnnotation: 'Measured after the fact',
    queueDepth: 940,
    latencyLabel: 'Retrospective reporting',
    description:
      'Dashboards explain service level misses only after delivery windows have already closed and commitments have been impacted.',
  },
  {
    id: 'quality',
    name: 'Quality',
    visualRepresentation: 'Compliance and accuracy verification',
    attemptedTarget: 'Knowledge',
    gapAnnotation: 'Small sample audits',
    queueDepth: 530,
    latencyLabel: 'Unverified output',
    description:
      'Quality teams review only a small fraction of completed transactions days or weeks after the work has already left the queue.',
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    visualRepresentation: 'Enterprise policies and operating procedures',
    attemptedTarget: 'Workforce',
    gapAnnotation: 'Policy drift',
    queueDepth: 390,
    latencyLabel: 'Static documentation',
    description:
      'Operating procedures live in disconnected documents and wikis rather than guiding human and digital execution in real time.',
  },
  {
    id: 'execution',
    name: 'Execution',
    visualRepresentation: 'Cross-system actions and task completion',
    attemptedTarget: 'Demand',
    gapAnnotation: 'Outcome unconfirmed',
    queueDepth: 1780,
    latencyLabel: 'Isolated task scripts',
    description:
      'Task automations trigger isolated steps without verifying whether the end-to-end business outcome actually succeeded in the system of record.',
  },
];

// --- ISOLATED TOOL CATEGORIES ---
export interface ToolCategory {
  id: string;
  category: string;
  headline: string;
  supportingMessage: string;
  motionIdentity: string;
  whatItSolves: string;
  unresolvedHandoff: string;
}

export const TOOL_GALLERY_ITEMS: ToolCategory[] = [
  {
    id: 'analytics',
    category: 'Analytics',
    headline: 'SEE',
    supportingMessage: 'Know what happened.',
    motionIdentity: 'Historical data points organize into trend charts.',
    whatItSolves: 'Surfaces historical throughput, service level trends, and regional backlog patterns.',
    unresolvedHandoff:
      'Insight stops at the dashboard. Operations leaders still have to interpret the chart and reallocate work manually.',
  },
  {
    id: 'planning',
    category: 'Planning',
    headline: 'PLAN',
    supportingMessage: 'Prepare resources and schedules.',
    motionIdentity: 'Workforce and demand blocks align into schedules.',
    whatItSolves: 'Models headcount requirements and builds shift rosters ahead of time.',
    unresolvedHandoff:
      'Plans do not execute work. When intraday exceptions surge, static schedules cannot clear the backlog on their own.',
  },
  {
    id: 'automation',
    category: 'Automation',
    headline: 'REPEAT',
    supportingMessage: 'Execute predefined tasks.',
    motionIdentity: 'A rigid script runs along a fixed single-system track.',
    whatItSolves: 'Completes deterministic keystrokes and single-screen form transfers.',
    unresolvedHandoff:
      'Stalls when interfaces change, exceptions arise, or cross-system judgment is required.',
  },
  {
    id: 'assistants',
    category: 'AI Assistants',
    headline: 'ASSIST',
    supportingMessage: 'Help people reason and draft.',
    motionIdentity: 'A conversational prompt generates a text summary.',
    whatItSolves: 'Drafts responses, summarizes documents, and answers employee questions.',
    unresolvedHandoff:
      'Produces text in a chat window, leaving the employee to copy, paste, execute across systems, and verify the result.',
  },
];

// --- EKARVO PULSE: CAPACITY & INTERVENTION MODELING (INDUSTRY AGNOSTIC) ---
export interface PulseAllocationTeam {
  team: string;
  qualifiedSkill: string;
  baseCapacity: number;
  forecastDemand: number;
  allocatedUnits: number;
  slaExposurePct: number;
}

export interface PulseInterventionResult {
  interventionId: string;
  label: string;
  summary: string;
  slaExposureBefore: number;
  slaExposureAfter: number;
  projectedBacklogDelta: number;
  unitCostImpact: string;
  teams: PulseAllocationTeam[];
}

export function simulateCapacityIntervention(interventionId: string): PulseInterventionResult {
  const baselineTeams: PulseAllocationTeam[] = [
    {
      team: 'Core Operations Group A',
      qualifiedSkill: 'Multi-System Exception Resolution',
      baseCapacity: 420,
      forecastDemand: 580,
      allocatedUnits: 420,
      slaExposurePct: 27.6,
    },
    {
      team: 'Operations Group B',
      qualifiedSkill: 'Standard Intake & Validation',
      baseCapacity: 500,
      forecastDemand: 390,
      allocatedUnits: 390,
      slaExposurePct: 4.2,
    },
    {
      team: 'Digital Worker Fleet (Drive)',
      qualifiedSkill: 'Autonomous Cross-System Execution',
      baseCapacity: 300,
      forecastDemand: 250,
      allocatedUnits: 250,
      slaExposurePct: 1.5,
    },
  ];

  if (interventionId === 'redistribute') {
    return {
      interventionId: 'redistribute',
      label: 'Rebalance cross-trained capacity',
      summary:
        'Reassigns 85 cross-qualified specialists from Group B to Group A during peak demand hours.',
      slaExposureBefore: 27.6,
      slaExposureAfter: 11.4,
      projectedBacklogDelta: -95,
      unitCostImpact: '-4.2% overtime avoidance',
      teams: [
        { ...baselineTeams[0]!, baseCapacity: 505, allocatedUnits: 505, slaExposurePct: 11.4 },
        { ...baselineTeams[1]!, baseCapacity: 415, allocatedUnits: 390, slaExposurePct: 5.8 },
        baselineTeams[2]!,
      ],
    };
  }

  if (interventionId === 'route_drive') {
    return {
      interventionId: 'route_drive',
      label: 'Delegate eligible workflows to Drive',
      summary:
        'Routes 145 repeatable multi-system verification tasks from Group A to governed Drive digital workers.',
      slaExposureBefore: 27.6,
      slaExposureAfter: 3.1,
      projectedBacklogDelta: -145,
      unitCostImpact: '-18.5% unit cost reduction',
      teams: [
        { ...baselineTeams[0]!, forecastDemand: 435, allocatedUnits: 420, slaExposurePct: 3.1 },
        baselineTeams[1]!,
        {
          ...baselineTeams[2]!,
          baseCapacity: 450,
          forecastDemand: 395,
          allocatedUnits: 395,
          slaExposurePct: 0.8,
        },
      ],
    };
  }

  return {
    interventionId: 'baseline',
    label: 'Unadjusted baseline plan',
    summary:
      'Current operating schedule without cross-team rebalancing or autonomous workflow delegation.',
    slaExposureBefore: 27.6,
    slaExposureAfter: 27.6,
    projectedBacklogDelta: 0,
    unitCostImpact: 'Baseline unit economics',
    teams: baselineTeams,
  };
}

// --- EKARVO DRIVE: 6 EXECUTION CHANNELS (INDUSTRY AGNOSTIC) ---
export interface DriveChannelSpec {
  id: string;
  channel: string;
  title: string;
  visualBehavior: string;
  targetSystem: string;
  traceSteps: string[];
  validationStatus: string;
  sampleArtifact: {
    header: string;
    lines: { label: string; value: string; status: 'verified' | 'review' | 'active' }[];
  };
}

export const DRIVE_CHANNELS: DriveChannelSpec[] = [
  {
    id: 'voice',
    channel: 'Voice AI',
    title: 'SPEAK',
    visualBehavior:
      'Executes structured inbound and outbound voice interactions when digital APIs are unavailable',
    targetSystem: 'External Partner & Service Voice Lines',
    traceSteps: [
      'Navigate automated phone trees and authenticate within policy scope',
      'Conduct natural, objective-driven dialogue to confirm status or schedules',
      'Capture structured disposition fields in real time',
      'Attach verified transcript to the unified workflow state',
    ],
    validationStatus: 'Voice disposition confirmed and structured',
    sampleArtifact: {
      header: 'VOICE CHANNELCAPABILITIES',
      lines: [
        {
          label: 'Interaction Scope',
          value: 'Automated IVR navigation and live agent status confirmation',
          status: 'verified',
        },
        {
          label: 'Policy Guardrail',
          value: 'Operates strictly within approved script and disclosure boundaries',
          status: 'verified',
        },
        {
          label: 'State Output',
          value: 'Structured fields written directly to the active work item',
          status: 'verified',
        },
      ],
    },
  },
  {
    id: 'browser',
    channel: 'Browser automation',
    title: 'NAVIGATE',
    visualBehavior:
      'Navigates external web portals and partner applications resiliently across layout changes',
    targetSystem: 'External Partner, Supplier & Customer Web Portals',
    traceSteps: [
      'Verify target domain against enterprise allowlist and inject managed credentials',
      'Navigate multi-step web workflows using semantic and visual anchors',
      'Extract required status records, schedules, or supporting files',
      'Confirm post-submission page state before closing session',
    ],
    validationStatus: 'Portal session state verified',
    sampleArtifact: {
      header: 'BROWSER CHANNEL CAPABILITIES',
      lines: [
        {
          label: 'Navigation Mode',
          value: 'Semantic DOM understanding combined with visual layout resilience',
          status: 'verified',
        },
        {
          label: 'Access Control',
          value: 'Zero-trust vault credential injection without exposing secrets',
          status: 'verified',
        },
        {
          label: 'Verification',
          value: 'Captures confirmation states before marking step complete',
          status: 'verified',
        },
      ],
    },
  },
  {
    id: 'connect',
    channel: 'Enterprise connectivity',
    title: 'CONNECT',
    visualBehavior:
      'Orchestrates high-reliability API, webhook, and database transactions across core systems',
    targetSystem: 'ERP, CRM, Service Management & Core Databases',
    traceSteps: [
      'Acquire scoped, short-lived authorization token from the Authority Layer',
      'Validate payload schema against enterprise data contracts',
      'Execute idempotent read and write transactions across endpoints',
      'Verify persistence in the target system of record',
    ],
    validationStatus: 'Idempotent system writeback confirmed',
    sampleArtifact: {
      header: 'CONNECTIVITY CHANNEL CAPABILITIES',
      lines: [
        {
          label: 'Protocol Support',
          value: 'REST, GraphQL, EDI, event streams, and core enterprise adapters',
          status: 'verified',
        },
        {
          label: 'Reliability',
          value: 'Built-in idempotency, schema validation, and transactional rollback',
          status: 'verified',
        },
        {
          label: 'Verification',
          value: 'Post-write readback confirms target record state',
          status: 'verified',
        },
      ],
    },
  },
  {
    id: 'document',
    channel: 'Document intelligence',
    title: 'UNDERSTAND',
    visualBehavior:
      'Transforms unstructured documents, forms, and attachments into validated structured data',
    targetSystem: 'Contracts, Invoices, Statements, Forms & Attachments',
    traceSteps: [
      'Ingest multi-page documents and classify layout sections',
      'Extract line-item tables, terms, and key operational identifiers',
      'Cross-check extracted values against system-of-record rules',
      'Route any policy or tolerance variance to human review',
    ],
    validationStatus: 'Fields validated against business rules',
    sampleArtifact: {
      header: 'DOCUMENT CHANNEL CAPABILITIES',
      lines: [
        {
          label: 'Extraction Depth',
          value: 'Multi-page tables, unstructured clauses, and cross-document matching',
          status: 'verified',
        },
        {
          label: 'Validation Logic',
          value: 'Mathematical and policy reconciliation against master records',
          status: 'verified',
        },
        {
          label: 'Exception Routing',
          value: 'Out-of-tolerance variances automatically flagged for review',
          status: 'review',
        },
      ],
    },
  },
  {
    id: 'communicate',
    channel: 'Communications',
    title: 'COMMUNICATE',
    visualBehavior:
      'Coordinates structured messages, notifications, and approvals across enterprise channels',
    targetSystem: 'Email, Collaboration Platforms & Case Queues',
    traceSteps: [
      'Assemble context-grounded updates from verified workflow outcomes',
      'Enforce data redaction and communication policy guardrails',
      'Stage sensitive external messages for supervisor sign-off when required',
      'Dispatch communication and log delivery confirmation to the workflow timeline',
    ],
    validationStatus: 'Policy-checked communication delivered',
    sampleArtifact: {
      header: 'COMMUNICATIONS CHANNEL CAPABILITIES',
      lines: [
        {
          label: 'Data Protection',
          value: 'Automated sensitive-field redaction and policy filtering',
          status: 'verified',
        },
        {
          label: 'Governance',
          value: 'Clear separation between staged drafts and authorized dispatches',
          status: 'verified',
        },
        {
          label: 'Continuity',
          value: 'Every outbound update links back to the originating workflow',
          status: 'verified',
        },
      ],
    },
  },
  {
    id: 'desktop',
    channel: 'Desktop automation',
    title: 'INTERACT',
    visualBehavior:
      'Operates legacy thick-client, virtual desktop, and terminal applications that lack modern APIs',
    targetSystem: 'Legacy Desktop Apps, VDI Environments & Terminals',
    traceSteps: [
      'Attach to isolated virtual desktop session with scoped permissions',
      'Locate target application fields using visual and structural anchors',
      'Execute bounded input sequences and transaction commits',
      'Verify on-screen confirmation state and close the session cleanly',
    ],
    validationStatus: 'Desktop interface state confirmed',
    sampleArtifact: {
      header: 'DESKTOP CHANNEL CAPABILITIES',
      lines: [
        {
          label: 'Environment',
          value: 'Runs inside isolated virtual desktop and legacy client sandboxes',
          status: 'verified',
        },
        {
          label: 'Bounded Control',
          value: 'Restricted to approved screens, fields, and action sequences',
          status: 'verified',
        },
        {
          label: 'State Assurance',
          value: 'Confirms post-commit screen state before completing task',
          status: 'verified',
        },
      ],
    },
  },
];

// --- CLOSED-LOOP WORKFLOW EXPLORER (INDUSTRY AGNOSTIC) ---
export interface EvidenceRecord {
  eventId: string;
  stepName: string;
  timestamp: string;
  status: 'Confirmed' | 'Authorized' | 'Review Required';
  objective: string;
  authorizedAction: string;
  actualResult: string;
  verificationEvidence: string;
}

export interface SimulationScenario {
  id: 'claims' | 'support' | 'finance';
  name: string;
  domainLabel: string;
  queueName: string;
  signalAlert: string;
  riskExposure: string;
  backlogCount: number;
  eligibleForDriveCount: number;
  recommendationTitle: string;
  recommendationAssumptions: string;
  interventions: {
    id: string;
    name: string;
    costLabel: string;
    throughputLabel: string;
    slaRiskLabel: string;
    recommended?: boolean;
  }[];
  policyConditions: {
    rule: string;
    status: 'PERMITTED' | 'RESTRICTED';
  }[];
  executionSteps: {
    stepNumber: number;
    phase: 'DETECT' | 'UNDERSTAND' | 'SIMULATE' | 'AUTHORIZE' | 'EXECUTE' | 'VERIFY' | 'LEARN';
    title: string;
    owner: 'Pulse' | 'Drive' | 'Human + Authority' | 'Pulse + Drive';
    channelUsed?: string;
    detail: string;
    stateLabel: string;
  }[];
  evidenceTrail: EvidenceRecord[];
}

export const SIMULATION_SCENARIOS: Record<'claims' | 'support' | 'finance', SimulationScenario> = {
  claims: {
    id: 'claims',
    name: 'Service & Case Operations',
    domainLabel: 'Multi-System Case Resolution & SLA Management',
    queueName: 'Multi-System Case Resolution Queue',
    signalAlert: 'Intraday volume trending +34% above 14-day baseline',
    riskExposure: 'Service level commitment window at risk within 48 hours',
    backlogCount: 1240,
    eligibleForDriveCount: 780,
    recommendationTitle: 'Delegate repeatable status and verification cases to Drive.',
    recommendationAssumptions:
      '63% of queued cases require standard cross-system status retrieval and record validation without specialist judgment. Delegating eligible cases preserves human specialists for complex escalations.',
    interventions: [
      {
        id: 'staff-reallocate',
        name: 'Rebalance work across cross-trained specialist teams',
        costLabel: 'Standard unit cost',
        throughputLabel: '+15% throughput',
        slaRiskLabel: '14.2% SLA exposure remains',
      },
      {
        id: 'temp-capacity',
        name: 'Add temporary overtime capacity',
        costLabel: '+45% unit cost',
        throughputLabel: '+25% throughput',
        slaRiskLabel: '8.5% SLA exposure remains',
      },
      {
        id: 'hybrid-drive',
        name: 'Combine team rebalancing with Drive autonomous execution',
        costLabel: '-68% unit cost',
        throughputLabel: '+3.2x throughput',
        slaRiskLabel: '1.2% SLA exposure (Verified)',
        recommended: true,
      },
    ],
    policyConditions: [
      { rule: 'Retrieve status and supporting documents across approved portals', status: 'PERMITTED' },
      { rule: 'Update case disposition fields in the core system of record', status: 'PERMITTED' },
      { rule: 'High-value financial adjustments above policy threshold', status: 'RESTRICTED' },
    ],
    executionSteps: [
      {
        stepNumber: 1,
        phase: 'DETECT',
        title: 'Pulse detects rising queue pressure against service commitments',
        owner: 'Pulse',
        detail:
          'Demand forecasting and capacity telemetry identify a growing backlog before service level targets are breached.',
        stateLabel: 'Signal Isolated',
      },
      {
        stepNumber: 2,
        phase: 'UNDERSTAND',
        title: 'Pulse segments workload by complexity and automation eligibility',
        owner: 'Pulse',
        detail:
          'Separates repeatable cross-system verification tasks from complex cases that require human specialist judgment.',
        stateLabel: 'Workload Segmented',
      },
      {
        stepNumber: 3,
        phase: 'SIMULATE',
        title: 'Compare staffing and execution options before acting',
        owner: 'Pulse',
        detail:
          'Models the impact of team reallocation versus blended human and digital execution on cost, speed, and SLA recovery.',
        stateLabel: 'Options Modeled',
      },
      {
        stepNumber: 4,
        phase: 'AUTHORIZE',
        title: 'Enforce policy boundaries and supervisor authorization',
        owner: 'Human + Authority',
        detail:
          'Permits status retrieval and record updates while restricting out-of-policy adjustments to human approvers.',
        stateLabel: 'Policy Authorized',
      },
      {
        stepNumber: 5,
        phase: 'EXECUTE',
        title: 'Drive coordinates actions across portals, documents, and APIs',
        owner: 'Drive',
        channelUsed: 'Browser · Voice · Document · Connect',
        detail:
          'Digital workers gather external status, validate supporting documents, and update the core system of record.',
        stateLabel: 'Action Executed',
      },
      {
        stepNumber: 6,
        phase: 'VERIFY',
        title: 'Confirm target system state and record audit evidence',
        owner: 'Drive',
        detail:
          'Verifies that all system updates persisted accurately and routes any policy exceptions to human specialists.',
        stateLabel: 'Outcome Verified',
      },
      {
        stepNumber: 7,
        phase: 'LEARN',
        title: 'Update live capacity and SLA models in Pulse',
        owner: 'Pulse + Drive',
        detail:
          'Verified outcomes flow back into Pulse immediately, updating live queue velocity and capacity availability.',
        stateLabel: 'Loop Closed',
      },
    ],
    evidenceTrail: [
      {
        eventId: 'STEP-01',
        stepName: 'External Portal Verification',
        timestamp: 'Stage 1 of 4',
        status: 'Confirmed',
        objective: 'Retrieve current status and supporting records from external partner portal.',
        authorizedAction: 'Authenticated read session via managed enterprise credential vault.',
        actualResult: 'Current transaction status and reference documents retrieved.',
        verificationEvidence: 'Portal session state verified and supporting artifact attached.',
      },
      {
        eventId: 'STEP-02',
        stepName: 'Document & Policy Reconciliation',
        timestamp: 'Stage 2 of 4',
        status: 'Confirmed',
        objective: 'Validate extracted document fields against internal business rules.',
        authorizedAction: 'Automated field extraction and tolerance verification.',
        actualResult: 'Line items reconciled within approved policy parameters.',
        verificationEvidence: 'Cross-field validation passed with zero unmapped attributes.',
      },
      {
        eventId: 'STEP-03',
        stepName: 'System of Record Update',
        timestamp: 'Stage 3 of 4',
        status: 'Confirmed',
        objective: 'Update case status and close the pending follow-up task.',
        authorizedAction: 'Scoped write transaction on core workflow system.',
        actualResult: 'Case marked resolved and specialist queue capacity restored.',
        verificationEvidence: 'Post-write readback confirmed persistence in system of record.',
      },
      {
        eventId: 'STEP-04',
        stepName: 'Threshold Exception Escalation',
        timestamp: 'Stage 4 of 4',
        status: 'Review Required',
        objective: 'Evaluate secondary case exceeding autonomous financial authority.',
        authorizedAction: 'Enforce policy guardrail requiring human supervisor review.',
        actualResult: 'Autonomous write-back paused; routed to specialist with complete context.',
        verificationEvidence: 'Authority boundary enforced and handoff packet preserved.',
      },
    ],
  },
  support: {
    id: 'support',
    name: 'Supply & Order Coordination',
    domainLabel: 'Cross-System Scheduling, Inventory & Commitment Alignment',
    queueName: 'Order & Schedule Modification Queue',
    signalAlert: 'Regional network disruption driving schedule change volume',
    riskExposure: 'Customer delivery commitment targets under pressure',
    backlogCount: 920,
    eligibleForDriveCount: 610,
    recommendationTitle: 'Delegate multi-system schedule and logistics updates to Drive.',
    recommendationAssumptions:
      'Two-thirds of incoming requests require synchronizing delivery windows across CRM, warehouse management, and carrier portals. Automating standard updates keeps human coordinators focused on custom freight exceptions.',
    interventions: [
      {
        id: 'support-reallocate',
        name: 'Shift senior operations coordinators to modification queue',
        costLabel: 'Standard unit cost',
        throughputLabel: '+18% throughput',
        slaRiskLabel: '16.0% SLA exposure remains',
      },
      {
        id: 'support-drive',
        name: 'Execute standard schedule updates via Drive with coordinator oversight',
        costLabel: '-72% unit cost',
        throughputLabel: '+3.8x throughput',
        slaRiskLabel: '0.9% SLA exposure (Verified)',
        recommended: true,
      },
    ],
    policyConditions: [
      { rule: 'Query and update delivery windows across CRM and logistics portals', status: 'PERMITTED' },
      { rule: 'Dispatch confirmed schedule updates to account contacts', status: 'PERMITTED' },
      { rule: 'Approve penalty waivers or commercial contract modifications', status: 'RESTRICTED' },
    ],
    executionSteps: [
      {
        stepNumber: 1,
        phase: 'DETECT',
        title: 'Pulse identifies regional schedule modification surge',
        owner: 'Pulse',
        detail:
          'Detects an influx of schedule adjustment requests impacting downstream fulfillment commitments.',
        stateLabel: 'Signal Isolated',
      },
      {
        stepNumber: 2,
        phase: 'UNDERSTAND',
        title: 'Pulse clusters repeatable multi-system synchronization tasks',
        owner: 'Pulse',
        detail:
          'Identifies requests that follow standard rescheduling rules across order, warehouse, and carrier systems.',
        stateLabel: 'Workload Segmented',
      },
      {
        stepNumber: 3,
        phase: 'SIMULATE',
        title: 'Model service level recovery across human and digital capacity',
        owner: 'Pulse',
        detail:
          'Simulates queue clearance speed when routine schedule alignments are delegated to Drive.',
        stateLabel: 'Options Modeled',
      },
      {
        stepNumber: 4,
        phase: 'AUTHORIZE',
        title: 'Validate rescheduling policy windows and commercial limits',
        owner: 'Human + Authority',
        detail:
          'Permits standard window shifts while routing commercial fee waivers to human managers.',
        stateLabel: 'Policy Authorized',
      },
      {
        stepNumber: 5,
        phase: 'EXECUTE',
        title: 'Drive updates CRM, warehouse slots, carrier portals, and customer notices',
        owner: 'Drive',
        channelUsed: 'Connect · Browser · Communicate',
        detail:
          'Coordinates schedule changes across all connected systems and dispatches verified itinerary updates.',
        stateLabel: 'Action Executed',
      },
      {
        stepNumber: 6,
        phase: 'VERIFY',
        title: 'Confirm synchronized timestamps across all systems of record',
        owner: 'Drive',
        detail:
          'Verifies that order management, warehouse, and carrier schedules match with zero discrepancy.',
        stateLabel: 'Outcome Verified',
      },
      {
        stepNumber: 7,
        phase: 'LEARN',
        title: 'Pulse updates fulfillment velocity and commitment forecasts',
        owner: 'Pulse + Drive',
        detail:
          'Feeds confirmed schedule outcomes back into Pulse to keep regional capacity plans accurate.',
        stateLabel: 'Loop Closed',
      },
    ],
    evidenceTrail: [
      {
        eventId: 'STEP-01',
        stepName: 'Cross-Portal Slot Alignment',
        timestamp: 'Stage 1 of 2',
        status: 'Confirmed',
        objective: 'Synchronize updated delivery window across warehouse and carrier portals.',
        authorizedAction: 'Browser and API execution within approved scheduling window.',
        actualResult: 'Updated slot confirmed across both internal and external systems.',
        verificationEvidence: 'Confirmation receipt matched against core order record.',
      },
      {
        eventId: 'STEP-02',
        stepName: 'Stakeholder Notification',
        timestamp: 'Stage 2 of 2',
        status: 'Confirmed',
        objective: 'Send verified schedule confirmation to account stakeholders.',
        authorizedAction: 'Policy-checked outbound communication dispatch.',
        actualResult: 'Notification delivered and workflow marked resolved.',
        verificationEvidence: 'Delivery receipt logged to unified case timeline.',
      },
    ],
  },
  finance: {
    id: 'finance',
    name: 'Financial & Shared Services',
    domainLabel: 'Multi-Source Reconciliation, Compliance & Ledger Operations',
    queueName: 'Three-Way Reconciliation Exception Queue',
    signalAlert: 'Period-end close volume creating reconciliation bottleneck',
    riskExposure: 'Settlement windows and working-capital targets at risk',
    backlogCount: 1560,
    eligibleForDriveCount: 1120,
    recommendationTitle: 'Route standard unit-of-measure and document matching to Drive.',
    recommendationAssumptions:
      '72% of held transactions stem from unit-of-measure conversions and shipping line-item matching that can be reconciled deterministically against receiving logs.',
    interventions: [
      {
        id: 'fin-manual',
        name: 'Assign overtime across shared-services analyst teams',
        costLabel: '+40% unit cost',
        throughputLabel: '+20% throughput',
        slaRiskLabel: '22.0% close window exposure',
      },
      {
        id: 'fin-drive',
        name: 'Execute governed three-way matching via Drive with controller gates',
        costLabel: '-75% unit cost',
        throughputLabel: '+4.4x throughput',
        slaRiskLabel: '0.4% close window exposure',
        recommended: true,
      },
    ],
    policyConditions: [
      { rule: 'Extract purchase order, receipt, and statement line items', status: 'PERMITTED' },
      { rule: 'Post reconciled records within approved tolerance thresholds', status: 'PERMITTED' },
      { rule: 'Modify master counterparty banking or tax records', status: 'RESTRICTED' },
    ],
    executionSteps: [
      {
        stepNumber: 1,
        phase: 'DETECT',
        title: 'Pulse flags period-end reconciliation bottleneck',
        owner: 'Pulse',
        detail:
          'Identifies accumulating exceptions across shared-services queues ahead of period-end cutoff.',
        stateLabel: 'Signal Isolated',
      },
      {
        stepNumber: 2,
        phase: 'UNDERSTAND',
        title: 'Pulse categorizes root causes across ERP and receiving records',
        owner: 'Pulse',
        detail:
          'Isolates standard unit-of-measure and freight-line variances from true commercial disputes.',
        stateLabel: 'Workload Segmented',
      },
      {
        stepNumber: 3,
        phase: 'SIMULATE',
        title: 'Simulate settlement velocity and analyst capacity impact',
        owner: 'Pulse',
        detail:
          'Projects cycle-time reduction and on-time close performance before dispatching workflows.',
        stateLabel: 'Options Modeled',
      },
      {
        stepNumber: 4,
        phase: 'AUTHORIZE',
        title: 'Enforce controller tolerance limits and master-data locks',
        owner: 'Human + Authority',
        detail:
          'Permits auto-posting within strict variance bands while locking master vendor attributes.',
        stateLabel: 'Policy Authorized',
      },
      {
        stepNumber: 5,
        phase: 'EXECUTE',
        title: 'Drive extracts documents, reconciles receipts, and posts entries',
        owner: 'Drive',
        channelUsed: 'Document · Connect · Desktop',
        detail:
          'Normalizes line items, validates receiving logs, and posts balanced entries in the ERP.',
        stateLabel: 'Action Executed',
      },
      {
        stepNumber: 6,
        phase: 'VERIFY',
        title: 'Confirm balanced ledger entries and audit completeness',
        owner: 'Drive',
        detail:
          'Verifies debit/credit balance and attaches linked source documents for audit readiness.',
        stateLabel: 'Outcome Verified',
      },
      {
        stepNumber: 7,
        phase: 'LEARN',
        title: 'Pulse updates cycle-time telemetry and upstream friction insights',
        owner: 'Pulse + Drive',
        detail:
          'Surfaces recurring vendor formatting patterns so upstream data intake can be standardized.',
        stateLabel: 'Loop Closed',
      },
    ],
    evidenceTrail: [
      {
        eventId: 'STEP-01',
        stepName: 'Three-Way Document & Receipt Match',
        timestamp: 'Stage 1 of 2',
        status: 'Confirmed',
        objective: 'Reconcile commercial statement lines against purchase order and receiving log.',
        authorizedAction: 'Document extraction and unit-of-measure normalization.',
        actualResult: 'Exact mathematical match confirmed across all three records.',
        verificationEvidence: 'Order, receipt, and statement linked in audit record.',
      },
      {
        eventId: 'STEP-02',
        stepName: 'ERP Ledger Posting',
        timestamp: 'Stage 2 of 2',
        status: 'Confirmed',
        objective: 'Release exception hold and post balanced accounting entry.',
        authorizedAction: 'Authenticated ERP transaction within controller policy scope.',
        actualResult: 'Entry posted and scheduled for standard settlement run.',
        verificationEvidence: 'General ledger confirmation verified via post-write readback.',
      },
    ],
  },
};

// --- CAPABILITY ATLAS (27 MODULES: 12 PULSE + 15 DRIVE, INDUSTRY AGNOSTIC) ---
export interface CapabilityModule {
  id: string;
  name: string;
  product: 'Pulse' | 'Drive';
  group: string;
  problemSolved: string;
  capabilities: string[];
  useCases: string[];
  connectedModules: string[];
}

export const CAPABILITY_ATLAS: CapabilityModule[] = [
  // PULSE - PLAN (4)
  {
    id: 'pulse-forecast',
    name: 'Forecast',
    product: 'Pulse',
    group: 'PLAN',
    problemSolved: 'Eliminates blind spots in multi-channel workload arrival and seasonal volume spikes.',
    capabilities: [
      'Multi-horizon arrival modeling',
      'Intraday pattern detection',
      'Confidence interval bands',
      'External driver correlation',
    ],
    useCases: ['Seasonal demand surge planning', 'Intraday queue arrival forecasting'],
    connectedModules: ['Capacity', 'Simulate', 'Command'],
  },
  {
    id: 'pulse-capacity',
    name: 'Capacity',
    product: 'Pulse',
    group: 'PLAN',
    problemSolved: 'Replaces static headcount spreadsheets with live skill-and-proficiency supply models.',
    capabilities: [
      'Skill-matrix inventory',
      'Shrinkage & availability modeling',
      'Human + digital worker supply',
      'Bottleneck identification',
    ],
    useCases: ['Cross-regional staffing balance', 'Blended human and digital capacity planning'],
    connectedModules: ['Forecast', 'Allocate', 'Simulate'],
  },
  {
    id: 'pulse-allocate',
    name: 'Allocate',
    product: 'Pulse',
    group: 'PLAN',
    problemSolved: 'Matches incoming work queues to the best-qualified human or digital resource.',
    capabilities: [
      'Dynamic queue-to-team routing',
      'SLA-weighted prioritization',
      'Skill-tier matching',
      'Real-time rebalancing',
    ],
    useCases: ['Complex exception routing', 'Tiered enterprise operations assignment'],
    connectedModules: ['Capacity', 'Command', 'Drive Flow'],
  },
  {
    id: 'pulse-simulate',
    name: 'Simulate',
    product: 'Pulse',
    group: 'PLAN',
    problemSolved: 'Tests operational decisions before implementing them in live production.',
    capabilities: [
      'Demand scenario modeling',
      'Staffing alternatives',
      'Skill-based capacity constraints',
      'SLA sensitivity analysis',
      'Automation adoption scenarios',
      'Cost and throughput comparisons',
    ],
    useCases: ['Evaluating Drive automation ROI before deployment', 'Stress-testing SLA resilience under volume spikes'],
    connectedModules: ['Forecast', 'Capacity', 'Allocate', 'Drive Flow'],
  },
  // PULSE - OPERATE (4)
  {
    id: 'pulse-command',
    name: 'Command',
    product: 'Pulse',
    group: 'OPERATE',
    problemSolved: 'Provides a single real-time operational cockpit across queues, SLAs, and teams.',
    capabilities: [
      'Live SLA exposure radar',
      'Cross-queue backlog tracking',
      'Intervention triggers',
      'Exception heatmaps',
    ],
    useCases: ['Global operations command center', 'Intraday SLA breach prevention'],
    connectedModules: ['Perform', 'Allocate', 'Drive Observe'],
  },
  {
    id: 'pulse-perform',
    name: 'Perform',
    product: 'Pulse',
    group: 'OPERATE',
    problemSolved: 'Connects individual and team throughput directly to operational complexity.',
    capabilities: [
      'Complexity-adjusted productivity',
      'Handle-time decomposition',
      'Cohort benchmarking',
      'Trend attribution',
    ],
    useCases: ['Complexity-weighted team benchmarking', 'Identifying workflow stalls across stages'],
    connectedModules: ['Command', 'Quality', 'Coach'],
  },
  {
    id: 'pulse-quality',
    name: 'Quality',
    product: 'Pulse',
    group: 'OPERATE',
    problemSolved: 'Moves quality assurance from small post-hoc samples to continuous operational validation.',
    capabilities: [
      'Automated accuracy scoring',
      'Compliance defect tracking',
      'Rework root-cause linking',
      'Calibration workflows',
    ],
    useCases: ['Continuous policy adherence verification', 'Regulatory disclosure compliance'],
    connectedModules: ['Perform', 'Coach', 'Drive Verify'],
  },
  {
    id: 'pulse-economics',
    name: 'Economics',
    product: 'Pulse',
    group: 'OPERATE',
    problemSolved: 'Reveals true cost-to-serve and margin contribution per transaction and queue.',
    capabilities: [
      'Unit-cost attribution',
      'Overtime vs. automation economics',
      'SLA penalty avoidance tracking',
      'Margin telemetry',
    ],
    useCases: ['Service delivery cost optimization', 'Unit-cost reduction tracking across queues'],
    connectedModules: ['Simulate', 'Optimize', 'Command'],
  },
  // PULSE - DEVELOP (2)
  {
    id: 'pulse-academy',
    name: 'Academy',
    product: 'Pulse',
    group: 'DEVELOP',
    problemSolved: 'Closes forecasted capability gaps with targeted, simulation-backed learning pathways.',
    capabilities: [
      'Skill-gap curriculum mapping',
      'Sandbox case simulations',
      'Proficiency certification tracking',
      'Time-to-competency analytics',
    ],
    useCases: ['Upskilling specialists for complex exceptions', 'New-hire ramp acceleration'],
    connectedModules: ['Coach', 'Capacity', 'Quality'],
  },
  {
    id: 'pulse-coach',
    name: 'Coach',
    product: 'Pulse',
    group: 'DEVELOP',
    problemSolved: 'Guides team leads with evidence-backed coaching moments and optional consent-governed voice clarity tools.',
    capabilities: [
      'Targeted coaching agendas',
      'Best-practice workflow comparisons',
      'Consent-governed voice clarity & acoustic coaching service',
      'Post-coaching impact measurement',
    ],
    useCases: ['Team lead coaching preparation', 'Opt-in voice clarity enhancement for global service teams'],
    connectedModules: ['Perform', 'Quality', 'Academy'],
  },
  // PULSE - OPTIMIZE (2)
  {
    id: 'pulse-discover',
    name: 'Discover',
    product: 'Pulse',
    group: 'OPTIMIZE',
    problemSolved: 'Uncovers hidden process friction, manual loops, and automation candidates across systems.',
    capabilities: [
      'Cross-system friction mining',
      'Handoff delay quantification',
      'Automation eligibility scoring',
      'Root-cause clustering',
    ],
    useCases: ['Identifying repetitive portal lookups for Drive', 'Eliminating duplicate cross-system data entry'],
    connectedModules: ['Optimize', 'Drive Studio', 'Drive Flow'],
  },
  {
    id: 'pulse-optimize',
    name: 'Optimize',
    product: 'Pulse',
    group: 'OPTIMIZE',
    problemSolved: 'Converts operational observations into structured recommendations and dispatches eligible work to Drive.',
    capabilities: [
      'Observation -> Cause -> Options -> Impact structuring',
      'Evidence-linked business cases',
      'Direct Send to Drive handoff',
      'Post-intervention benefit tracking',
    ],
    useCases: ['Autonomous backlog offloading', 'Continuous process improvement loops'],
    connectedModules: ['Discover', 'Simulate', 'Drive Flow', 'Drive Control'],
  },
  // DRIVE - DESIGN (3)
  {
    id: 'drive-studio',
    name: 'Studio',
    product: 'Drive',
    group: 'DESIGN',
    problemSolved: 'Designs multi-step enterprise workflows combining deterministic rules and agentic reasoning.',
    capabilities: [
      'Visual workflow blueprint canvas',
      'Policy & guardrail binding',
      'Version-controlled deployment',
      'Simulation test harness',
    ],
    useCases: ['Authoring end-to-end multi-system workflows', 'Designing three-way reconciliation pipelines'],
    connectedModules: ['Agents', 'Knowledge', 'Flow'],
  },
  {
    id: 'drive-agents',
    name: 'Agents',
    product: 'Drive',
    group: 'DESIGN',
    problemSolved: 'Configures specialized digital workers with bounded roles, tools, and authority.',
    capabilities: [
      'Role & responsibility specification',
      'Permitted toolset scoping',
      'Reasoning boundary definitions',
      'Escalation triggers',
    ],
    useCases: ['Cross-System Resolution Agent', 'Supply & Order Coordination Agent'],
    connectedModules: ['Studio', 'Knowledge', 'Control'],
  },
  {
    id: 'drive-knowledge',
    name: 'Knowledge',
    product: 'Drive',
    group: 'DESIGN',
    problemSolved: 'Grounds digital workers in live enterprise policies, SOPs, and domain ontologies.',
    capabilities: [
      'Versioned SOP ingestion',
      'Citation-backed retrieval',
      'Policy conflict detection',
      'Domain ontology mapping',
    ],
    useCases: ['Enterprise policy rule lookup', 'Regional regulatory compliance grounding'],
    connectedModules: ['Agents', 'Context', 'Understand'],
  },
  // DRIVE - EXECUTE (6)
  {
    id: 'drive-voice',
    name: 'Voice',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Executes structured outbound and inbound voice interactions when digital APIs do not exist.',
    capabilities: [
      'IVR tree navigation',
      'Natural turn-taking speech synthesis',
      'Real-time transcript extraction',
      'Audio evidence capture',
    ],
    useCases: ['Outbound partner status confirmation calls', 'Supplier delivery scheduling calls'],
    connectedModules: ['Flow', 'Context', 'Verify'],
  },
  {
    id: 'drive-browser',
    name: 'Browser',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Navigates external web portals resiliently even when layout or DOM structures shift.',
    capabilities: [
      'Semantic DOM + visual navigation',
      'Managed credential injection',
      'Multi-step portal form execution',
      'Session state snapshots',
    ],
    useCases: ['Partner portal status inquiries', 'Logistics carrier portal scheduling'],
    connectedModules: ['Flow', 'Document', 'Verify'],
  },
  {
    id: 'drive-connect',
    name: 'Connect',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Orchestrates high-reliability API, EDI, and database transactions across enterprise systems.',
    capabilities: [
      'Typed REST / GraphQL / EDI adapters',
      'Idempotency guarantees',
      'Transactional rollback support',
      'Schema validation',
    ],
    useCases: ['Core ERP ledger posting', 'CRM & service management system updates'],
    connectedModules: ['Flow', 'Control', 'Verify'],
  },
  {
    id: 'drive-document',
    name: 'Document',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Transforms unstructured PDFs, statements, and packets into validated structured records.',
    capabilities: [
      'Multi-page layout parsing',
      'Line-item table reconciliation',
      'Confidence threshold gating',
      'Cross-document validation',
    ],
    useCases: ['Contract & compliance packet extraction', 'Commercial invoice & receipt matching'],
    connectedModules: ['Knowledge', 'Browser', 'Verify'],
  },
  {
    id: 'drive-interact',
    name: 'Interact',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Coordinates structured human-in-the-loop communications across email, chat, and queues.',
    capabilities: [
      'Draft vs. approved message staging',
      'Sensitive data redaction enforcement',
      'Collaborative approval cards',
      'Delivery confirmation tracking',
    ],
    useCases: ['Supervisor exception sign-off requests', 'Verified stakeholder resolution notices'],
    connectedModules: ['Control', 'Flow', 'Verify'],
  },
  {
    id: 'drive-desktop',
    name: 'Desktop',
    product: 'Drive',
    group: 'EXECUTE',
    problemSolved: 'Operates legacy thick-client, virtual desktop, and terminal interfaces that lack modern APIs.',
    capabilities: [
      'Visual anchor recognition',
      'Bounded keystroke & pointer sequences',
      'Screen-state verification',
      'Isolated VDI execution',
    ],
    useCases: ['Legacy terminal transaction posting', 'Thick-client inventory adjustments'],
    connectedModules: ['Flow', 'Runtime', 'Verify'],
  },
  // DRIVE - ORCHESTRATE (3)
  {
    id: 'drive-flow',
    name: 'Flow',
    product: 'Drive',
    group: 'ORCHESTRATE',
    problemSolved: 'Coordinates multi-channel work items across systems, retries, and conditional branches.',
    capabilities: [
      'Stateful workflow orchestration',
      'Dynamic channel routing',
      'Long-running transaction recovery',
      'SLA-aware queue scheduling',
    ],
    useCases: ['End-to-end resolution across portal + document + ERP', 'Multi-stage supplier exception resolution'],
    connectedModules: ['Context', 'Control', 'Pulse Optimize'],
  },
  {
    id: 'drive-context',
    name: 'Context',
    product: 'Drive',
    group: 'ORCHESTRATE',
    problemSolved: 'Preserves complete operational memory as work moves between channels and human reviewers.',
    capabilities: [
      'Unified work-item state graph',
      'Cross-channel artifact linking',
      'Zero-loss human handoff packets',
      'Historical trace preservation',
    ],
    useCases: ['Passing portal + document findings to a human specialist', 'Maintaining multi-touch case state'],
    connectedModules: ['Flow', 'Knowledge', 'Verify'],
  },
  {
    id: 'drive-control',
    name: 'Control',
    product: 'Drive',
    group: 'ORCHESTRATE',
    problemSolved: 'Enforces strict policy boundaries, monetary limits, and mandatory human approval gates.',
    capabilities: [
      'Attribute-based action policies',
      'Monetary & risk threshold gates',
      'Human-in-the-loop authorization workflows',
      'Immediate pause & override controls',
    ],
    useCases: ['Gating high-value financial adjustments', 'Enforcing read-only vs. write permissions'],
    connectedModules: ['Flow', 'Verify', 'Observe'],
  },
  // DRIVE - ASSURE (2)
  {
    id: 'drive-verify',
    name: 'Verify',
    product: 'Drive',
    group: 'ASSURE',
    problemSolved: 'Confirms that the intended business outcome actually occurred in the target system.',
    capabilities: [
      'Post-execution readback validation',
      'Audit evidence bundling',
      'Attempted vs. confirmed state separation',
      'Compliance trail export',
    ],
    useCases: ['Confirming ERP ledger persistence', 'Generating audit-ready execution evidence'],
    connectedModules: ['Observe', 'Control', 'Pulse Quality'],
  },
  {
    id: 'drive-observe',
    name: 'Observe',
    product: 'Drive',
    group: 'ASSURE',
    problemSolved: 'Monitors every digital worker fleet, step latency, exception rate, and verification yield.',
    capabilities: [
      'Live fleet telemetry',
      'Step-by-step trace replay',
      'Exception taxonomy analytics',
      'Pulse feedback loop integration',
    ],
    useCases: ['Detecting external portal layout changes', 'Monitoring fleet SLA contribution'],
    connectedModules: ['Verify', 'Runtime', 'Pulse Command'],
  },
  // DRIVE - DEPLOY (1)
  {
    id: 'drive-runtime',
    name: 'Runtime',
    product: 'Drive',
    group: 'DEPLOY',
    problemSolved: 'Runs digital workers securely inside isolated enterprise cloud or hybrid environments.',
    capabilities: [
      'Isolated container & VDI sandboxes',
      'Enterprise vault & IAM integration',
      'Elastic concurrency scaling',
      'Zero-trust network egress controls',
    ],
    useCases: ['VPC-isolated enterprise execution', 'High-volume period-end close scaling'],
    connectedModules: ['Control', 'Observe', 'Desktop'],
  },
];

// --- ENTERPRISE GOVERNANCE LAYERS (INDUSTRY AGNOSTIC) ---
export interface TrustLayerSpec {
  id: string;
  layerNumber: string;
  name: string;
  question: string;
  summary: string;
  executionStepLink: string;
  inspectableFields: { label: string; value: string }[];
}

export const TRUST_LAYERS: TrustLayerSpec[] = [
  {
    id: 'context',
    layerNumber: 'Context Layer',
    name: 'CONTEXT',
    question: 'What does the system know?',
    summary:
      'Captures the operational signal, business objective, source data lineage, and active policy version before any action begins.',
    executionStepLink: 'Connected to Demand Signal & Enterprise Ontology',
    inspectableFields: [
      {
        label: 'Business Objective',
        value: 'Resolve multi-system operational request within the committed service window',
      },
      {
        label: 'Data Lineage',
        value: 'Core Work Queue, Partner Contract Rules, and Versioned Standard Operating Procedures',
      },
      {
        label: 'Data Privacy Scope',
        value: 'Scoped to minimum necessary attributes with sensitive fields automatically masked',
      },
    ],
  },
  {
    id: 'authority',
    layerNumber: 'Authority Layer',
    name: 'AUTHORITY',
    question: 'What is the system permitted to do?',
    summary:
      'Defines approved tools, system permissions, financial thresholds, and mandatory human approval gates.',
    executionStepLink: 'Connected to Policy Boundary & Human Approval Gate',
    inspectableFields: [
      {
        label: 'Permitted Actions',
        value: 'Query external portal status, validate documents, and update queue disposition',
      },
      {
        label: 'Restricted Actions',
        value: 'Financial adjustments or policy exceptions above threshold require human sign-off',
      },
      {
        label: 'Identity Principal',
        value: 'Scoped service identity with short-lived, auditable authorization tokens',
      },
    ],
  },
  {
    id: 'execution',
    layerNumber: 'Execution Layer',
    name: 'EXECUTION',
    question: 'What did the system actually do?',
    summary:
      'Records deterministic execution traces, channel transitions, and handled exceptions across every system touched.',
    executionStepLink: 'Connected to Multi-Channel Execution Trace',
    inspectableFields: [
      {
        label: 'Cross-Channel Trace',
        value: 'Portal Authentication -> Status Retrieval -> Document Validation -> System Update',
      },
      {
        label: 'State Continuity',
        value: 'Full operational context preserved across browser, document, and API steps',
      },
      {
        label: 'Exception Handling',
        value: 'Out-of-bounds items paused cleanly and routed to human review with full context',
      },
    ],
  },
  {
    id: 'verification',
    layerNumber: 'Verification Layer',
    name: 'VERIFICATION',
    question: 'How do we know the work was completed correctly?',
    summary:
      'Compares the expected business outcome against the observed target system state and preserves verifiable audit evidence.',
    executionStepLink: 'Connected to Outcome Verification & Pulse Feedback Loop',
    inspectableFields: [
      {
        label: 'Expected vs. Observed State',
        value: 'Confirms target system of record reflects the intended post-transaction state',
      },
      {
        label: 'Audit Evidence Bundle',
        value: 'Links confirmation receipts, validated documents, and API acknowledgements',
      },
      {
        label: 'Closed-Loop Feedback',
        value: 'Verified completion immediately updates live queue and capacity telemetry in Pulse',
      },
    ],
  },
];

// --- ENTERPRISE INQUIRY FORM VALIDATION ---
export interface ContactFormInput {
  fullName: string;
  workEmail: string;
  organization: string;
  focusArea: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

export function validateContactForm(input: ContactFormInput): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.workEmail || !emailRegex.test(input.workEmail.trim())) {
    errors.workEmail = 'Please enter a valid work email address.';
  }
  if (!input.organization || input.organization.trim().length < 2) {
    errors.organization = 'Please enter your organization name.';
  }
  if (!input.focusArea || input.focusArea.trim().length === 0) {
    errors.focusArea = 'Please select an operational focus area.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
