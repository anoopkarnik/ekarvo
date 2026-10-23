import React, { useState } from 'react';
import { simulateCapacityIntervention } from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { ArrowRight, CheckCircle2, Sliders } from 'lucide-react';

interface PulseExperienceProps {
  onSendToDrive: (recommendationSummary: string) => void;
}

type PulseModeId = 'plan' | 'operate' | 'develop' | 'optimize';

export const PulseExperience: React.FC<PulseExperienceProps> = ({ onSendToDrive }) => {
  const [activeMode, setActiveMode] = useState<PulseModeId>('plan');
  const [interventionId, setInterventionId] = useState<string>('baseline');
  const [hoveredSlaQueue, setHoveredSlaQueue] = useState<string>('cross-system');
  const [selectedSkillGap, setSelectedSkillGap] = useState<'exceptions' | 'voice-clarity'>(
    'exceptions'
  );
  const [voiceMaskingConsent, setVoiceMaskingConsent] = useState<boolean>(true);

  const interventionResult = simulateCapacityIntervention(interventionId);

  const modes: {
    id: PulseModeId;
    label: string;
    headline: string;
    supporting: string;
    modules: string[];
  }[] = [
    {
      id: 'plan',
      label: 'PLAN',
      headline: 'See what is coming.',
      supporting:
        'Forecast demand, model workforce capacity, allocate work, and test scenarios before making commitments.',
      modules: ['Forecast', 'Capacity', 'Allocate', 'Simulate'],
    },
    {
      id: 'operate',
      label: 'OPERATE',
      headline: 'See what needs attention.',
      supporting:
        'Monitor service levels, productivity, quality, and operational economics in one connected view.',
      modules: ['Command', 'Perform', 'Quality', 'Economics'],
    },
    {
      id: 'develop',
      label: 'DEVELOP',
      headline: 'Build the workforce the operation needs.',
      supporting:
        'Identify skill gaps, recommend training pathways, guide coaching, and improve team readiness.',
      modules: ['Academy', 'Coach'],
    },
    {
      id: 'optimize',
      label: 'OPTIMIZE',
      headline: 'Find what matters. Improve what works.',
      supporting:
        'Discover process friction, structure evidence-backed interventions, and dispatch eligible work to Drive.',
      modules: ['Discover', 'Optimize'],
    },
  ];

  const currentModeObj = modes.find((m) => m.id === activeMode) || modes[0]!;

  const operateQueues = [
    {
      id: 'cross-system',
      name: 'Cross-System Resolution Queue',
      slaRisk: '27.6% Exposure',
      throughput: '64 items/hr (Target 85)',
      qualityScore: '96.2%',
      unitCost: 'High Manual Effort',
      linkedCause:
        'High volume of repeatable multi-portal status checks and record lookups slowing down Core Operations Group A.',
    },
    {
      id: 'policy-exceptions',
      name: 'Policy & Exception Escalations',
      slaRisk: '8.4% Exposure',
      throughput: '32 items/hr (Target 34)',
      qualityScore: '98.9%',
      unitCost: 'Specialist Tier',
      linkedCause:
        'Requires 18 additional cross-trained exception specialists from the Academy readiness cohort.',
    },
    {
      id: 'standard-intake',
      name: 'High-Volume Intake & Validation',
      slaRisk: '1.9% Exposure',
      throughput: '210 items/hr (Target 200)',
      qualityScore: '99.4%',
      unitCost: 'Optimized Flow',
      linkedCause:
        'Operating nominally with 78% autonomous execution support from EKARVO Drive.',
    },
  ];

  const selectedOperateQueue =
    operateQueues.find((q) => q.id === hoveredSlaQueue) || operateQueues[0]!;

  return (
    <section
      id="scene-06"
      aria-label="EKARVO Pulse"
      className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
    >
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="p-6 -m-6 bg-[#090D11]/90 rounded-lg flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
              Operating Intelligence · EKARVO Pulse
            </p>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
              KNOW THE OPERATION.
              <br />
              CHANGE THE OUTCOME.
            </h2>
            <p className="text-base sm:text-lg text-[#8C9A9F] leading-relaxed">
              Unify signals across your organization. Forecast upcoming demand, understand
              performance drivers, develop workforce capability, and pinpoint the next operational
              improvement.
            </p>
          </div>

          <div className="font-mono text-xs text-[#8C9A9F]">
            12 connected capability modules
          </div>
        </div>

        {/* Pulse 4 Operating Modes Strip */}
        <div
          role="tablist"
          aria-label="Pulse Operating Modes"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {modes.map((m) => {
            const active = m.id === activeMode;
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  setActiveMode(m.id);
                  soundEngine.play('network_connection');
                }}
                className={`p-5 rounded-lg border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#5DDEC4] bg-[#121A20] text-[#EEF3F0]'
                    : 'border-[#26333C] bg-[#090D11]/88 text-[#8C9A9F] hover:text-[#EEF3F0]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-xs">
                  <span className={active ? 'text-[#5DDEC4] font-bold' : ''}>{m.label}</span>
                  <span className="text-[11px]">{m.modules.join(' · ')}</span>
                </div>
                <div className="text-sm sm:text-base font-bold mt-2 leading-snug">{m.headline}</div>
              </button>
            );
          })}
        </div>

        {/* Pulse Workspace */}
        <div className="rounded-lg bg-[#121A20]/94 border border-[#26333C] overflow-hidden">
          <div className="px-6 py-4 bg-[#090D11]/90 border-b border-[#26333C] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                PULSE WORKSPACE · {currentModeObj.label}
              </div>
              <h3 className="text-lg font-bold text-[#EEF3F0] mt-0.5">
                {currentModeObj.headline}{' '}
                <span className="font-normal text-sm text-[#8C9A9F]">
                  {currentModeObj.supporting}
                </span>
              </h3>
            </div>
            <div className="font-mono text-xs text-[#8C9A9F]">
              Modules: {currentModeObj.modules.join(' / ')}
            </div>
          </div>

          {/* MODE 1: PLAN */}
          {activeMode === 'plan' && (
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-[#EEF3F0]">
                      Demand Forecast vs. Qualified Workforce Capacity
                    </h4>
                    <p className="text-xs text-[#8C9A9F]">
                      Compare forecasted arrival volume against available human and digital
                      capacity across teams.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#5DDEC4] font-semibold tabular-nums">
                    SLA Exposure: {interventionResult.slaExposureAfter}%
                  </span>
                </div>

                {/* SVG Forecast vs Capacity Curve */}
                <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C]">
                  <svg
                    viewBox="0 0 600 170"
                    className="w-full h-40 overflow-visible"
                    aria-label="Forecast vs Capacity Chart"
                  >
                    <line x1="0" y1="35" x2="600" y2="35" stroke="#26333C" strokeDasharray="4 4" />
                    <line x1="0" y1="85" x2="600" y2="85" stroke="#26333C" strokeDasharray="4 4" />
                    <line x1="0" y1="135" x2="600" y2="135" stroke="#26333C" />
                    <path
                      d="M 10 120 Q 150 110, 240 65 T 440 30 T 590 70"
                      fill="none"
                      stroke="#EEF3F0"
                      strokeWidth="2.5"
                    />
                    <path
                      d={
                        interventionId === 'baseline'
                          ? 'M 10 105 L 220 100 L 420 98 L 590 100'
                          : 'M 10 105 L 220 75 L 420 26 L 590 55'
                      }
                      fill="none"
                      stroke="#5DDEC4"
                      strokeWidth="2.5"
                      strokeDasharray={interventionId === 'baseline' ? '6 4' : 'none'}
                    />
                    <text x="14" y="24" fontSize="11" fill="#EEF3F0" fontFamily="IBM Plex Mono">
                      White: Forecasted Demand (1,220 units)
                    </text>
                    <text x="300" y="24" fontSize="11" fill="#5DDEC4" fontFamily="IBM Plex Mono">
                      Teal: Allocated Capacity ({interventionResult.label})
                    </text>
                  </svg>
                </div>

                {/* Allocation Blocks Table */}
                <div className="space-y-2.5">
                  <div className="font-mono text-xs text-[#8C9A9F]">
                    CAPACITY ALLOCATION MATRIX
                  </div>
                  <div className="rounded-lg border border-[#26333C] overflow-hidden">
                    <table className="w-full text-left text-xs tabular-nums">
                      <thead className="bg-[#090D11] border-b border-[#26333C] text-[#8C9A9F]">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Operating Group</th>
                          <th className="py-2.5 px-3 font-semibold">Qualified Capability</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Demand</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Allocated</th>
                          <th className="py-2.5 px-3 font-semibold text-right">SLA Exposure</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#26333C] bg-[#090D11]/60">
                        {interventionResult.teams.map((t) => (
                          <tr key={t.team}>
                            <td className="py-2.5 px-3 font-semibold text-[#EEF3F0]">{t.team}</td>
                            <td className="py-2.5 px-3 text-[#8C9A9F]">{t.qualifiedSkill}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{t.forecastDemand}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#5DDEC4]">
                              {t.allocatedUnits}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {t.slaExposurePct.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right: SIMULATE AN INTERVENTION Controls */}
              <div className="lg:col-span-5 p-6 rounded-lg bg-[#090D11] border border-[#26333C] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#5DDEC4] font-semibold">
                    <Sliders className="w-4 h-4" />
                    <span>SIMULATE AN INTERVENTION</span>
                  </div>
                  <p className="text-xs text-[#8C9A9F] leading-relaxed">
                    Select an operating option below to test how capacity rebalancing and autonomous
                    workflow delegation change service level exposure before committing changes.
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'baseline',
                        title: 'Unadjusted baseline plan',
                        desc: 'Maintain current static schedule (27.6% SLA exposure in Group A).',
                      },
                      {
                        id: 'redistribute',
                        title: 'Rebalance cross-trained capacity',
                        desc: 'Reassign 85 cross-qualified specialists from Group B to Group A.',
                      },
                      {
                        id: 'route_drive',
                        title: 'Combine capacity plan with Drive execution',
                        desc: 'Delegate 145 repeatable multi-system verification tasks to Drive.',
                      },
                    ].map((opt) => {
                      const selected = interventionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setInterventionId(opt.id);
                            soundEngine.play('execution_complete');
                          }}
                          className={`w-full p-3.5 rounded-lg text-left border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-[#121A20] border-[#5DDEC4] text-[#EEF3F0]'
                              : 'bg-[#121A20]/50 border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0]'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.title}</div>
                          <div className="text-[11px] text-[#8C9A9F] mt-0.5">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#121A20] border border-[#26333C] space-y-2">
                  <div className="font-mono text-[11px] text-[#5DDEC4] font-semibold">
                    PROJECTED SIMULATION OUTCOME
                  </div>
                  <p className="text-xs text-[#8C9A9F]">{interventionResult.summary}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#26333C] font-mono text-xs tabular-nums">
                    <div>
                      <span className="text-[#8C9A9F]">Backlog Delta: </span>
                      <strong className="text-[#EEF3F0]">
                        {interventionResult.projectedBacklogDelta} units
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#8C9A9F]">Economics: </span>
                      <strong className="text-[#5DDEC4]">{interventionResult.unitCostImpact}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: OPERATE */}
          {activeMode === 'operate' && (
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  OPERATIONAL CONTEXT LENS · SELECT A WORK QUEUE
                </div>
                <div className="space-y-3">
                  {operateQueues.map((q) => {
                    const selected = q.id === hoveredSlaQueue;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onMouseEnter={() => setHoveredSlaQueue(q.id)}
                        onClick={() => setHoveredSlaQueue(q.id)}
                        className={`w-full p-4 rounded-lg border text-left transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#090D11] border-[#5DDEC4]'
                            : 'bg-[#090D11]/60 border-[#26333C] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-bold text-[#EEF3F0]">{q.name}</span>
                          <span className="font-mono text-xs font-semibold text-[#5DDEC4] tabular-nums">
                            SLA: {q.slaRisk}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 font-mono text-xs text-[#8C9A9F] tabular-nums">
                          <div>Throughput: {q.throughput}</div>
                          <div>Quality: {q.qualityScore}</div>
                          <div>Profile: {q.unitCost}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-lg bg-[#090D11] border border-[#26333C] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                    ROOT-CAUSE &amp; ECONOMIC ATTRIBUTION
                  </div>
                  <h4 className="text-lg font-bold text-[#EEF3F0]">
                    {selectedOperateQueue.name}
                  </h4>
                  <p className="text-sm text-[#8C9A9F] leading-relaxed">
                    {selectedOperateQueue.linkedCause}
                  </p>
                  <div className="p-4 rounded-lg bg-[#121A20] border border-[#26333C] space-y-2 text-xs font-mono tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-[#8C9A9F]">Service Level Exposure:</span>
                      <span className="font-semibold text-[#EEF3F0]">
                        {selectedOperateQueue.slaRisk}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C9A9F]">Verified Quality Rate:</span>
                      <span className="font-semibold text-[#5DDEC4]">
                        {selectedOperateQueue.qualityScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C9A9F]">Economic Profile:</span>
                      <span className="font-semibold text-[#EEF3F0]">
                        {selectedOperateQueue.unitCost}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#26333C] flex items-center justify-between">
                  <span className="text-xs text-[#8C9A9F]">
                    Modules: Command · Perform · Quality · Economics
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMode('optimize')}
                    className="text-xs font-semibold text-[#5DDEC4] hover:underline cursor-pointer"
                  >
                    Inspect Optimization
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: DEVELOP */}
          {activeMode === 'develop' && (
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 space-y-4">
                <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  WORKFORCE CAPABILITY &amp; READINESS (ACADEMY &amp; COACH)
                </div>
                <p className="text-sm text-[#8C9A9F]">
                  Select a capability domain to inspect targeted skill progression or optional
                  consent-governed voice coaching services.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSkillGap('exceptions')}
                    className={`p-4 rounded-lg border text-left cursor-pointer ${
                      selectedSkillGap === 'exceptions'
                        ? 'bg-[#090D11] border-[#5DDEC4]'
                        : 'bg-[#090D11]/60 border-[#26333C]'
                    }`}
                  >
                    <div className="font-mono text-xs text-[#5DDEC4]">ACADEMY &amp; COACH</div>
                    <div className="text-sm font-bold text-[#EEF3F0] mt-1">
                      Complex Exception Resolution Readiness
                    </div>
                    <div className="text-xs text-[#8C9A9F] mt-1">
                      Cross-training pathway to expand specialist capacity ahead of peak demand.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSkillGap('voice-clarity')}
                    className={`p-4 rounded-lg border text-left cursor-pointer ${
                      selectedSkillGap === 'voice-clarity'
                        ? 'bg-[#090D11] border-[#5DDEC4]'
                        : 'bg-[#090D11]/60 border-[#26333C]'
                    }`}
                  >
                    <div className="font-mono text-xs text-[#5DDEC4]">
                      OPTIONAL SERVICE CAPABILITY
                    </div>
                    <div className="text-sm font-bold text-[#EEF3F0] mt-1">
                      Voice Clarity &amp; Real-Time Acoustic Coaching
                    </div>
                    <div className="text-xs text-[#8C9A9F] mt-1">
                      Opt-in acoustic clarity service governed by explicit employee consent.
                    </div>
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] space-y-2 text-xs">
                  <div className="font-semibold text-[#EEF3F0]">
                    Connected Competency Progression
                  </div>
                  <p className="text-[#8C9A9F]">
                    Pulse links quality findings directly to guided sandbox simulations, helping
                    teams build proficiency on complex workflows faster.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-lg bg-[#090D11] border border-[#26333C] space-y-4">
                {selectedSkillGap === 'exceptions' ? (
                  <>
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                      RECOMMENDED DEVELOPMENT PATHWAY · ACADEMY
                    </div>
                    <h4 className="text-lg font-bold text-[#EEF3F0]">
                      Cross-Train Specialists on Multi-System Exception Workflows
                    </h4>
                    <ul className="space-y-2.5 text-xs text-[#8C9A9F]">
                      <li>
                        <strong className="text-[#EEF3F0]">Targeted Coaching:</strong> Team lead
                        coaching guides synthesized from top-performing specialist workflows.
                      </li>
                      <li>
                        <strong className="text-[#EEF3F0]">Simulation-Based Practice:</strong>{' '}
                        Interactive sandbox scenarios with immediate policy feedback before live
                        queue assignment.
                      </li>
                      <li>
                        <strong className="text-[#EEF3F0]">Capacity Impact:</strong> Expands
                        qualified specialist supply across high-complexity queues.
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                      OPT-IN VOICE SERVICE · PRIVACY &amp; CONSENT SAFEGUARDS
                    </div>
                    <h4 className="text-lg font-bold text-[#EEF3F0]">
                      Voice Clarity &amp; Real-Time Acoustic Coaching Service
                    </h4>
                    <p className="text-xs text-[#8C9A9F] leading-relaxed">
                      Offered as a distinct optional service capability, separate from core
                      performance evaluation, operating strictly under individual employee opt-in
                      controls.
                    </p>
                    <div className="p-4 rounded-lg bg-[#121A20] border border-[#26333C] flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-[#EEF3F0]">
                          Employee Opt-In Consent Guardrail
                        </div>
                        <div className="text-[11px] text-[#8C9A9F]">
                          Status:{' '}
                          {voiceMaskingConsent
                            ? 'Explicit Employee Consent Verified (Active)'
                            : 'Disabled by Employee Preference'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVoiceMaskingConsent((prev) => !prev)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#26333C] bg-[#090D11] text-[#EEF3F0] hover:border-[#5DDEC4] cursor-pointer"
                      >
                        Toggle Consent State
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MODE 4: OPTIMIZE */}
          {activeMode === 'optimize' && (
            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                  STRUCTURED OPTIMIZATION RECOMMENDATION · DISCOVER &amp; OPTIMIZE
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C]">
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                      OBSERVATION
                    </div>
                    <p className="text-xs text-[#EEF3F0] font-medium mt-1.5 leading-relaxed">
                      Cross-System Resolution Queue faces a 27.6% service level exposure window
                      during peak demand hours.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C]">
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">CAUSE</div>
                    <p className="text-xs text-[#EEF3F0] font-medium mt-1.5 leading-relaxed">
                      63% of queued items consist of repeatable cross-portal status lookups and
                      document checks requiring no specialist judgment.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C]">
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">OPTIONS</div>
                    <p className="text-xs text-[#EEF3F0] font-medium mt-1.5 leading-relaxed">
                      Delegate eligible multi-system verification tasks to EKARVO Drive while
                      retaining complex exceptions with human specialists.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C]">
                    <div className="font-mono text-xs text-[#5DDEC4] font-semibold">
                      EXPECTED IMPACT
                    </div>
                    <p className="text-xs text-[#EEF3F0] font-medium mt-1.5 leading-relaxed">
                      Reduces service level exposure from 27.6% to 1.2% and restores specialist
                      capacity for high-judgment work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 p-6 rounded-lg bg-[#090D11] border border-[#5DDEC4]/50 text-[#EEF3F0] flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="font-mono text-xs text-[#5DDEC4]">
                    READY FOR AUTONOMOUS EXECUTION
                  </div>
                  <h4 className="text-lg font-bold">Dispatch Workflow to EKARVO Drive</h4>
                  <p className="text-xs text-[#8C9A9F] leading-relaxed">
                    Convert this operational recommendation into a governed digital work package
                    with defined policy boundaries and verification criteria.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.play('execution_complete');
                    onSendToDrive(
                      'Delegate repeatable cross-system status and verification tasks to Drive'
                    );
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-[#090D11] bg-[#5DDEC4] rounded-lg hover:bg-[#4bcbb1] transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Send to Drive</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
