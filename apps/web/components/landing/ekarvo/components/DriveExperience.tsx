import React, { useState } from 'react';
import { DRIVE_CHANNELS } from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { CheckCircle2, Lock, ShieldAlert, Unlock } from 'lucide-react';

interface DriveExperienceProps {
  dispatchedPackageSummary: string | null;
  onNavigateToSimulation: () => void;
}

export const DriveExperience: React.FC<DriveExperienceProps> = ({
  dispatchedPackageSummary,
  onNavigateToSimulation,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('browser');
  const [approvalGateGranted, setApprovalGateGranted] = useState<boolean>(false);

  const activeChannel =
    DRIVE_CHANNELS.find((c) => c.id === selectedChannelId) || DRIVE_CHANNELS[0]!;

  return (
    <section
      id="scene-07"
      aria-label="EKARVO Drive"
      className="relative py-28 px-6 lg:px-12 bg-transparent text-[#EEF3F0] border-t border-[#26333C]"
    >
      <div className="max-w-[1440px] mx-auto space-y-14">
        {/* Connected Handoff Banner from Pulse */}
        <div className="p-4 rounded-lg bg-[#121A20]/90 border border-[#26333C] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-[#5DDEC4]">
              CONNECTED PULSE WORKFLOW
            </span>
            <span aria-hidden="true" className="text-[#8C9A9F]">
              ·
            </span>
            <span className="text-xs text-[#EEF3F0]">
              {dispatchedPackageSummary ||
                'Delegate repeatable cross-system verification and status updates to Drive'}
            </span>
          </div>
          <span className="font-mono text-xs text-[#5DDEC4]">
            Authority Scope: Read External Portals &amp; Update Queue · High-Value Adjustments Gated
          </span>
        </div>

        {/* Section Header */}
        <div className="max-w-4xl space-y-3 p-6 -m-6 bg-[#090D11]/92 rounded-lg">
          <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#5DDEC4] font-semibold">
            Autonomous Execution · EKARVO Drive
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] leading-[0.96] text-[#EEF3F0]">
            WORK DOESN&apos;T STOP
            <br />
            AT A RECOMMENDATION.
          </h2>
          <p className="text-base sm:text-lg text-[#8C9A9F] max-w-2xl leading-relaxed">
            Design and operate digital workers that navigate applications, communicate, process
            documents, coordinate actions across systems, and verify results.
          </p>
        </div>

        {/* The 6 Connected Execution Channels */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs uppercase text-[#8C9A9F]">
              Six Connected Execution Channels
            </p>
            <span className="font-mono text-xs text-[#5DDEC4]">
              Active Channel: {activeChannel.title} ({activeChannel.channel})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {DRIVE_CHANNELS.map((ch) => {
              const isSelected = ch.id === selectedChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setSelectedChannelId(ch.id);
                    soundEngine.play('network_connection');
                  }}
                  className={`p-5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#5DDEC4] bg-[#172127] text-[#EEF3F0]'
                      : 'border-[#26333C] bg-[#090D11]/90 text-[#8C9A9F] hover:text-[#EEF3F0]'
                  }`}
                >
                  <div className="font-display text-lg font-extrabold tracking-tight text-[#EEF3F0]">
                    {ch.title}
                  </div>
                  <div className="text-xs text-[#8C9A9F] mt-1 truncate">{ch.channel}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Channel Execution Inspector */}
          <div className="rounded-lg grid grid-cols-1 lg:grid-cols-12 border border-[#26333C] bg-[#121A20]/94 divide-y lg:divide-y-0 lg:divide-x divide-[#26333C]">
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#5DDEC4]">
                  <span>CHANNEL EXECUTION · {activeChannel.title}</span>
                  <span>ENVIRONMENT: {activeChannel.targetSystem}</span>
                </div>
                <p className="text-xs text-[#8C9A9F]">{activeChannel.visualBehavior}</p>
              </div>

              <div className="space-y-2.5">
                {activeChannel.traceSteps.map((step, i) => (
                  <div
                    key={step}
                    className="p-3.5 rounded-lg bg-[#090D11] border border-[#26333C] flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#5DDEC4] shrink-0">0{i + 1}</span>
                      <span className="text-[#EEF3F0]">{step}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5DDEC4] shrink-0">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#26333C] flex items-center justify-between font-mono text-xs">
                <span className="text-[#8C9A9F]">Assurance State:</span>
                <span className="text-[#5DDEC4]">{activeChannel.validationStatus}</span>
              </div>
            </div>

            {/* Right: Channel Capabilities & Architecture */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="font-mono text-xs text-[#5DDEC4]">
                  {activeChannel.sampleArtifact.header}
                </div>
                <div className="space-y-3">
                  {activeChannel.sampleArtifact.lines.map((line) => (
                    <div
                      key={line.label}
                      className="p-3.5 rounded-lg bg-[#090D11] border border-[#26333C] space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-[#8C9A9F]">{line.label}</span>
                        <span
                          className={
                            line.status === 'verified' ? 'text-[#5DDEC4]' : 'text-[#E8B66E]'
                          }
                        >
                          {line.status === 'verified' ? 'GOVERNED' : 'HUMAN GATE'}
                        </span>
                      </div>
                      <div className="text-xs text-[#EEF3F0] leading-relaxed">{line.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] text-xs text-[#8C9A9F] leading-relaxed">
                All six execution channels share one unified operational context, preserving state
                across voice, browser portals, documents, enterprise APIs, communications, and
                desktop applications.
              </div>
            </div>
          </div>
        </div>

        {/* Policy Authority & Human Approval Gate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#26333C]">
          <div className="lg:col-span-6 space-y-3">
            <p className="font-mono text-xs uppercase text-[#5DDEC4]">
              Orchestration &amp; Governance
            </p>
            <h3 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-[0.98] text-[#EEF3F0]">
              ONE WORKFLOW.
              <br />
              MULTIPLE SYSTEMS.
              <br />
              VERIFIED EXECUTION.
            </h3>
            <p className="text-sm sm:text-base text-[#8C9A9F] leading-relaxed">
              Drive maintains context across systems, applies enterprise business rules, pauses at
              policy boundaries when human judgment is needed, and confirms every completed outcome.
            </p>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 rounded-lg bg-[#121A20]/94 border border-[#26333C] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                {approvalGateGranted ? (
                  <Unlock className="w-4 h-4 text-[#5DDEC4]" />
                ) : (
                  <Lock className="w-4 h-4 text-[#E8B66E]" />
                )}
                <span className={approvalGateGranted ? 'text-[#5DDEC4]' : 'text-[#E8B66E]'}>
                  {approvalGateGranted
                    ? 'AUTHORIZATION GRANTED · EXECUTION RESUMED'
                    : 'POLICY BOUNDARY · HUMAN APPROVAL GATE'}
                </span>
              </div>
              <span className="font-mono text-xs text-[#8C9A9F]">Threshold Guardrail</span>
            </div>

            <p className="text-xs text-[#EEF3F0] leading-relaxed">
              When a workflow encounters an exception that exceeds autonomous policy thresholds,
              Drive automatically pauses execution and routes the complete context package to an
              authorized human specialist for review.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setApprovalGateGranted((prev) => !prev);
                  soundEngine.play('execution_complete');
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  approvalGateGranted
                    ? 'bg-[#172127] text-[#5DDEC4] border border-[#5DDEC4]'
                    : 'bg-[#E8B66E] text-[#090D11]'
                }`}
              >
                {approvalGateGranted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Outcome Verified (Reset Gate)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Authorize Exception &amp; Complete Workflow</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onNavigateToSimulation}
                className="text-xs font-mono text-[#5DDEC4] hover:underline cursor-pointer"
              >
                Explore End-to-End Workflows
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
