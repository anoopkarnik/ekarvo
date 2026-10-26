// Copy for the cinematic landing, kept in step with Website/src/components/CinematicLanding.astro.

export const CONTACT_HREF = "/landing/legal/contact-us";

export type ChapterId = "opening" | "fracture" | "pulse" | "authority" | "drive" | "evidence" | "outcome";

export const chapters: { id: ChapterId; marker: string; title: string; body: string; align: "left" | "center" }[] = [
  { id: "opening", marker: "THE AUTONOMOUS EXECUTION COMPANY", title: "Make ambition operational.", body: "Intelligence that sees the work. Execution that carries it through. We are building the connection.", align: "left" },
  { id: "fracture", marker: "THE FRACTURE", title: "Work breaks at the handoff.", body: "Work crosses systems, teams, and decisions. At each handoff, the signal can lose its context, owner, or next step.", align: "left" },
  { id: "pulse", marker: "EKARVO PULSE · OPERATING INTELLIGENCE", title: "See the whole operation.", body: "Pulse is being designed to bring demand, capacity, quality, and cost into one operating picture.", align: "left" },
  { id: "authority", marker: "THE CONTROL POINT", title: "Intelligence is not authority.", body: "A clear view does not grant permission to act. Scope, ownership, and approvals define where the route can go.", align: "left" },
  { id: "drive", marker: "EKARVO DRIVE · CONTROLLED EXECUTION", title: "Give action a route.", body: "Drive is being designed to carry defined work through permitted steps—and stop when an exception needs a decision.", align: "left" },
  { id: "evidence", marker: "THE PROOF", title: "A result needs proof.", body: "Completion should stay connected to its success condition, the decision behind it, and the evidence that supports it.", align: "left" },
  { id: "outcome", marker: "THE EKARVO VISION", title: "See it through.", body: "From the first decision to the evidence of completion. Give your next ambition a path forward.", align: "center" },
];

type Metric = { value: string; label: string };
export type ReadingEvidence = {
  kind: "stat" | "pair" | "finding" | "series";
  eyebrow: string;
  metric?: string;
  metricLabel?: string;
  metrics?: Metric[];
  text: string;
  scope: string;
  source: string;
  url: string;
};

const WTI_2026 = "https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization";
const MCKINSEY_ORGS = "https://www.mckinsey.com/capabilities/people-and-organization/our-insights/the-state-of-organizations";
const MCKINSEY_AI = "https://www.mckinsey.com/capabilities/transformation/our-insights/why-ais-easiest-wins-are-misleading-ceos";

// One card per chapter, shown only in reading mode.
export const readingEvidence: ReadingEvidence[] = [
  { kind: "stat", eyebrow: "READINESS · MICROSOFT WORK TREND INDEX 2026", metric: "19%", metricLabel: "of AI users surveyed", text: "were in the Frontier group, where individual capability and organizational readiness reinforce each other.", scope: "20,000 AI users surveyed across 10 markets", source: "Read the 2026 Work Trend Index", url: WTI_2026 },
  { kind: "pair", eyebrow: "WORK FRICTION · MICROSOFT WORK TREND INDEX 2025", metrics: [{ value: "48%", label: "of employees" }, { value: "52%", label: "of leaders" }], text: "said their work feels chaotic and fragmented.", scope: "31,000 knowledge workers surveyed across 31 markets", source: "Read the Work Trend Index report", url: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday" },
  { kind: "stat", eyebrow: "OPERATIONAL READINESS · MCKINSEY 2026", metric: "86%", metricLabel: "of respondents", text: "said their organization is not very prepared to adopt AI in day-to-day operations.", scope: "More than 10,000 senior executives · 15 countries · 16 industries", source: "Read The State of Organizations 2026", url: MCKINSEY_ORGS },
  { kind: "stat", eyebrow: "LEADERSHIP ALIGNMENT · MICROSOFT WORK TREND INDEX 2026", metric: "26%", metricLabel: "of AI users surveyed", text: "said their leadership is clearly and consistently aligned on AI.", scope: "20,000 AI users surveyed across 10 markets", source: "Read the 2026 Work Trend Index", url: WTI_2026 },
  { kind: "finding", eyebrow: "FROM STRUCTURE TO FLOW · MCKINSEY 2026", metric: "Simplify. Unify. Improve flow.", text: "McKinsey identifies simplifying and unifying enterprise processes as a central route to the next productivity frontier.", scope: "More than 10,000 senior executives · 15 countries · 16 industries", source: "Read The State of Organizations 2026", url: MCKINSEY_ORGS },
  { kind: "pair", eyebrow: "ADOPTION IS NOT IMPACT · MCKINSEY 2026", metrics: [{ value: "37%", label: "report some positive earnings effect" }, { value: "6%", label: "meet McKinsey’s high-performer definition" }], text: "McKinsey defines high performers as organizations that attribute at least 5% of EBIT to AI and report value from its use.", scope: "McKinsey research on AI adoption and business impact · 2026", source: "Read the research", url: MCKINSEY_AI },
  { kind: "series", eyebrow: "THE ADOPTION-TO-IMPACT GAP · MCKINSEY 2026", metrics: [{ value: "89%", label: "use AI in at least one function" }, { value: "37%", label: "report some positive earnings effect" }, { value: "6%", label: "are high performers" }], text: "Broad adoption does not guarantee enterprise-level impact.", scope: "High performers attribute at least 5% of EBIT to AI and report value from its use.", source: "Read the research", url: MCKINSEY_AI },
];

// The Astro site links to Products, Approach, Platform and Company pages this app does not have,
// so navigation points at the matching chapters instead.
export const headerNav = [
  ["Pulse", "#pulse"],
  ["Drive", "#drive"],
  ["Trust", "#authority"],
  ["Proof", "#evidence"],
] as const;
