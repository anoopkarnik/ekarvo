import React, { useState } from 'react';
import { SIMULATION_SCENARIOS } from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { FileCheck2, Play, RotateCcw, ShieldCheck } from 'lucide-react';

export const SimulationStudio: React.FC = () => {
  const [scenarioKey, setScenarioKey] = useState<'claims' | 'support' | 'finance'>('claims');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('STEP-01');
  const [perspective, setPerspective] = useState<'combined' | 'pulse' | 'drive'>('combined');

  const scenario = SIMULATION_SCENARIOS[scenarioKey];
  const currentStep =
    scenario.executionSteps[Math.min(activeStepIndex, scenario.executionSteps.length - 1)]!;
  const selectedEvidence =
    scenario.evidenceTrail.find((e) => e.eventId === selectedEvidenceId) ||
    scenario.evidenceTrail[0]!;

  const handleScenarioChange = (nextKey: 'claims' | 'support' | 'finance') => {
    setScenarioKey(nextKey);
    setActiveStepIndex(5);
    setIsAuthorized(true);
    setSelectedEvidenceId(SIMULATION_SCENARIOS[nextKey].evidenceTrail[0]!.eventId);
    soundEngine.play('product_reveal');
  };

  const handleAdvanceStep = () => {
    if (activeStepIndex === 3 && !isAuthorized) {
      setIsAuthorized(true);
    }
    setActiveStepIndex((prev) => (prev + 1) % scenario.executionSteps.length);
    soundEngine.play('execution_complete');
  };

  return (
    <section
      id="scene-08"
      aria-label="Closed-Loop Workflows"
      className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
    >
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Header & Operational Function Selector */}
        <div className="p-6 -m-6 bg-[#090D11]/90 rounded-lg flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
              Closed-Loop Workflows · Pulse + Drive
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
              FROM SIGNAL
              <br />
              TO OUTCOME.
            </h2>
            <p className="text-base sm:text-lg text-[#8C9A9F] leading-relaxed">
              Explore how EKARVO connects operational intelligence, decision simulation, governed
              execution, and outcome verification across any enterprise function.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase text-[#8C9A9F]">
              Select an Operational Function
            </div>
            <div
              role="tablist"
              aria-label="Select an operational function"
              className="flex flex-wrap items-center gap-2"
            >
              {(
                [
                  { id: 'claims', label: 'Service & Case Operations' },
                  { id: 'support', label: 'Supply & Order Coordination' },
                  { id: 'finance', label: 'Financial & Shared Services' },
                ] as const
              ).map((tab) => {
                const active = scenarioKey === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => handleScenarioChange(tab.id)}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#5DDEC4] border-[#5DDEC4] text-[#090D11]'
                        : 'bg-[#121A20] border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workflow Stage Toolbar & 7-Stage Pipeline */}
        <div className="p-6 rounded-lg bg-[#121A20]/94 border border-[#26333C] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26333C] pb-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="font-semibold text-[#5DDEC4]">{scenario.name.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#8C9A9F]">{scenario.domainLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#090D11] border border-[#26333C] text-xs">
                {(['combined', 'pulse', 'drive'] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setPerspective(view)}
                    className={`px-2.5 py-1 rounded font-medium capitalize cursor-pointer ${
                      perspective === view
                        ? 'bg-[#5DDEC4] text-[#090D11]'
                        : 'text-[#8C9A9F] hover:text-[#EEF3F0]'
                    }`}
                  >
                    {view === 'combined' ? 'Pulse + Drive' : view}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAdvanceStep}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[#090D11] bg-[#5DDEC4] hover:bg-[#4bcbb1] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Next Stage ({currentStep.phase})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStepIndex(0);
                  soundEngine.play('initial_signal');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#EEF3F0] bg-[#090D11] border border-[#26333C] hover:border-[#5DDEC4] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          {/* 7-Stage Closed-Loop Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {scenario.executionSteps.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              const isCompleted = idx <= activeStepIndex;
              return (
                <button
                  key={step.phase}
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(idx);
                    soundEngine.play('network_connection');
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#172127] border-[#5DDEC4] text-[#EEF3F0]'
                      : isCompleted
                      ? 'bg-[#090D11] border-[#26333C] text-[#EEF3F0]'
                      : 'bg-[#090D11]/50 border-[#26333C]/60 text-[#8C9A9F]'
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold truncate text-[#5DDEC4]">
                    {step.phase}
                  </div>
                  <div className="text-xs font-bold mt-1 truncate">{step.stateLabel}</div>
                  <div className="font-mono text-[10px] mt-0.5 truncate text-[#8C9A9F]">
                    {step.owner}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Closed-Loop Workspace */}
        <div className="rounded-lg grid grid-cols-1 lg:grid-cols-12 border border-[#26333C] bg-[#121A20]/94 divide-y lg:divide-y-0 lg:divide-x divide-[#26333C]">
          {/* LEFT COLUMN: Operational Context (Pulse) */}
          <div
            className={`lg:col-span-4 p-6 flex flex-col justify-between space-y-6 ${
              perspective === 'drive' ? 'opacity-60' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#26333C] pb-3">
                <span className="font-mono text-xs font-semibold text-[#5DDEC4]">
                  OPERATIONAL CONTEXT (PULSE)
                </span>
                <span className="font-mono text-xs text-[#8C9A9F]">Detect &amp; Simulate</span>
              </div>

              <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] space-y-2 text-xs">
                <div className="font-bold text-[#EEF3F0]">{scenario.queueName}</div>
                <div className="text-[#5DDEC4]">{scenario.signalAlert}</div>
                <div className="text-[#E8B66E]">{scenario.riskExposure}</div>
                <div className="pt-2 border-t border-[#26333C] flex justify-between font-mono tabular-nums text-[#8C9A9F]">
                  <span>Queue Volume: {scenario.backlogCount}</span>
                  <span className="text-[#EEF3F0] font-semibold">
                    Drive Eligible: {scenario.eligibleForDriveCount}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-mono text-[11px] uppercase text-[#8C9A9F]">
                  Pulse Recommendation
                </div>
                <h3 className="text-base font-bold text-[#EEF3F0]">
                  {scenario.recommendationTitle}
                </h3>
                <p className="text-xs text-[#8C9A9F] leading-relaxed">
                  {scenario.recommendationAssumptions}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[11px] uppercase text-[#8C9A9F]">
                  Simulated Interventions
                </div>
                <div className="space-y-2">
                  {scenario.interventions.map((intv) => (
                    <div
                      key={intv.id}
                      className={`p-3 rounded-lg border text-xs ${
                        intv.recommended
                          ? 'bg-[#090D11] border-[#5DDEC4]'
                          : 'bg-[#090D11]/60 border-[#26333C]'
                      }`}
                    >
                      <div className="font-semibold text-[#EEF3F0] flex items-center justify-between gap-2">
                        <span>{intv.name}</span>
                        {intv.recommended && (
                          <span className="font-mono text-[10px] text-[#5DDEC4] shrink-0">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#8C9A9F] mt-1.5 tabular-nums">
                        <span>{intv.costLabel}</span>
                        <span>{intv.throughputLabel}</span>
                        <span className="text-[#EEF3F0]">{intv.slaRiskLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#26333C] font-mono text-[11px] text-[#8C9A9F]">
              Closed-Loop Feedback: Verified Drive completions automatically update this Pulse
              model.
            </div>
          </div>

          {/* CENTER COLUMN: Execution Journey (Drive + Authority) */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#26333C] pb-3">
                <span className="font-mono text-xs font-semibold text-[#5DDEC4]">
                  EXECUTION JOURNEY
                </span>
                <span className="font-mono text-xs text-[#8C9A9F]">
                  Stage {currentStep.stepNumber} of 7
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#5DDEC4]">
                  <span>{currentStep.phase}</span>
                  <span>{currentStep.owner}</span>
                </div>
                <h4 className="text-base font-bold text-[#EEF3F0]">{currentStep.title}</h4>
                <p className="text-xs text-[#8C9A9F] leading-relaxed">{currentStep.detail}</p>
                {currentStep.channelUsed && (
                  <div className="pt-2 font-mono text-[11px] text-[#5DDEC4]">
                    Channels: {currentStep.channelUsed}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#8C9A9F]">
                  <span>POLICY &amp; AUTHORITY BOUNDARIES</span>
                  <button
                    type="button"
                    onClick={() => setIsAuthorized((prev) => !prev)}
                    className="text-[#5DDEC4] font-semibold hover:underline cursor-pointer"
                  >
                    {isAuthorized ? 'Authorized' : 'Approval Required'}
                  </button>
                </div>
                <div className="space-y-1.5">
                  {scenario.policyConditions.map((pol) => (
                    <div
                      key={pol.rule}
                      className="p-2.5 rounded-lg bg-[#090D11] border border-[#26333C] flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-[#EEF3F0] leading-snug">{pol.rule}</span>
                      <span
                        className={`font-mono text-[11px] font-semibold shrink-0 ${
                          pol.status === 'PERMITTED' ? 'text-[#5DDEC4]' : 'text-[#E8B66E]'
                        }`}
                      >
                        {pol.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[11px] uppercase text-[#8C9A9F]">
                  Execution &amp; Verification Stages
                </div>
                <div className="space-y-2">
                  {scenario.evidenceTrail.map((ev) => {
                    const selected = ev.eventId === selectedEvidence.eventId;
                    return (
                      <button
                        key={ev.eventId}
                        type="button"
                        onClick={() => {
                          setSelectedEvidenceId(ev.eventId);
                          soundEngine.play('execution_complete');
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selected
                            ? 'bg-[#090D11] border-[#5DDEC4] text-[#EEF3F0]'
                            : 'bg-[#090D11]/60 border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-[11px] text-[#5DDEC4]">
                            {ev.timestamp}
                          </div>
                          <div className="text-xs font-bold text-[#EEF3F0]">{ev.stepName}</div>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            ev.status === 'Confirmed' ? 'text-[#5DDEC4]' : 'text-[#E8B66E]'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Outcome and Verification */}
          <div className="lg:col-span-4 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#26333C] pb-3">
                <span className="font-mono text-xs font-semibold text-[#5DDEC4]">
                  OUTCOME VERIFICATION
                </span>
                <FileCheck2 className="w-4 h-4 text-[#5DDEC4]" />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
                <div className="p-3 rounded-lg bg-[#090D11] border border-[#26333C]">
                  <div className="text-[#8C9A9F]">ELIGIBLE WORKLOAD</div>
                  <div className="font-bold text-[#EEF3F0] mt-0.5">
                    {scenario.eligibleForDriveCount} Items
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#090D11] border border-[#26333C]">
                  <div className="text-[#8C9A9F]">OUTCOME CONFIRMED</div>
                  <div className="font-bold text-[#5DDEC4] mt-0.5">
                    {scenario.eligibleForDriveCount - 12} Verified
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#090D11] border border-[#5DDEC4]/60 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#EEF3F0]">{selectedEvidence.stepName}</span>
                  <span className="text-[#5DDEC4] font-semibold">{selectedEvidence.status}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#8C9A9F]">Objective</div>
                    <div className="text-[#EEF3F0] font-medium mt-0.5">
                      {selectedEvidence.objective}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#8C9A9F]">
                      Authorized Action
                    </div>
                    <div className="text-[#EEF3F0] font-medium mt-0.5">
                      {selectedEvidence.authorizedAction}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#8C9A9F]">
                      Observed Result
                    </div>
                    <div className="text-[#EEF3F0] font-medium mt-0.5">
                      {selectedEvidence.actualResult}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#26333C]">
                    <div className="font-mono text-[10px] uppercase text-[#5DDEC4] font-semibold">
                      Verification Assurance
                    </div>
                    <div className="text-xs text-[#8C9A9F] mt-0.5">
                      {selectedEvidence.verificationEvidence}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5DDEC4]" />
                <span>OUTCOME VERIFIED</span>
              </div>
              <span className="text-[#5DDEC4]">12 Exceptions Routed to Specialists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
