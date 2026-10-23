import React, { useState } from 'react';
import {
  FRAGMENTATION_DOMAINS,
  TOOL_GALLERY_ITEMS,
} from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryScenesEarlyProps {
  onNavigateScene: (sceneId: string) => void;
  hoveredProduct: 'none' | 'pulse' | 'drive';
  onHoverProduct: (prod: 'none' | 'pulse' | 'drive') => void;
  onOpenModal: (modal: 'contact' | 'platform' | 'solutions' | 'company') => void;
}

export const StoryScenesEarly: React.FC<StoryScenesEarlyProps> = ({
  onNavigateScene,
  hoveredProduct,
  onHoverProduct,
  onOpenModal,
}) => {
  // Operational Fragmentation domain selection
  const [selectedDomainId, setSelectedDomainId] = useState<string>('demand');
  const [simulateQueueSurge, setSimulateQueueSurge] = useState<boolean>(false);

  // Isolated Tool Gallery selection
  const [activeToolIdx, setActiveToolIdx] = useState<number>(0);
  const [attemptTraceActive, setAttemptTraceActive] = useState<boolean>(false);

  // Closed-Loop step selection
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);

  const selectedDomain =
    FRAGMENTATION_DOMAINS.find((d) => d.id === selectedDomainId) || FRAGMENTATION_DOMAINS[0]!;
  const activeTool = TOOL_GALLERY_ITEMS[activeToolIdx]!;

  const loopSteps = [
    {
      keyword: 'UNDERSTAND',
      verb: 'Understand the operation.',
      category: 'Operating Intelligence',
      detail:
        'Unify fragmented demand, capacity, performance, and quality signals into one live operational model across teams and systems.',
    },
    {
      keyword: 'DECIDE',
      verb: 'Decide what matters.',
      category: 'Scenario Simulation',
      detail:
        'Simulate staffing allocations and automation trade-offs before committing resources or changing production queues.',
    },
    {
      keyword: 'EXECUTE',
      verb: 'Execute within authority.',
      category: 'Autonomous Execution',
      detail:
        'Coordinate digital workers across voice, browser, documents, APIs, communications, and legacy desktops under strict policy guardrails.',
    },
    {
      keyword: 'VERIFY',
      verb: 'Verify what changed.',
      category: 'Outcome Assurance',
      detail:
        'Confirm target system state, preserve verifiable audit evidence, and feed completed outcomes back into your operational plan.',
    },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section
        id="scene-01"
        aria-label="EKARVO Hero"
        className="relative min-h-[100dvh] pt-24 pb-16 px-6 lg:px-12 flex flex-col justify-between bg-transparent"
      >
        <div className="max-w-[1440px] mx-auto w-full my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 bg-[#090D11]/88 lg:bg-transparent p-6 -m-6 lg:p-0 lg:m-0 rounded-lg">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-medium">
              Autonomous Enterprise Operations
            </p>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95] text-[#EEF3F0]">
              SEE THE WORK.
              <br />
              <span className="text-[#5DDEC4]">MOVE THE WORK.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#EEF3F0]/85 max-w-xl leading-relaxed font-normal">
              EKARVO connects operating intelligence with autonomous execution so enterprises
              understand operations, decide, execute across systems, and verify every outcome.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('network_connection');
                  onNavigateScene('scene-05');
                }}
                className="inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold text-[#090D11] bg-[#5DDEC4] rounded-lg hover:bg-[#4bcbb1] transition-transform duration-150 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.play('product_reveal');
                  onOpenModal('contact');
                }}
                className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-medium text-[#EEF3F0] bg-[#121A20]/90 border border-[#26333C] rounded-lg hover:border-[#5DDEC4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Talk to EKARVO</span>
                <ArrowUpRight className="w-4 h-4 text-[#5DDEC4]" />
              </button>
            </div>
          </div>

          {/* Right 5 columns reserved for the scroll-driven workstream map */}
          <div className="lg:col-span-5 hidden lg:block h-full pointer-events-none" />
        </div>

        {/* Clean 4-Pillar Closed-Loop Architecture Summary */}
        <div className="max-w-[1440px] mx-auto w-full pt-8 border-t border-[#26333C]/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Understand',
              desc: 'Unify demand, capacity, and performance signals across every queue.',
            },
            {
              title: 'Decide',
              desc: 'Simulate staffing and automation interventions before acting.',
            },
            {
              title: 'Execute',
              desc: 'Run governed digital workers across APIs, browsers, voice, and documents.',
            },
            {
              title: 'Verify',
              desc: 'Confirm system-of-record outcomes with complete audit evidence.',
            },
          ].map((pillar) => (
            <div key={pillar.title} className="space-y-1">
              <div className="text-sm font-bold text-[#EEF3F0]">{pillar.title}</div>
              <p className="text-xs text-[#8C9A9F] leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: OPERATIONAL FRAGMENTATION */}
      <section
        id="scene-02"
        aria-label="Operational Fragmentation"
        className="relative py-28 px-6 lg:px-12 border-t border-[#26333C]/70 bg-transparent"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-5 bg-[#090D11]/88 p-6 -m-6 rounded-lg">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#E8B66E]">
                Operational Fragmentation
              </p>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
                WORK DOESN&apos;T LIVE
                <br />
                IN ONE SYSTEM.
              </h2>
              <p className="text-lg text-[#8C9A9F] max-w-lg leading-relaxed">
                Neither do the people, decisions, and processes required to complete it.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 gap-3">
              {[
                'Demand arrives across portals, queues, and service channels.',
                'Capacity and skills are tracked in separate planning tools.',
                'Performance is measured after delivery windows have already closed.',
                'Decisions travel through meetings, messages, and spreadsheets.',
                'Execution depends on people manually connecting the dots.',
              ].map((text) => (
                <div
                  key={text}
                  className="p-4 rounded-lg bg-[#121A20]/90 border border-[#26333C] text-base font-medium text-[#EEF3F0]"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive 7-Domain Fragmentation Matrix */}
          <div className="p-6 sm:p-10 rounded-lg bg-[#090D11]/92 border border-[#26333C] space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26333C] pb-5">
              <div>
                <p className="font-mono text-xs uppercase text-[#E8B66E] tracking-wider">
                  Cross-Domain Continuity Gap
                </p>
                <h3 className="text-lg font-bold text-[#EEF3F0] mt-1">
                  Inspect how work stalls across seven disconnected operational domains
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSimulateQueueSurge((prev) => !prev);
                  soundEngine.play('fragmentation');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E8B66E] text-[#E8B66E] hover:bg-[#E8B66E] hover:text-[#090D11] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {simulateQueueSurge ? 'Standard Queue Scale' : 'Simulate Enterprise Peak Volume'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {FRAGMENTATION_DOMAINS.map((domain) => {
                const active = domain.id === selectedDomain.id;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onMouseEnter={() => setSelectedDomainId(domain.id)}
                    onClick={() => {
                      setSelectedDomainId(domain.id);
                      soundEngine.play('fragmentation');
                    }}
                    className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between min-h-[108px] ${
                      active
                        ? 'bg-[#172127] border-[#E8B66E] text-[#EEF3F0]'
                        : 'bg-[#121A20]/80 border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                    }`}
                  >
                    <div className="text-sm font-bold tracking-tight">{domain.name}</div>
                    <div className="font-mono text-[11px] text-[#E8B66E] mt-2">
                      {domain.gapAnnotation}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-[#5DDEC4]">
                    Origin: {selectedDomain.name} ({selectedDomain.visualRepresentation})
                  </span>
                  <span className="text-[#8C9A9F]">
                    Next Stage: {selectedDomain.attemptedTarget}
                  </span>
                </div>

                <div className="py-4 px-5 rounded-lg bg-[#121A20] border border-[#26333C]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#5DDEC4] shrink-0">
                      {selectedDomain.name}
                    </span>
                    <div className="flex-1 h-0.5 bg-[#5DDEC4] relative" />
                    <span className="px-3 py-1 rounded-lg bg-[#C86664]/20 border border-[#C86664] font-mono text-xs font-bold text-[#E8B66E] shrink-0">
                      Handoff Gap: {selectedDomain.gapAnnotation}
                    </span>
                    <div className="flex-1 h-0.5 border-t border-dashed border-[#8C9A9F]/50" />
                    <span className="font-mono text-xs text-[#8C9A9F] shrink-0">
                      {selectedDomain.attemptedTarget}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  {selectedDomain.description}
                </p>
              </div>

              <div className="lg:col-span-5 lg:border-l lg:border-[#26333C] lg:pl-8 space-y-3">
                <div className="font-mono text-xs uppercase text-[#8C9A9F]">
                  Operational Friction: {selectedDomain.latencyLabel}
                </div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#EEF3F0]">
                  THE COST IS IN THE GAPS.
                </div>
                <p className="text-xs font-mono text-[#E8B66E]">
                  Active queue impact:{' '}
                  {(simulateQueueSurge
                    ? selectedDomain.queueDepth * 12
                    : selectedDomain.queueDepth
                  ).toLocaleString()}{' '}
                  items awaiting cross-system action
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE HANDOFF GAP */}
      <section
        id="scene-03"
        aria-label="The Handoff Gap"
        className="relative py-28 px-6 lg:px-12 border-t border-[#26333C]/70 bg-transparent"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end bg-[#090D11]/88 p-6 -m-6 rounded-lg">
            <div className="lg:col-span-7 space-y-4">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4]">
                The Handoff Gap
              </p>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
                WE ADDED MORE TOOLS.
                <br />
                THE HANDOFFS REMAINED.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base text-[#8C9A9F] leading-relaxed">
                Dashboards reveal performance. Planning tools allocate resources. Task automation
                completes predefined steps. AI assistants draft text. Each solves a real problem,
                yet connecting insight, decisions, execution, and outcomes still requires someone in
                the middle.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous tool category"
                  onClick={() =>
                    setActiveToolIdx(
                      (prev) => (prev - 1 + TOOL_GALLERY_ITEMS.length) % TOOL_GALLERY_ITEMS.length
                    )
                  }
                  className="p-2 rounded-lg border border-[#26333C] bg-[#090D11]/80 text-[#EEF3F0] hover:border-[#5DDEC4] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next tool category"
                  onClick={() =>
                    setActiveToolIdx((prev) => (prev + 1) % TOOL_GALLERY_ITEMS.length)
                  }
                  className="p-2 rounded-lg border border-[#26333C] bg-[#090D11]/80 text-[#EEF3F0] hover:border-[#5DDEC4] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-[#8C9A9F] ml-2">
                  Selected Category: {activeTool.category} ({activeTool.headline})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAttemptTraceActive((prev) => !prev);
                  soundEngine.play('fragmentation');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#121A20] border border-[#5DDEC4] text-[#5DDEC4] hover:bg-[#5DDEC4] hover:text-[#090D11] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {attemptTraceActive
                  ? 'Reset Handoff Inspection'
                  : 'Inspect Cross-Tool Handoffs'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {TOOL_GALLERY_ITEMS.map((item, idx) => {
                const isSelected = idx === activeToolIdx;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveToolIdx(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveToolIdx(idx);
                      }
                    }}
                    className={`p-7 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between min-h-[300px] ${
                      isSelected
                        ? 'bg-[#121A20] border-[#5DDEC4]'
                        : 'bg-[#090D11]/90 border-[#26333C] hover:border-[#5DDEC4]/50'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-[#5DDEC4]">{item.category}</span>
                        {attemptTraceActive && (
                          <span className="text-[#E8B66E] font-semibold">Manual Handoff</span>
                        )}
                      </div>
                      <h3 className="font-display text-4xl font-extrabold tracking-tight text-[#EEF3F0]">
                        {item.headline}
                      </h3>
                      <p className="text-sm font-semibold text-[#5DDEC4]">
                        {item.supportingMessage}
                      </p>
                      <p className="text-xs text-[#8C9A9F] leading-relaxed">{item.whatItSolves}</p>
                    </div>

                    <div className="pt-5 mt-6 border-t border-[#26333C] space-y-1">
                      <div className="font-mono text-[10px] uppercase text-[#E8B66E]">
                        Where It Stops
                      </div>
                      <p className="text-xs text-[#8C9A9F] leading-snug">
                        {item.unresolvedHandoff}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="py-10 text-center space-y-4 max-w-4xl mx-auto">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#5DDEC4]">
              The Missing Layer
            </p>
            <h3 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] leading-[0.98] text-[#EEF3F0]">
              WHO CONNECTS THE DECISION
              <br />
              TO THE ACTION?
            </h3>
            <p className="text-base sm:text-lg text-[#8C9A9F] pt-2">
              The missing capability is not another isolated point tool.{' '}
              <strong className="text-[#EEF3F0] font-semibold">
                It is a continuous operating model.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CLOSED-LOOP ARCHITECTURE */}
      <section
        id="scene-04"
        aria-label="Closed-Loop Operating Model"
        className="relative py-28 px-6 lg:px-12 border-t border-[#26333C]/70 bg-transparent"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="max-w-4xl space-y-4 p-6 -m-6 rounded-lg bg-[#090D11]/88">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
              Closed-Loop Architecture
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
              WHAT IF THE SYSTEM
              <br />
              COULD CLOSE THE LOOP?
            </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {loopSteps.map((step, idx) => {
                const isSelected = activeLoopStep === idx;
                return (
                  <button
                    key={step.keyword}
                    type="button"
                    onClick={() => {
                      setActiveLoopStep(idx);
                      soundEngine.play('dark_to_light');
                    }}
                    className={`p-5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#121A20] border-[#5DDEC4] text-[#EEF3F0]'
                        : 'bg-[#090D11]/85 border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                    }`}
                  >
                    <div className="font-mono text-xs text-[#5DDEC4]">{step.category}</div>
                    <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
                      {step.keyword}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-8 rounded-lg bg-[#121A20]/95 border border-[#26333C] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-1">
                <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  {loopSteps[activeLoopStep]!.category}
                </div>
                <div className="text-2xl font-bold text-[#EEF3F0]">
                  {loopSteps[activeLoopStep]!.verb}
                </div>
              </div>
              <div className="lg:col-span-8 text-base text-[#8C9A9F] leading-relaxed">
                {loopSteps[activeLoopStep]!.detail}
              </div>
            </div>
          </div>

          <div className="pt-6 p-6 -m-6 rounded-lg bg-[#090D11]/88 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3">
              <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#5DDEC4] font-semibold">
                Unified Enterprise Platform
              </p>
              <h3 className="font-display text-5xl sm:text-7xl lg:text-[80px] font-extrabold tracking-[-0.04em] leading-[0.94] text-[#EEF3F0]">
                INTRODUCING EKARVO.
              </h3>
              <p className="text-lg sm:text-xl text-[#8C9A9F] max-w-2xl">
                An industry-agnostic enterprise platform that connects operating intelligence with
                governed autonomous execution.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateScene('scene-05')}
              className="px-7 py-4 text-sm font-semibold rounded-lg bg-[#5DDEC4] text-[#090D11] hover:bg-[#4bcbb1] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore Pulse &amp; Drive
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: PLATFORM ARCHITECTURE (PULSE & DRIVE) */}
      <section
        id="scene-05"
        aria-label="Platform Architecture"
        className="relative py-28 px-6 lg:px-12 border-t border-[#26333C]/70 bg-transparent"
      >
        <div className="max-w-[1440px] mx-auto space-y-14">
          <div className="p-6 -m-6 rounded-lg bg-[#090D11]/90 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
                Two Platforms, One Operating Model
              </p>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
                INTELLIGENCE
                <br />
                MEETS EXECUTION.
              </h2>
            </div>
            <p className="text-base sm:text-lg text-[#8C9A9F] max-w-md">
              Deploy EKARVO Pulse and EKARVO Drive independently or together as a single
              closed-loop operating system across any enterprise function.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* EKARVO PULSE */}
            <div
              onMouseEnter={() => onHoverProduct('pulse')}
              onMouseLeave={() => onHoverProduct('none')}
              className={`lg:col-span-5 p-8 rounded-lg bg-[#121A20]/94 border flex flex-col justify-between space-y-8 transition-colors ${
                hoveredProduct === 'pulse' ? 'border-[#5DDEC4]' : 'border-[#26333C]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-[#5DDEC4]">
                  <span>EKARVO PULSE</span>
                  <span>12 CAPABILITY MODULES</span>
                </div>
                <h3 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#EEF3F0]">
                  PULSE
                </h3>
                <p className="text-sm font-semibold text-[#5DDEC4]">
                  The Operating Intelligence Platform
                </p>
                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  Understand demand, anticipate capacity constraints, benchmark performance, develop
                  workforce readiness, and identify high-impact operational improvements.
                </p>
                <div className="pt-2 font-mono text-xs space-y-1.5 text-[#EEF3F0]/85">
                  <div>Plan: Forecast · Capacity · Allocate · Simulate</div>
                  <div>Operate: Command · Perform · Quality · Economics</div>
                  <div>Develop &amp; Optimize: Academy · Coach · Discover · Optimize</div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#26333C] flex items-center justify-between">
                <span className="font-mono text-xs text-[#8C9A9F]">Pulse knows where to act.</span>
                <button
                  type="button"
                  onClick={() => onNavigateScene('scene-06')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#5DDEC4] text-[#090D11] hover:bg-[#4bcbb1] cursor-pointer"
                >
                  <span>Explore Pulse</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center 3D Sculpture Window */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-6 text-center pointer-events-none">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[#8C9A9F] mb-2">
                Closed Loop
              </div>
              <div className="w-full h-px bg-[#26333C] relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5DDEC4] absolute -top-1 left-1/2 -translate-x-1/2" />
              </div>
              <div className="font-mono text-[10px] text-[#5DDEC4] mt-2">
                Insight to Action
              </div>
            </div>

            {/* EKARVO DRIVE */}
            <div
              onMouseEnter={() => onHoverProduct('drive')}
              onMouseLeave={() => onHoverProduct('none')}
              className={`lg:col-span-5 p-8 rounded-lg bg-[#121A20]/94 border flex flex-col justify-between space-y-8 transition-colors ${
                hoveredProduct === 'drive' ? 'border-[#5DDEC4]' : 'border-[#26333C]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs font-semibold text-[#5DDEC4]">
                  <span>EKARVO DRIVE</span>
                  <span>15 CAPABILITY MODULES</span>
                </div>
                <h3 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#EEF3F0]">
                  DRIVE
                </h3>
                <p className="text-sm font-semibold text-[#5DDEC4]">
                  The Autonomous Execution Platform
                </p>
                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  Design, coordinate, and execute multi-step workflows across enterprise
                  applications, external portals, documents, and communication channels.
                </p>
                <div className="pt-2 font-mono text-xs space-y-1.5 text-[#EEF3F0]/85">
                  <div>Design: Studio · Agents · Knowledge</div>
                  <div>Execute: Voice · Browser · Connect · Document · Interact · Desktop</div>
                  <div>Orchestrate &amp; Assure: Flow · Context · Control · Verify · Runtime</div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#26333C] flex items-center justify-between">
                <span className="font-mono text-xs text-[#8C9A9F]">Drive makes the work happen.</span>
                <button
                  type="button"
                  onClick={() => onNavigateScene('scene-07')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#5DDEC4] text-[#090D11] hover:bg-[#4bcbb1] cursor-pointer"
                >
                  <span>Explore Drive</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
