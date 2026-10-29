"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Icon } from "./Icon";
import {
  approve,
  chooseResponse,
  execute,
  initialProof,
  learn,
  proofStatus,
  proofSteps,
  raiseException,
  resume,
  verify,
  type DecisionProofState,
  type Response,
} from "./models/decisionProof";
const stages = [
  "SIGNAL",
  "CONTEXT",
  "OPTIONS",
  "AUTHORITY",
  "ACTION",
  "EVIDENCE",
  "LEARNING",
];
export function DecisionProof() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [step, setStep] = useState(0),
    [state, setState] = useState<DecisionProofState>(initialProof);
  const approvalButton = useRef<HTMLButtonElement>(null);
  const returningForApproval = useRef(false);
  useEffect(() => {
    if (!returningForApproval.current || state.paused || step !== 3) return;
    approvalButton.current?.focus();
    returningForApproval.current = false;
  }, [step, state.paused]);
  const reduce = useReducedMotion();
  const item = proofSteps[step] ?? proofSteps[0];
  const choiceName =
    state.choice === "reassign"
      ? "Reassign eligible capacity"
      : state.choice === "resequence"
        ? "Resequence the queue"
        : "No response selected";
  return (
    <section
      className="decision-proof"
      aria-label="Synthetic connected-work example"
    >
      <fieldset className="proof-shell" disabled={!ready} aria-busy={!ready}>
        <legend className="sr-only">Connected work example</legend>
        <div className="proof-header">
          <div>
            <p className="product-category">
              ONE WORKFLOW · SEVEN CONNECTED STAGES
            </p>
            <p className="small-copy">
              A synthetic example. No connected system or real work is changed.
            </p>
          </div>
          <span className="proof-count">
            {String(step + 1).padStart(2, "0")} / 07
          </span>
        </div>
        <div
          className="proof-stages"
          tabIndex={0}
          role="group"
          aria-label="Work stages"
        >
          {proofSteps.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-pressed={step === i}
              onClick={() => setStep(i)}
            >
              <span className="proof-dot" aria-hidden="true" />
              {s.name}
            </button>
          ))}
        </div>
        <div className="proof-body">
          <motion.div
            key={step}
            initial={{
              opacity: !ready || reduce ? 1 : 0,
              y: !ready || reduce ? 0 : 8,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="proof-explanation"
          >
            <p className="product-category">{stages[step]}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <div className="proof-outcome">
              <span>THE CONNECTED QUESTION</span>
              <p>{item.question}</p>
            </div>
          </motion.div>
          <div className="proof-artifact">
            <p className="product-category">
              {step <= 1
                ? "THE OPERATING PICTURE"
                : step === 2
                  ? "POSSIBLE RESPONSES"
                  : step === 3
                    ? "HUMAN AUTHORITY"
                    : step === 4
                      ? "CONTROLLED ACTION"
                      : step === 5
                        ? "ACCEPTANCE CHECK"
                        : "A REUSABLE RECORD"}
            </p>
            {step <= 1 ? (
              <dl className="proof-context">
                <div>
                  <dt>Signal</dt>
                  <dd>Work volume rises above the current plan</dd>
                </div>
                <div>
                  <dt>Constraint</dt>
                  <dd>Existing commitments remain in scope</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>Accountable workflow owner</dd>
                </div>
                {step === 1 && (
                  <div>
                    <dt>Question</dt>
                    <dd>
                      Can the plan absorb the change without moving risk
                      elsewhere?
                    </dd>
                  </div>
                )}
              </dl>
            ) : null}
            {step === 2 ? (
              <div className="proof-options">
                {(
                  [
                    [
                      "reassign",
                      "Reassign eligible capacity",
                      "Check availability, skill fit and impact on other work.",
                    ],
                    [
                      "resequence",
                      "Resequence the queue",
                      "Check due times, priorities and affected commitments.",
                    ],
                  ] as [Response, string, string][]
                ).map(([value, title, body]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={state.choice === value}
                    onClick={() => setState((s) => chooseResponse(s, value))}
                  >
                    <strong>{title}</strong>
                    <span>{body}</span>
                    {state.choice === value && <Icon icon={Check} size={20} />}
                  </button>
                ))}
              </div>
            ) : null}
            {step === 3 ? (
              <div className="proof-action">
                <dl className="proof-context">
                  <div>
                    <dt>Selected</dt>
                    <dd>{choiceName}</dd>
                  </div>
                  <div>
                    <dt>Scope</dt>
                    <dd>Only this work queue and the agreed time window</dd>
                  </div>
                  <div>
                    <dt>Authority</dt>
                    <dd>
                      {state.approved
                        ? "Approved by the example owner"
                        : "Awaiting the example owner"}
                    </dd>
                  </div>
                </dl>
                <button
                  className="button"
                  type="button"
                  ref={approvalButton}
                  disabled={!state.choice || state.approved || state.paused}
                  onClick={() => setState(approve)}
                >
                  {state.approved ? "Scope approved" : "Approve this scope"}
                  <Icon icon={Check} size={20} />
                </button>
                {!state.choice && (
                  <p className="small-copy">
                    Select a response in Simulate first.
                  </p>
                )}
              </div>
            ) : null}
            {step === 4 ? (
              <div className="proof-action">
                <dl className="proof-context">
                  <div>
                    <dt>Response</dt>
                    <dd>{choiceName}</dd>
                  </div>
                  <div>
                    <dt>Boundary</dt>
                    <dd>
                      {state.paused
                        ? "Paused for a new decision"
                        : state.approved
                          ? "Approved scope only"
                          : "Approval required"}
                    </dd>
                  </div>
                  <div>
                    <dt>Action</dt>
                    <dd>
                      {state.executed
                        ? "Example action recorded"
                        : "No action recorded"}
                    </dd>
                  </div>
                </dl>
                <div className="actions">
                  <button
                    className="button"
                    type="button"
                    disabled={!state.approved || state.executed || state.paused}
                    onClick={() => setState(execute)}
                  >
                    {state.executed ? "Action recorded" : "Run example action"}
                    <Icon icon={ArrowRight} size={20} />
                  </button>
                  <button
                    className="text-link"
                    type="button"
                    disabled={!state.approved || state.paused}
                    onClick={() => setState(raiseException)}
                  >
                    Raise an exception
                    <Icon icon={Pause} size={20} />
                  </button>
                </div>
              </div>
            ) : null}
            {step === 5 ? (
              <div className="proof-action">
                <dl className="proof-context">
                  <div>
                    <dt>Expected</dt>
                    <dd>Work returned to the agreed time window</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>
                      {state.evidence
                        ? "Example acceptance record checked"
                        : "Example acceptance record open"}
                    </dd>
                  </div>
                  <div>
                    <dt>Result</dt>
                    <dd>
                      {state.evidence
                        ? "Verified for this synthetic example"
                        : "Not yet verified"}
                    </dd>
                  </div>
                </dl>
                <button
                  className="button"
                  type="button"
                  disabled={!state.executed || state.evidence || state.paused}
                  onClick={() => setState(verify)}
                >
                  {state.evidence
                    ? "Result verified"
                    : "Check example evidence"}
                  <Icon icon={Check} size={20} />
                </button>
                {!state.executed && (
                  <p className="small-copy">
                    Record the action in Execute before checking the result.
                  </p>
                )}
              </div>
            ) : null}
            {step === 6 ? (
              <div className="proof-action">
                <dl className="proof-context">
                  <div>
                    <dt>Decision</dt>
                    <dd>{choiceName}</dd>
                  </div>
                  <div>
                    <dt>Outcome</dt>
                    <dd>
                      {state.evidence
                        ? "Agreed result verified"
                        : "Verification remains open"}
                    </dd>
                  </div>
                  <div>
                    <dt>Learning</dt>
                    <dd>
                      {state.learned
                        ? "Reason and result retained"
                        : "Not yet captured"}
                    </dd>
                  </div>
                </dl>
                <button
                  className="button"
                  type="button"
                  disabled={!state.evidence || state.learned || state.paused}
                  onClick={() => setState(learn)}
                >
                  {state.learned ? "Learning captured" : "Capture the learning"}
                  <Icon icon={Check} size={20} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="proof-footer">
          <p role="status" aria-live="polite">
            {proofStatus(state)}
          </p>
          <div className="actions">
            {state.paused ? (
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  returningForApproval.current = true;
                  setState(resume);
                  setStep(3);
                }}
              >
                Return for approval
                <Icon icon={Play} />
              </button>
            ) : null}
            {step < proofSteps.length - 1 ? (
              <button
                type="button"
                className="text-link"
                onClick={() => setStep((i) => i + 1)}
              >
                Continue to {proofSteps[step + 1]?.name}
                <Icon icon={ArrowRight} />
              </button>
            ) : (
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setState(initialProof);
                  setStep(0);
                }}
              >
                Start again
                <Icon icon={RotateCcw} />
              </button>
            )}
            <a
              className="product-link"
              href="/landing/contact?product=operations-os"
            >
              Discuss your workflow
              <Icon icon={ArrowUpRight} />
            </a>
          </div>
        </div>
      </fieldset>
    </section>
  );
}
