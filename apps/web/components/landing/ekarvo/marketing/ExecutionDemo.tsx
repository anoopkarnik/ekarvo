"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Download, RotateCcw } from "lucide-react";
import { Disclosure } from "./Disclosure";
import { Icon } from "./Icon";
import {
  initialJourney,
  propose,
  start,
  finishClassification,
  approve,
  reject,
  execute,
  verify,
  blockEvidence,
  retryEvidence,
  raiseException,
  pause,
  resume,
  reset,
  type JourneyState,
} from "./models/journey";
const summaries: Record<string, string> = {
  Draft: "Define a reconciled exception report for 20 synthetic records.",
  Ready: "The contract is complete. You can now run the simulation.",
  Running:
    "Classifying 20 records using exact ID, amount and currency matching.",
  "Awaiting approval":
    "18 records match. Two exceptions have documented reasons. Report creation needs your approval.",
  Verifying:
    "Checking classification, exception reasons and the destination receipt.",
  Verified: "20 records classified; 18 matched; 2 exceptions documented.",
  Blocked: "The report receipt is missing. Completion cannot be established.",
  Cancelled: "Report creation was rejected. No report was written.",
  Paused: "The simulation is paused. No next step will run until you resume.",
};
export function ExecutionDemo({ compact = false }: { compact?: boolean }) {
  const [ready, setReady] = useState(false);
  const [journey, setJourney] = useState<JourneyState>(() => ({
    ...initialJourney,
  }));
  const [missing, setMissing] = useState(false);
  const state = journey.status;
  const pending = state === "Running" || state === "Verifying";
  const reduce = useReducedMotion();
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actions = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const downloads = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    setReady(true);
    const urls = downloads.current;
    return () => {
      generation.current += 1;
      if (timer.current) clearTimeout(timer.current);
      for (const [url, timeout] of urls) {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);
  function transition(change: (current: JourneyState) => JourneyState) {
    generation.current += 1;
    if (timer.current) clearTimeout(timer.current);
    moveFocus.current = true;
    setJourney(change);
  }
  useEffect(() => {
    if (moveFocus.current) {
      actions.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus({ preventScroll: true });
      moveFocus.current = false;
    }
    if (!pending) return;
    const currentGeneration = generation.current;
    timer.current = setTimeout(
      () => {
        if (currentGeneration !== generation.current) return;
        moveFocus.current = !!actions.current?.contains(document.activeElement);
        setJourney((current) =>
          current.status === "Running"
            ? finishClassification(current)
            : current.status === "Verifying"
              ? missing
                ? blockEvidence(current)
                : verify(current)
              : current,
        );
      },
      reduce ? 250 : 1000,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [journey, missing, pending, reduce]);
  function download() {
    const report = {
      label: "Interactive concept · Synthetic data · No live systems connected",
      contract: "EXAMPLE-020 v1",
      state,
      summary: summaries[state],
      criteria: [
        "All 20 records classified",
        "ID, amount and currency checked",
        "Two exceptions include reasons",
        "Destination receipt present",
      ],
      exceptions: [
        { id: "SYN-019", reason: "Amount differs" },
        { id: "SYN-020", reason: "No source match" },
      ],
      receipt: state === "Verified" ? "SYNTHETIC-RECEIPT-020" : null,
      authority: "One synthetic report after approval; no live writes",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ekarvo-synthetic-evidence.json";
    anchor.click();
    downloads.current.set(
      url,
      setTimeout(() => {
        URL.revokeObjectURL(url);
        downloads.current.delete(url);
      }, 1000),
    );
  }
  return (
    <div
      className={`demo-shell execution-demo${compact ? " execution-demo-compact" : ""}`}
      role="region"
      aria-label="Synthetic report execution"
      aria-busy={pending}
    >
      <div className="demo-topbar">
        <strong>Ekarvo Drive / Outcome Contract</strong>
        <span className="demo-label">
          Interactive concept · Synthetic data · No live systems connected
        </span>
      </div>
      <div className="demo-content">
        <div className="demo-title">
          <h3>Reconciled exception report</h3>
          <span
            className={
              "pill " +
              (state === "Verified"
                ? "success"
                : ["Blocked", "Awaiting approval"].includes(state)
                  ? "warning"
                  : "blue")
            }
          >
            {state}
          </span>
        </div>
        <ol className="timeline">
          {["Define", "Execute", "Verify"].map((s, i) => (
            <li
              key={s}
              className={
                (i === 0 && ["Draft", "Ready"].includes(state)) ||
                (i === 1 &&
                  ["Running", "Awaiting approval", "Paused"].includes(state)) ||
                (i === 2 &&
                  ["Verifying", "Verified", "Blocked"].includes(state))
                  ? "current"
                  : ""
              }
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>
        <div
          className={
            "status-box " +
            (state === "Verified"
              ? "success"
              : ["Blocked", "Awaiting approval"].includes(state)
                ? "warning"
                : "")
          }
        >
          <p role="status" aria-live="polite">
            {summaries[state]}
          </p>
        </div>
        <div className="contract-details">
          <Disclosure question="Inspect the full example contract">
            <dl className="signal-list">
              <dt>Objective and owner</dt>
              <dd>
                Prepare a report for 20 synthetic records. Owner: demo process
                owner.
              </dd>
              <dt>Inputs and matching</dt>
              <dd>
                Two synthetic exports. Match exact record ID, amount and
                currency. 18 match; SYN-019 has an amount difference; SYN-020
                has no source match.
              </dd>
              <dt>Acceptance and evidence</dt>
              <dd>
                Classify all 20 records, document exception reasons and verify a
                receipt in the synthetic report destination. Unmatched records
                are valid report contents.
              </dd>
              <dt>Authority and approval</dt>
              <dd>
                One approved report write to an in-memory demo destination. No
                live changes, messages or payments. Approval applies only to
                EXAMPLE-020 v1 in this session.
              </dd>
              <dt>Limits and escalation</dt>
              <dd>
                20 records, zero financial spend, this browser session only.
                Missing evidence blocks completion and returns the issue to the
                demo process owner.
              </dd>
            </dl>
          </Disclosure>
        </div>
        {["Draft", "Ready"].includes(state) && (
          <label className="switch-label">
            <input
              type="checkbox"
              checked={missing}
              onChange={(e) => setMissing(e.target.checked)}
            />{" "}
            Simulate missing receipt
          </label>
        )}
        <div className="demo-actions" ref={actions}>
          {pending && (
            <button className="button" disabled>
              {state === "Running"
                ? "Classifying records…"
                : "Verifying evidence…"}
            </button>
          )}
          {state === "Draft" && (
            <button
              disabled={!ready}
              className="button"
              onClick={() => transition(propose)}
            >
              Confirm example contract <Icon icon={ArrowRight} />
            </button>
          )}
          {state === "Ready" && (
            <button
              disabled={!ready}
              className="button"
              onClick={() => transition(start)}
            >
              Run simulation <Icon icon={ArrowRight} />
            </button>
          )}
          {["Running", "Verifying"].includes(state) && (
            <button
              disabled={!ready}
              className="button secondary"
              onClick={() => transition(pause)}
            >
              Pause simulation
            </button>
          )}
          {state === "Verifying" && (
            <button
              disabled={!ready}
              className="button secondary"
              onClick={() => transition(raiseException)}
            >
              Raise an exception
            </button>
          )}
          {state === "Paused" && (
            <button
              disabled={!ready}
              className="button"
              onClick={() => transition(resume)}
            >
              Resume simulation
            </button>
          )}
          {state === "Awaiting approval" && (
            <>
              <button
                disabled={!ready}
                className="button"
                onClick={() =>
                  transition((current) => execute(approve(current)))
                }
              >
                Approve report creation
              </button>
              <button
                disabled={!ready}
                className="button secondary"
                onClick={() => transition(reject)}
              >
                Reject
              </button>
            </>
          )}
          {state === "Blocked" && (
            <button
              disabled={!ready}
              className="button"
              onClick={() => {
                setMissing(false);
                transition(retryEvidence);
              }}
            >
              Recover simulated receipt
            </button>
          )}
          {["Verified", "Blocked"].includes(state) && (
            <button
              disabled={!ready}
              className="button secondary"
              onClick={download}
            >
              <Icon icon={Download} /> Download evidence
            </button>
          )}
          {state !== "Draft" && (
            <button
              disabled={!ready}
              className="button secondary"
              onClick={() => {
                setMissing(false);
                transition(reset);
              }}
            >
              <Icon icon={RotateCcw} /> Reset simulation
            </button>
          )}
        </div>
        <p className="demo-caption">
          No production systems are connected. A verified report does not mean
          the two unmatched records were reconciled.
        </p>
      </div>
      <noscript>
        <div className="no-js">
          The example classifies 20 records: 18 match and 2 have documented
          exceptions. After explicit report approval, a destination receipt
          supports verification. Missing evidence blocks completion.{" "}
          <a href="/downloads/outcome-contract.txt" download>
            Download the full text walkthrough.
          </a>
        </div>
      </noscript>
    </div>
  );
}
