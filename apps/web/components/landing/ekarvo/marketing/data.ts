/** Used public assets, pinned to qa/marketing-parity/source-tree.sha256. */
export const MARKETING_ASSETS = [
  {
    "path": "/downloads/ekarvo-overview.txt",
    "sha256": "10e8cbefba248ccbd340277316c18baa6f814bf7a29aae312d7d7d59445dedf3"
  },
  {
    "path": "/downloads/outcome-contract.txt",
    "sha256": "9b1cad604b653ca79910bfd86dfff0b99e21c880971d0ae29cb4fd93756f8b50"
  },
  {
    "path": "/downloads/workflow-brief.txt",
    "sha256": "584859682f81fa8a5589ed518465a0d9a8ac1281665e8197065cb43f1f3b6be0"
  },
  {
    "path": "/images/cinematic/film-desktop-0.webp",
    "sha256": "4017751b051382fdcc9ca6efd7d0ed1ff0134cd5b70ca905c1965b9b6eeb99f8"
  },
  {
    "path": "/images/cinematic/film-desktop-6.webp",
    "sha256": "9e4b17b95754b83e2faeef9215133871df3f1f62e21cc91406716da46571266d"
  },
  {
    "path": "/images/cinematic/film-mobile-0.webp",
    "sha256": "44d15fc91fbab1e4ed98fc401c0e4e941023efbfbee8f2594951873557489fde"
  },
  {
    "path": "/images/cinematic/film-mobile-6.webp",
    "sha256": "f68dd26af095f5c45d20f0de27ce581edac4289f89c214918951685cea0976ae"
  },
  {
    "path": "/images/cinematic/study-evidence-dark.webp",
    "sha256": "41f3a8bf4c73ea019f691faa3bc4138d6c8602ce240b5c702289676d9721485b"
  },
  {
    "path": "/images/cinematic/study-evidence-paper-mobile.webp",
    "sha256": "a9d64159c51991aba159a2f078bbe93873f6ae28cfb8ec701a8c202b4472efc3"
  },
  {
    "path": "/images/cinematic/study-evidence-paper.webp",
    "sha256": "16a38c07ed6bcfa6b25876b94a1254882fe889088852da977b7fe485dc425db0"
  },
  {
    "path": "/images/cinematic/study-execution-dark-mobile.webp",
    "sha256": "8ea56f966a344b25c9f91b8981e71e81dd6d01294e9861a4c5b945eb8db2cbf9"
  },
  {
    "path": "/images/cinematic/study-execution-dark.webp",
    "sha256": "e428337effd5de4feec193cc55ffa202e64d859ece95923904665caa87549e46"
  },
  {
    "path": "/images/cinematic/study-execution-paper-mobile.webp",
    "sha256": "bfb4d90c6664a4c02277f3124065e25e2e41e6afd2ab5b76b3d639d9d3f78890"
  },
  {
    "path": "/images/cinematic/study-execution-paper.webp",
    "sha256": "afae044725da57bbaf0f04afb0b8b102dadb40d0b0dad1272ce4ebbfe3d24122"
  },
  {
    "path": "/images/cinematic/study-operations-dark-mobile.webp",
    "sha256": "145b2e1a32acb7bba0768ed764956cb16982b862dd87ab1c7a7c8848ad264a33"
  },
  {
    "path": "/images/cinematic/study-operations-dark.webp",
    "sha256": "fe96f35b89c8a9ca93ee8e4c07904257fb1c79942bf06cc19b34a37842596b8d"
  },
  {
    "path": "/images/cinematic/study-operations-paper-mobile.webp",
    "sha256": "b31180f20588fce72ee5fa5a222003bb5c18d6a8652596aa27897834d471fca1"
  },
  {
    "path": "/images/cinematic/study-operations-paper.webp",
    "sha256": "f6ad0e8ae2a8b0378fc515eefd256422c8e1f8bf03301d939012b28fd0414937"
  },
  {
    "path": "/images/cinematic/study-platform-paper-mobile.webp",
    "sha256": "b0a3bdf977ff980b4d1de4968110b22a24778f82ef0d8ae1ad60ef76ab4d9c7b"
  },
  {
    "path": "/images/cinematic/study-platform-paper.webp",
    "sha256": "72af4c7ffb37f1decf322fb19e6c733151ea67e314a271cc9501515c0962266e"
  },
  {
    "path": "/images/cinematic/study-trust-paper-mobile.webp",
    "sha256": "19a3033bea985fdc87bba84b7b617f6c4a8b077f8bba69460d9b6bbd560b48c0"
  },
  {
    "path": "/images/cinematic/study-trust-paper.webp",
    "sha256": "30fa0b51078f191f00e50ddf1f1a14071ac18fb0d14e80e630db218a54f32e0f"
  },
  {
    "path": "/images/company/human-judgment-small.webp",
    "sha256": "e0bca4da0af426f4547af3095ecdba6b69a4513b1ade52597fc0d596a2c5664b"
  },
  {
    "path": "/images/company/human-judgment.webp",
    "sha256": "c66c4ecd8d1d39e8c527957fcdff687d757b694e68f55c6c3e86cc1ca1f9a0bc"
  }
] as const;

export const suites = [
  {
    id: "plan",
    name: "Plan",
    title: "Put the right capacity behind every commitment.",
    description:
      "Connect demand, capacity, skills and scenarios before delivery is at risk.",
    modules: [
      "Demand intelligence",
      "Capacity planning",
      "Workforce supply",
      "Scenario planning",
    ],
    signal: "Demand exceeds effective capacity",
    action: "Compare a resource move with overtime",
    measure: "Capacity gap, operational risk and cost",
  },
  {
    id: "deliver",
    name: "Deliver",
    title: "Keep work moving. Keep ownership clear.",
    description:
      "Bring queues, allocation, handoffs and commitments into one operating view.",
    modules: [
      "Work management",
      "Intelligent allocation",
      "Workflow orchestration",
      "Service control",
      "Transition management",
    ],
    signal: "A priority queue is building up",
    action: "Review eligible resources and approve a move",
    measure: "Backlog, turnaround and donor-team impact",
  },
  {
    id: "perform",
    name: "Perform",
    title: "Understand what drives delivery performance.",
    description:
      "Read productivity in context: work mix, complexity, quality and productive time.",
    modules: [
      "Productivity",
      "Utilization",
      "Performance diagnostics",
      "Work economics",
    ],
    signal: "Cost per unit has increased",
    action: "Separate work-mix effects from process friction",
    measure: "Adjusted productivity and cost-to-serve",
  },
  {
    id: "assure",
    name: "Assure",
    title: "Find quality leakage. Follow the evidence.",
    description:
      "Connect audits, defects, rework and operational controls to the work that caused them.",
    modules: [
      "QA management",
      "Defect intelligence",
      "Process excellence",
      "Compliance & controls",
    ],
    signal: "One defect type is recurring",
    action: "Review the source evidence and remediation owner",
    measure: "Defect recurrence and rework hours",
  },
  {
    id: "develop",
    name: "Develop",
    title: "Build the capabilities that delivery needs.",
    description:
      "Connect skill gaps to targeted learning and manager-led coaching.",
    modules: [
      "Skills intelligence",
      "Learning intelligence",
      "Targeted coaching",
    ],
    signal: "Demand needs a skill the team lacks",
    action: "Compare cross-skilling and eligible redeployment",
    measure: "Skill coverage and readiness",
  },
  {
    id: "transform",
    name: "Transform",
    title: "Change how work gets done. Measure the result.",
    description:
      "Identify suitable automation, design human–AI handoffs and test the value case.",
    modules: [
      "Automation discovery",
      "Human–AI orchestration",
      "Transformation intelligence",
    ],
    signal: "A repeatable workflow may suit automation",
    action: "Model exceptions, costs and human fallback",
    measure: "Estimated, realized and verified value",
  },
];

export const SCENE_MODES = ["operations", "execution", "evidence", "platform", "trust"] as const;
export type SceneMode = (typeof SCENE_MODES)[number];
export type SceneSurface = "paper";

export const SCENES = {
  operations: { start: 1.85, end: 2.2, paper: false, captions: ["Four inputs. One operating picture.", "Understand the consequence before choosing a response."], labels: ["Demand", "Capacity", "Quality", "Cost"] },
  execution: { start: 4.1, end: 4.95, paper: false, captions: ["From defined work to a verified result.", "Authority stays connected to every step."], labels: ["Defined work", "Permission", "Action", "Evidence"] },
  platform: { start: 6, end: 6, paper: true, captions: ["One connected foundation", "Intelligence, Execution and Assurance"], labels: [] },
  trust: { start: 3.15, end: 3.85, paper: true, captions: ["An explicit control point", "Permission precedes action"], labels: [] },
  evidence: { start: 5.12, end: 5.6, paper: true, captions: ["Completion has a condition", "Result connected to its evidence"], labels: [] },
} as const satisfies Record<SceneMode, { start: number; end: number; paper: boolean; captions: readonly [string, string]; labels: readonly string[] }>;

export const PRODUCT_MAP_GROUPS = [
  { name: "Plan", role: "Forecast demand, understand capacity and simulate choices." },
  { name: "Operate", role: "See work, performance, quality and economics together." },
  { name: "Develop", role: "Connect skills and coaching to changing work." },
  { name: "Optimize", role: "Find friction and test improvements." },
] as const;

export const WORK_LIFECYCLE = ["Detect", "Understand", "Simulate", "Authorize", "Execute", "Verify", "Learn"] as const;

export interface MarketingProduct {
  name: string;
  role: string;
  mode: SceneMode;
  title: string;
  body: string;
  href: string;
  action: string;
  label: string;
}

/** Source product family; paths resolve through marketingHref at render time. */
export const PRODUCTS = [
  {
    name: "Ekarvo Pulse",
    role: "Operating Intelligence",
    mode: "operations",
    title: "Know the operation. Change the outcome.",
    body: "Connect demand, capacity, quality and cost. Compare the consequences before choosing a response.",
    href: "/products/operations-os",
    action: "Explore Ekarvo Pulse",
    label: "Connected operational layers expose the effects of a capacity decision.",
  },
  {
    name: "Ekarvo Drive",
    role: "Autonomous Execution",
    mode: "execution",
    title: "Move defined work to verified completion.",
    body: "Define the result. Set the authority. Coordinate permitted action and keep the evidence connected.",
    href: "/products/autonomous-execution",
    action: "Explore Ekarvo Drive",
    label: "A blue decision thread moves through explicit approval boundaries on the same connected signal.",
  },
] as const satisfies readonly MarketingProduct[];
