import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { Dialog, DialogContent, DialogTitle } from '@workspace/ui/components/shadcn/dialog';
import {
  ContactFormInput,
  validateContactForm,
} from '../utils/sceneEngine';
import { soundEngine } from '../utils/soundEngine';
import { CheckCircle2, X } from 'lucide-react';

interface EnterpriseModalsProps {
  activeModal: 'none' | 'contact' | 'platform' | 'solutions' | 'company';
  onCloseModal: () => void;
  onNavigateScene: (sceneId: string) => void;
}

export const EnterpriseModals: React.FC<EnterpriseModalsProps> = ({
  activeModal,
  onCloseModal,
  onNavigateScene,
}) => {
  const [formInput, setFormInput] = useState<ContactFormInput>({
    fullName: '',
    workEmail: '',
    organization: '',
    focusArea: 'Both Pulse & Drive',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ContactFormInput, string>>
  >({});
  const [submittedRecord, setSubmittedRecord] = useState<ContactFormInput | null>(null);

  const returnFocusRef = useRef<HTMLElement | null>(null);
  const trpc = useTRPC();
  const sendInquiry = useMutation(trpc.support.sendSupportMessage.mutationOptions());

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm(formInput);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});
    if (sendInquiry.isPending) return;
    try {
      await sendInquiry.mutateAsync({
        subject: `EKARVO architecture briefing: ${formInput.organization}`,
        email: formInput.workEmail,
        message: `Name: ${formInput.fullName}\nOrganization: ${formInput.organization}\nFocus: ${formInput.focusArea}\n\n${formInput.message}`,
      });
      setSubmittedRecord(formInput);
      soundEngine.play('execution_complete');
    } catch {
      // The mutation error is shown in the form; keep their input for retry.
    }
  };

  if (activeModal === 'none') {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onCloseModal(); }}>
      <DialogContent
        onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement as HTMLElement; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); returnFocusRef.current?.focus(); }}
        showCloseButton={false} aria-describedby={undefined} className="ekarvo-site block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg bg-[#121A20] border-[#26333C] text-[#EEF3F0] p-6 sm:p-8 sm:max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#26333C] pb-4">
          <div>
            <p className="font-mono text-xs uppercase text-[#5DDEC4]">
              {activeModal === 'contact' && 'Enterprise Architecture Briefing'}
              {activeModal === 'platform' && 'EKARVO Platform Architecture'}
              {activeModal === 'solutions' && 'Cross-Industry Operational Use Cases'}
              {activeModal === 'company' && 'About EKARVO'}
            </p>
            <DialogTitle className="text-2xl font-bold mt-1">
              {activeModal === 'contact' && 'Talk to EKARVO'}
              {activeModal === 'platform' &&
                'Operational Context -> Decision Intelligence -> Execution -> Verification'}
              {activeModal === 'solutions' && 'Industry-Agnostic Enterprise Operating Workflows'}
              {activeModal === 'company' && 'EKARVO: Work. Done. Verified.'}
            </DialogTitle>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onCloseModal}
            className="flex size-11 items-center justify-center rounded-lg border border-[#26333C] text-[#8C9A9F] hover:text-[#EEF3F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTACT MODAL */}
        {activeModal === 'contact' && (
          <>
            {submittedRecord ? (
              <div className="p-6 rounded-lg bg-[#090D11] border border-[#5DDEC4] space-y-4">
                <div className="flex items-center gap-2 text-[#5DDEC4] font-mono text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>REQUEST SENT</span>
                </div>
                <h3 className="text-lg font-bold text-[#EEF3F0]">
                  Thank you, {submittedRecord.fullName}.
                </h3>
                <p className="text-xs text-[#8C9A9F] leading-relaxed">
                  Your briefing request for{' '}
                  <strong className="text-[#EEF3F0]">{submittedRecord.organization}</strong> (
                  {submittedRecord.focusArea}) has been sent. An EKARVO enterprise architect
                  will reach out at <span className="font-mono">{submittedRecord.workEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRecord(null);
                    onCloseModal();
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#5DDEC4] text-[#090D11] rounded-lg cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ek-fullname"
                      className="block text-xs font-mono text-[#8C9A9F] mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="ek-fullname"
                      aria-invalid={Boolean(formErrors.fullName)}
                      aria-describedby={formErrors.fullName ? "ek-fullname-error" : undefined}
                      type="text"
                      value={formInput.fullName}
                      onChange={(e) =>
                        setFormInput({ ...formInput, fullName: e.target.value })
                      }
                      placeholder="Alex Morgan"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
                    />
                    {formErrors.fullName && (
                      <p id="ek-fullname-error" className="text-xs text-[#C86664] mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ek-email"
                      className="block text-xs font-mono text-[#8C9A9F] mb-1"
                    >
                      Work Email *
                    </label>
                    <input
                      id="ek-email"
                      aria-invalid={Boolean(formErrors.workEmail)}
                      aria-describedby={formErrors.workEmail ? "ek-email-error" : undefined}
                      type="email"
                      value={formInput.workEmail}
                      onChange={(e) =>
                        setFormInput({ ...formInput, workEmail: e.target.value })
                      }
                      placeholder="alex@enterprise.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
                    />
                    {formErrors.workEmail && (
                      <p id="ek-email-error" className="text-xs text-[#C86664] mt-1">{formErrors.workEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ek-org"
                      className="block text-xs font-mono text-[#8C9A9F] mb-1"
                    >
                      Organization *
                    </label>
                    <input
                      id="ek-org"
                      aria-invalid={Boolean(formErrors.organization)}
                      aria-describedby={formErrors.organization ? "ek-org-error" : undefined}
                      type="text"
                      value={formInput.organization}
                      onChange={(e) =>
                        setFormInput({ ...formInput, organization: e.target.value })
                      }
                      placeholder="Apex Global Operations"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
                    />
                    {formErrors.organization && (
                      <p id="ek-org-error" className="text-xs text-[#C86664] mt-1">{formErrors.organization}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ek-focus"
                      className="block text-xs font-mono text-[#8C9A9F] mb-1"
                    >
                      Operational Focus *
                    </label>
                    <select
                      id="ek-focus"
                      value={formInput.focusArea}
                      onChange={(e) =>
                        setFormInput({ ...formInput, focusArea: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
                    >
                      <option value="Both Pulse & Drive">Both Pulse &amp; Drive</option>
                      <option value="EKARVO Pulse (Operating Intelligence)">
                        EKARVO Pulse (Operating Intelligence)
                      </option>
                      <option value="EKARVO Drive (Autonomous Execution)">
                        EKARVO Drive (Autonomous Execution)
                      </option>
                      <option value="Architecture & Governance Evaluation">
                        Architecture &amp; Governance Evaluation
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ek-message"
                    className="block text-xs font-mono text-[#8C9A9F] mb-1"
                  >
                    Operational Context / Workflows of Interest
                  </label>
                  <textarea
                    id="ek-message"
                    rows={3}
                    value={formInput.message}
                    onChange={(e) =>
                      setFormInput({ ...formInput, message: e.target.value })
                    }
                    placeholder="Describe your operational queues, enterprise systems, or SLA objectives..."
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#090D11] border border-[#26333C] text-[#EEF3F0] focus:border-[#5DDEC4] focus:outline-none"
                  />
                </div>

                {sendInquiry.isError && <p role="alert" className="text-sm text-[#E8B66E]">We couldn’t send your request. Please try again.</p>}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2.5 text-xs font-medium text-[#8C9A9F] hover:text-[#EEF3F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendInquiry.isPending}
                    className="px-6 py-2.5 text-xs font-semibold text-[#090D11] bg-[#5DDEC4] rounded-lg hover:bg-[#4bcbb1] cursor-pointer"
                  >
                    {sendInquiry.isPending ? "Sending request…" : "Request Architecture Briefing"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* PLATFORM MODAL */}
        {activeModal === 'platform' && (
          <div className="space-y-4 text-xs text-[#8C9A9F]">
            <p className="text-sm text-[#EEF3F0] leading-relaxed">
              EKARVO unifies operational understanding and governed execution through a shared
              five-stage enterprise architecture:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                {
                  step: '01',
                  name: 'Operational Context',
                  desc: 'Unified demand, capacity, and workflow ontology.',
                },
                {
                  step: '02',
                  name: 'Decision Intelligence',
                  desc: 'Scenario simulation and resource allocation.',
                },
                {
                  step: '03',
                  name: 'Autonomous Execution',
                  desc: 'Multi-channel digital workers across six channels.',
                },
                {
                  step: '04',
                  name: 'Verification',
                  desc: 'Target system readback and audit evidence.',
                },
                {
                  step: '05',
                  name: 'Continuous Learning',
                  desc: 'Closed-loop telemetry feeding back into Pulse.',
                },
              ].map((arch) => (
                <div
                  key={arch.step}
                  className="p-3 rounded-lg bg-[#090D11] border border-[#26333C] space-y-1"
                >
                  <div className="font-mono text-[#5DDEC4]">{arch.step}</div>
                  <div className="font-bold text-[#EEF3F0]">{arch.name}</div>
                  <div>{arch.desc}</div>
                </div>
              ))}
            </div>
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onCloseModal();
                  onNavigateScene('scene-10');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#5DDEC4] text-[#090D11] rounded-lg cursor-pointer"
              >
                Explore All 27 Capabilities
              </button>
            </div>
          </div>
        )}

        {/* SOLUTIONS MODAL */}
        {activeModal === 'solutions' && (
          <div className="space-y-4 text-xs">
            <p className="text-sm text-[#EEF3F0] leading-relaxed">
              EKARVO is industry-agnostic, designed for any enterprise operation where work spans
              multiple teams, applications, and service commitments:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  domain: 'Service & Case Operations',
                  detail:
                    'Intraday queue forecasting, multi-system case resolution, SLA protection, and opt-in voice clarity coaching.',
                },
                {
                  domain: 'Supply Chain & Order Coordination',
                  detail:
                    'Cross-portal schedule synchronization, inventory exception handling, and automated stakeholder updates.',
                },
                {
                  domain: 'Financial & Shared Services',
                  detail:
                    'Three-way document and receipt reconciliation, exception routing, and governed ERP ledger posting.',
                },
                {
                  domain: 'IT, HR & Enterprise Operations',
                  detail:
                    'Cross-application provisioning, compliance verification, and legacy desktop workflow orchestration.',
                },
              ].map((sol) => (
                <div
                  key={sol.domain}
                  className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] space-y-1.5"
                >
                  <div className="font-bold text-[#EEF3F0] text-sm">{sol.domain}</div>
                  <p className="text-[#8C9A9F] leading-relaxed">{sol.detail}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onCloseModal();
                  onNavigateScene('scene-08');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#5DDEC4] text-[#090D11] rounded-lg cursor-pointer"
              >
                Explore Closed-Loop Workflows
              </button>
            </div>
          </div>
        )}

        {/* COMPANY MODAL */}
        {activeModal === 'company' && (
          <div className="space-y-4 text-xs text-[#8C9A9F] leading-relaxed">
            <p className="text-sm text-[#EEF3F0]">
              EKARVO builds enterprise software that connects operating intelligence (Pulse) with
              governed autonomous execution (Drive) across any industry or operational function.
            </p>
            <div className="p-4 rounded-lg bg-[#090D11] border border-[#26333C] space-y-2">
              <div className="font-mono text-[#5DDEC4] font-semibold">
                CLOSED-LOOP OPERATING PHILOSOPHY
              </div>
              <p>
                Most enterprise software either analyzes the past or automates isolated tasks.
                EKARVO connects understanding, decision simulation, multi-channel execution, and
                outcome verification in one continuous loop.
              </p>
            </div>
          </div>
        )}
      </div>
      </DialogContent>
    </Dialog>
  );
};
