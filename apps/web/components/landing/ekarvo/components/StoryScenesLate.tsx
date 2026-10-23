import React, { useState } from 'react';
import {
  CAPABILITY_ATLAS,
  CapabilityModule,
  TRUST_LAYERS,
} from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { ArrowRight, CheckCircle2, Layers, Shield } from 'lucide-react';

interface StoryScenesLateProps {
  operatingModelMode: 'fragmented' | 'connected' | 'autonomous';
  onChangeOperatingModel: (mode: 'fragmented' | 'connected' | 'autonomous') => void;
  onNavigateScene: (sceneId: string) => void;
  onOpenModal: (modal: 'contact' | 'platform' | 'solutions' | 'company') => void;
}

export const StoryScenesLate: React.FC<StoryScenesLateProps> = ({
  operatingModelMode,
  onChangeOperatingModel,
  onNavigateScene,
  onOpenModal,
}) => {
  // Capability Architecture state
  const [atlasProduct, setAtlasProduct] = useState<'Pulse' | 'Drive'>('Pulse');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('pulse-simulate');
  const [showAccessibleIndex, setShowAccessibleIndex] = useState<boolean>(false);

  // Governance Layer state
  const [selectedTrustLayerId, setSelectedTrustLayerId] = useState<string>('authority');

  const filteredModules = CAPABILITY_ATLAS.filter((m) => m.product === atlasProduct);
  const selectedModule: CapabilityModule =
    CAPABILITY_ATLAS.find((m) => m.id === selectedModuleId) || CAPABILITY_ATLAS[3]!;

  const groups = Array.from(new Set(filteredModules.map((m) => m.group)));

  const activeTrustLayer =
    TRUST_LAYERS.find((l) => l.id === selectedTrustLayerId) || TRUST_LAYERS[1]!;

  const operatingStates = {
    fragmented: {
      category: 'Legacy State',
      title: 'Fragmented operations',
      summary:
        'Work moves between disconnected teams and systems. Handoffs are manual and operational context is dispersed across tools.',
      humanRole: 'Manual coordination across spreadsheets, emails, and portals.',
      digitalRole: 'Isolated task scripts that stall when upstream context changes.',
      verificationState: 'Retrospective sampling weeks after work is completed.',
    },
    connected: {
      category: 'Intelligence State',
      title: 'Connected operations',
      summary:
        'Workloads, skills, constraints, and business context are unified in a live operational model so leaders make proactive decisions.',
      humanRole: 'Proactive capacity planning and scenario-tested resource allocation.',
      digitalRole: 'Unified operational model linking incoming demand to workforce capability.',
      verificationState: 'Live service level visibility and continuous performance attribution.',
    },
    autonomous: {
      category: 'Closed-Loop State',
      title: 'Governed autonomous operations',
      summary:
        'Eligible workflows move through governed digital execution pathways while human specialists focus on judgment, policy authority, and exceptions.',
      humanRole: 'High-judgment decisions, policy authority, and team development.',
      digitalRole: 'Multi-channel execution across voice, browser, documents, APIs, and desktop.',
      verificationState: 'Every completed action verified against target system state.',
    },
  };

  const currentOpState = operatingStates[operatingModelMode];

  const readinessPillars = [
    {
      title: 'Access control and identity integration',
      desc: 'Scoped role-based authority, short-lived service identities, and enterprise SSO/IAM federation.',
    },
    {
      title: 'Data isolation and security architecture',
      desc: 'Tenant-isolated data planes, field-level data masking, and encrypted transit and storage.',
    },
    {
      title: 'Auditability and evidence',
      desc: 'Every attempted and completed action generates a replayable trace and verification record.',
    },
    {
      title: 'Human approvals and exception management',
      desc: 'Configurable monetary and policy guardrails pause execution until authorized by designated staff.',
    },
    {
      title: 'Deployment and integration options',
      desc: 'Cloud-managed or VPC-isolated runtime environments connecting via APIs, browsers, and virtual desktops.',
    },
    {
      title: 'Operational monitoring and reliability',
      desc: 'Continuous fleet observability, automated retry policies, and graceful fallback routing.',
    },
  ];

  return (
    <>
      {/* SECTION 9: OPERATING MODEL EVOLUTION */}
      <section
        id="scene-09"
        aria-label="Operating Model Evolution"
        className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
      >
        <div className="max-w-[1440px] mx-auto space-y-16">
          <div className="max-w-4xl space-y-4">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
              Operating Model Evolution
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
              NOT JUST AUTOMATED TASKS.
              <br />
              A BETTER WAY TO OPERATE.
            </h2>
            <p className="text-base sm:text-lg text-[#8C9A9F] max-w-2xl leading-relaxed">
              Connect people, digital workers, business knowledge, decisions, and execution through
              one coordinated operating model.
            </p>
          </div>

          {/* Interactive Operating Model Selector */}
          <div className="p-8 sm:p-10 rounded-lg bg-[#121A20]/94 border border-[#26333C] space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#26333C] pb-6">
              <div>
                <div className="font-mono text-xs uppercase text-[#5DDEC4] font-semibold">
                  Operating Model Architecture
                </div>
                <h3 className="text-lg font-bold text-[#EEF3F0] mt-1">
                  Compare how teams, systems, and verification evolve across operating states
                </h3>
              </div>

              <div
                role="tablist"
                aria-label="Operating Model State"
                className="flex flex-wrap items-center gap-2"
              >
                {(
                  [
                    { id: 'fragmented', label: 'Fragmented' },
                    { id: 'connected', label: 'Connected' },
                    { id: 'autonomous', label: 'Governed Autonomous' },
                  ] as const
                ).map((st) => {
                  const active = operatingModelMode === st.id;
                  return (
                    <button
                      key={st.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => {
                        onChangeOperatingModel(st.id);
                        soundEngine.play('network_connection');
                      }}
                      className={`px-5 py-2.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#5DDEC4] border-[#5DDEC4] text-[#090D11]'
                          : 'bg-[#090D11] border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-3">
                <span className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  {currentOpState.category}
                </span>
                <h4 className="font-display text-3xl font-extrabold tracking-tight text-[#EEF3F0]">
                  {currentOpState.title}
                </h4>
                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  {currentOpState.summary}
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t lg:border-t-0 lg:border-l border-[#26333C] pt-6 lg:pt-0 lg:pl-8">
                <div className="space-y-2">
                  <div className="font-mono text-xs uppercase text-[#5DDEC4] font-semibold">
                    Human Teams
                  </div>
                  <p className="text-xs text-[#EEF3F0]/90 leading-relaxed">
                    {currentOpState.humanRole}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-mono text-xs uppercase text-[#5DDEC4] font-semibold">
                    Digital Execution
                  </div>
                  <p className="text-xs text-[#EEF3F0]/90 leading-relaxed">
                    {currentOpState.digitalRole}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-mono text-xs uppercase text-[#5DDEC4] font-semibold">
                    Verification
                  </div>
                  <p className="text-xs text-[#EEF3F0]/90 leading-relaxed">
                    {currentOpState.verificationState}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-[#EEF3F0]">
              HUMAN JUDGMENT. DIGITAL EXECUTION.
              <br />
              <span className="text-[#5DDEC4]">ONE COORDINATED OPERATION.</span>
            </h3>
          </div>
        </div>
      </section>

      {/* SECTION 10: CAPABILITY ARCHITECTURE (27 MODULES) */}
      <section
        id="scene-10"
        aria-label="Capability Architecture"
        className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
      >
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
                Capability Architecture · 27 Modules
              </p>
              <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
                ONE PLATFORM VISION.
                <br />
                PURPOSE-BUILT CAPABILITIES.
              </h2>
              <p className="text-base sm:text-lg text-[#8C9A9F]">
                Start with the capabilities your operation needs today. Expand across teams,
                workflows, and enterprise systems at your own pace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAtlasProduct('Pulse');
                    setSelectedModuleId('pulse-simulate');
                  }}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                    atlasProduct === 'Pulse'
                      ? 'bg-[#5DDEC4] border-[#5DDEC4] text-[#090D11]'
                      : 'bg-[#121A20] border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                  }`}
                >
                  Pulse (12 Modules)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAtlasProduct('Drive');
                    setSelectedModuleId('drive-flow');
                  }}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                    atlasProduct === 'Drive'
                      ? 'bg-[#5DDEC4] border-[#5DDEC4] text-[#090D11]'
                      : 'bg-[#121A20] border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                  }`}
                >
                  Drive (15 Modules)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAccessibleIndex((prev) => !prev)}
                className="px-4 py-2.5 text-xs font-medium rounded-lg bg-[#121A20] border border-[#26333C] text-[#EEF3F0] hover:border-[#5DDEC4] cursor-pointer"
              >
                {showAccessibleIndex ? 'Hide Full 27-Module Directory' : 'Full 27-Module Index'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              {groups.map((grp) => {
                const grpModules = filteredModules.filter((m) => m.group === grp);
                return (
                  <div
                    key={grp}
                    className="p-5 rounded-lg bg-[#121A20]/92 border border-[#26333C] space-y-3"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-[#5DDEC4] font-semibold">
                      <span>
                        {atlasProduct.toUpperCase()} · {grp}
                      </span>
                      <span>{grpModules.length} MODULES</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {grpModules.map((mod) => {
                        const isSelected = mod.id === selectedModule.id;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => {
                              setSelectedModuleId(mod.id);
                              soundEngine.play('initial_signal');
                            }}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#172127] border-[#5DDEC4] text-[#EEF3F0]'
                                : 'bg-[#090D11] border-[#26333C] text-[#EEF3F0] hover:border-[#5DDEC4]/60'
                            }`}
                          >
                            <div className="text-xs font-bold">{mod.name}</div>
                            <div
                              className={`font-mono text-[10px] mt-1 ${
                                isSelected ? 'text-[#5DDEC4]' : 'text-[#8C9A9F]'
                              }`}
                            >
                              Inspect
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Module Inspector */}
            <div className="lg:col-span-5 p-6 lg:p-8 rounded-lg bg-[#121A20]/94 border border-[#5DDEC4]/60 space-y-6">
              <div className="space-y-2 border-b border-[#26333C] pb-4">
                <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  {selectedModule.product.toUpperCase()} · {selectedModule.group} ·{' '}
                  {selectedModule.name.toUpperCase()}
                </div>
                <h3 className="font-display text-3xl font-extrabold text-[#EEF3F0]">
                  {selectedModule.name}
                </h3>
                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  {selectedModule.problemSolved}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-xs uppercase text-[#EEF3F0] font-semibold">
                  Key Capabilities
                </div>
                <ul className="space-y-1.5 text-xs text-[#8C9A9F]">
                  {selectedModule.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5DDEC4] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-xs uppercase text-[#EEF3F0] font-semibold">
                  Operational Applications
                </div>
                <div className="space-y-1.5 text-xs text-[#8C9A9F]">
                  {selectedModule.useCases.map((uc) => (
                    <div
                      key={uc}
                      className="p-2.5 rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0]"
                    >
                      {uc}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#26333C] flex items-center justify-between text-xs font-mono">
                <span className="text-[#8C9A9F]">
                  Connected Modules: {selectedModule.connectedModules.join(' · ')}
                </span>
              </div>
            </div>
          </div>

          {showAccessibleIndex && (
            <div className="p-6 rounded-lg bg-[#121A20]/94 border border-[#26333C] space-y-4">
              <div className="font-mono text-xs font-semibold text-[#5DDEC4]">
                COMPLETE PLATFORM DIRECTORY (27 MODULES)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                {CAPABILITY_ATLAS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setAtlasProduct(m.product);
                      setSelectedModuleId(m.id);
                    }}
                    className="p-2.5 rounded-lg bg-[#090D11] border border-[#26333C] text-left hover:border-[#5DDEC4] cursor-pointer"
                  >
                    <div className="font-mono text-[10px] text-[#8C9A9F]">
                      {m.product} · {m.group}
                    </div>
                    <div className="font-bold text-[#EEF3F0]">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 11: ENTERPRISE GOVERNANCE */}
      <section
        id="scene-11"
        aria-label="Enterprise Governance"
        className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
      >
        <div className="max-w-[1440px] mx-auto space-y-14">
          <div className="max-w-3xl space-y-3">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
              Enterprise Governance &amp; Control
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
              AUTONOMY
              <br />
              WITHOUT LOSING CONTROL.
            </h2>
            <p className="text-base sm:text-lg text-[#8C9A9F]">
              Define what software is permitted to do. Require human approvals where judgment is
              needed. Preserve complete execution evidence and verify every result.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 space-y-3">
              {TRUST_LAYERS.map((layer) => {
                const isSelected = layer.id === activeTrustLayer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onMouseEnter={() => setSelectedTrustLayerId(layer.id)}
                    onClick={() => {
                      setSelectedTrustLayerId(layer.id);
                      soundEngine.play('network_connection');
                    }}
                    className={`w-full p-5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#172127] border-[#5DDEC4] text-[#EEF3F0]'
                        : 'bg-[#121A20]/90 border-[#26333C] text-[#EEF3F0] hover:border-[#5DDEC4]/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-[#5DDEC4]">{layer.layerNumber}</div>
                      <div className="text-base font-bold">{layer.question}</div>
                      <div className="text-xs text-[#8C9A9F]">{layer.summary}</div>
                    </div>
                    <Layers
                      className={`w-5 h-5 shrink-0 ml-4 ${
                        isSelected ? 'text-[#5DDEC4]' : 'text-[#8C9A9F]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-6 p-8 rounded-lg bg-[#121A20]/94 border border-[#26333C] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26333C] pb-3 font-mono text-xs">
                  <span className="text-[#5DDEC4] font-semibold">
                    {activeTrustLayer.layerNumber.toUpperCase()}
                  </span>
                  <span className="text-[#8C9A9F]">{activeTrustLayer.executionStepLink}</span>
                </div>

                <h3 className="font-display text-3xl font-extrabold text-[#EEF3F0]">
                  {activeTrustLayer.question}
                </h3>
                <p className="text-sm text-[#8C9A9F] leading-relaxed">
                  {activeTrustLayer.summary}
                </p>

                <div className="space-y-3 pt-2">
                  {activeTrustLayer.inspectableFields.map((f) => (
                    <div
                      key={f.label}
                      className="p-3.5 rounded-lg bg-[#090D11] border border-[#26333C] space-y-1"
                    >
                      <div className="font-mono text-[11px] text-[#5DDEC4] font-semibold">
                        {f.label}
                      </div>
                      <div className="text-xs text-[#EEF3F0]">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#26333C] text-xs">
                <div>
                  <div className="font-bold text-[#EEF3F0]">Bounded autonomy</div>
                  <div className="text-[11px] text-[#8C9A9F]">Defined policy limits</div>
                </div>
                <div>
                  <div className="font-bold text-[#EEF3F0]">Human oversight</div>
                  <div className="text-[11px] text-[#8C9A9F]">Explicit authorization</div>
                </div>
                <div>
                  <div className="font-bold text-[#EEF3F0]">Execution evidence</div>
                  <div className="text-[11px] text-[#8C9A9F]">Full trace recording</div>
                </div>
                <div>
                  <div className="font-bold text-[#EEF3F0]">Outcome verification</div>
                  <div className="text-[11px] text-[#8C9A9F]">Confirmed state</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Readiness Architecture Grid */}
          <div className="pt-8 border-t border-[#26333C] space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-[#5DDEC4] font-semibold">
              <Shield className="w-4 h-4" />
              <span>ENTERPRISE READINESS &amp; ARCHITECTURAL SAFEGUARDS</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readinessPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-6 rounded-lg bg-[#121A20]/90 border border-[#26333C] space-y-1.5"
                >
                  <h4 className="text-sm font-bold text-[#EEF3F0]">{pillar.title}</h4>
                  <p className="text-xs text-[#8C9A9F] leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: CLOSING CTA & FOOTER */}
      <section
        id="scene-12"
        aria-label="Get Started with EKARVO"
        className="relative min-h-[85dvh] pt-28 pb-16 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C] flex flex-col justify-between"
      >
        <div className="max-w-[1440px] mx-auto w-full my-auto py-12 space-y-10">
          <div className="space-y-4 max-w-4xl">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#5DDEC4]">
              Autonomous Enterprise Operations
            </p>
            <p className="text-xl sm:text-2xl text-[#8C9A9F] font-medium">
              The next operating model is ready to be built.
            </p>
            <h2 className="font-display text-6xl sm:text-8xl lg:text-[104px] font-extrabold tracking-[-0.04em] leading-[0.92] text-[#EEF3F0]">
              WORK.
              <br />
              DONE.
              <br />
              <span className="text-[#5DDEC4]">VERIFIED.</span>
            </h2>
            <p className="text-lg sm:text-xl text-[#EEF3F0]/85 max-w-xl pt-2">
              Bring operating intelligence and autonomous execution together with EKARVO.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.play('final_resolve');
                onOpenModal('contact');
              }}
              className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold text-[#090D11] bg-[#5DDEC4] rounded-lg hover:bg-[#4bcbb1] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Talk to EKARVO</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.play('final_resolve');
                onNavigateScene('scene-08');
              }}
              className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold text-[#EEF3F0] bg-[#121A20]/90 border border-[#26333C] rounded-lg hover:border-[#5DDEC4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore Closed-Loop Workflows</span>
              <ArrowRight className="w-4 h-4 text-[#5DDEC4]" />
            </button>
          </div>
        </div>

        {/* Enterprise Footer */}
        <footer className="max-w-[1440px] mx-auto w-full pt-12 border-t border-[#26333C] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-xs text-[#8C9A9F]">
          <div className="space-y-1">
            <div className="font-display text-sm font-extrabold tracking-[0.22em] text-[#EEF3F0]">
              EKARVO
            </div>
            <div>Intelligence. Execution. Verified Outcomes.</div>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-5">
              <span className="font-mono text-[11px] text-[#EEF3F0]">Platform:</span>
              <a
                href="#scene-06"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateScene('scene-06');
                }}
                className="hover:text-[#EEF3F0]"
              >
                Pulse
              </a>
              <a
                href="#scene-07"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateScene('scene-07');
                }}
                className="hover:text-[#EEF3F0]"
              >
                Drive
              </a>
              <button
                type="button"
                onClick={() => onOpenModal('platform')}
                className="hover:text-[#EEF3F0] cursor-pointer"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('solutions')}
                className="hover:text-[#EEF3F0] cursor-pointer"
              >
                Use Cases
              </button>
            </div>

            <div className="flex items-center gap-5">
              <span className="font-mono text-[11px] text-[#EEF3F0]">Company:</span>
              <button
                type="button"
                onClick={() => onOpenModal('company')}
                className="hover:text-[#EEF3F0] cursor-pointer"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('contact')}
                className="hover:text-[#EEF3F0] cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
          <nav aria-label="Documentation and legal" className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[#8C9A9F]">
            <a className="inline-flex min-h-11 items-center hover:text-[#EEF3F0]" href="/landing/doc">Documentation</a>
            <a className="inline-flex min-h-11 items-center hover:text-[#EEF3F0]" href="/landing/legal/privacy-policy">Privacy</a>
            <a className="inline-flex min-h-11 items-center hover:text-[#EEF3F0]" href="/landing/legal/terms-of-service">Terms</a>
            <a className="inline-flex min-h-11 items-center hover:text-[#EEF3F0]" href="/landing/legal/cancellation-refund-policies">Refunds</a>
          </nav>
        </footer>
      </section>
    </>
  );
};
