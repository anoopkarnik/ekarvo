"use client";

import React from "react";
import { Icon } from "./Icon";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ArrowRight, RotateCcw } from "lucide-react";
export function OperationsDemo({ compact = false }: { compact?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [view, setView] = useState("overview");
  const [option, setOption] = useState("move");
  const [approved, setApproved] = useState(false);
  const previousView = useRef("overviewfalse");
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = view + approved;
    if (previousView.current !== key) {
      previousView.current = key;
      content.current?.querySelector("h3")?.focus({ preventScroll: true });
    }
  }, [view, approved]);
  const demand = 1200,
    capacity = 960,
    extra = option === "move" ? 240 : 180;
  const reset = () => {
    setView("overview");
    setApproved(false);
    setOption("move");
  };
  return (
    <div
      className="demo-shell operations-demo"
      role="region"
      aria-label="Synthetic capacity planning"
    >
      <div className="demo-topbar">
        <strong>
          Ekarvo Pulse <span className="muted">/ Delivery control</span>
        </strong>
        <span className="demo-label">Product concept · Synthetic data</span>
      </div>
      {!compact && (
        <div className="demo-tabs" role="group" aria-label="Demo views">
          {["overview", "scenarios", "evidence"].map((v) => (
            <button
              disabled={!ready}
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}
      <div className="demo-content">
        <div
          className={
            previousView.current === view + approved
              ? "operations-view"
              : "operations-view operations-view-changing"
          }
          key={view + approved}
          ref={content}
        >
          {view === "overview" && (
            <>
              <div className="demo-title">
                <div>
                  <p
                    className="small-copy muted"
                    style={{ marginBottom: ".25rem" }}
                  >
                    Service account · Today
                  </p>
                  <h3 tabIndex={-1}>Service operations</h3>
                </div>
                <span className={"pill " + (approved ? "blue" : "warning")}>
                  {approved ? "Plan approved" : "Capacity risk"}
                </span>
              </div>
              <div className="metric-row">
                <div className="metric">
                  <strong>1,200</strong>
                  <span>Work units due</span>
                </div>
                <div className="metric">
                  <strong>{approved ? capacity + extra : capacity}</strong>
                  <span>Capacity / day</span>
                </div>
                <div className="metric">
                  <strong>
                    {approved ? Math.max(0, demand - capacity - extra) : 240}
                  </strong>
                  <span>Unit shortfall</span>
                </div>
              </div>
              <div
                className="mini-chart"
                aria-label={`Demand 1200 units; ${approved ? "approved" : "baseline"} capacity ${approved ? capacity + extra : capacity} units`}
              >
                <div className="chart-row">
                  <span>Demand</span>
                  <div className="bar-track">
                    <span />
                  </div>
                  <span>1,200</span>
                </div>
                <div className="chart-row">
                  <span>Capacity</span>
                  <div className="bar-track neutral">
                    <span
                      style={{
                        transform: `scaleX(${(approved ? capacity + extra : capacity) / 1200})`,
                      }}
                    />
                  </div>
                  <span>{approved ? capacity + extra : 960}</span>
                </div>
              </div>
              <div className="demo-insight">
                <strong>
                  {approved
                    ? "A decision with a clear next step."
                    : "A shortfall worth acting on."}
                </strong>
                <p>
                  {approved
                    ? "The simulated plan is approved. Verify the result against the next delivery period."
                    : "A skill-qualified resource move could cover the 240-unit gap. Review the donor team before approval."}
                </p>
              </div>
              <div className="demo-actions">
                <button
                  disabled={!ready}
                  className="button"
                  onClick={() => setView("scenarios")}
                >
                  Compare scenarios <Icon icon={ArrowRight} />
                </button>
                {compact ? (
                  <a
                    className="button secondary"
                    href="/landing/demo#operations"
                  >
                    Open full demo <Icon icon={ArrowUpRight} />
                  </a>
                ) : (
                  <button
                    disabled={!ready}
                    className="button secondary"
                    onClick={() => setView("evidence")}
                  >
                    View assumptions
                  </button>
                )}
              </div>
            </>
          )}
          {view === "scenarios" && (
            <>
              <div className="demo-title">
                <h3 tabIndex={-1}>Choose a capacity plan</h3>
                <span className="pill blue">Simulation</span>
              </div>
              <p className="small-copy muted">
                Same demand. Two trade-offs. No assignments or payments are
                made.
              </p>
              <div className="scenario-grid">
                <button
                  disabled={!ready}
                  className="scenario-option"
                  aria-pressed={option === "move"}
                  onClick={() => {
                    setOption("move");
                    setApproved(false);
                  }}
                >
                  <strong>Reallocate capacity</strong>
                  <span>2 qualified people × 120 units</span>
                  <span>240 units / day · ₹0 incremental spend</span>
                </button>
                <button
                  disabled={!ready}
                  className="scenario-option"
                  aria-pressed={option === "overtime"}
                  onClick={() => {
                    setOption("overtime");
                    setApproved(false);
                  }}
                >
                  <strong>Approve overtime</strong>
                  <span>6 hours × 30 units</span>
                  <span>180 units / day · ₹3,600 incremental spend</span>
                </button>
              </div>
              <div className="status-box">
                <p className="small-copy">
                  <strong>
                    {Math.max(0, demand - capacity - extra)} units remain
                    uncovered.
                  </strong>{" "}
                  {option === "move"
                    ? "Donor team: 300 units of spare capacity before the move; 60 after. Assumes matching skills and permitted cross-account access."
                    : "No donor-team impact. Assumes ₹600 per overtime hour and unchanged quality."}
                </p>
              </div>
              <div className="demo-actions">
                <button
                  disabled={!ready}
                  className="button"
                  onClick={() => {
                    setApproved(true);
                    setView("evidence");
                  }}
                >
                  Approve simulated plan <Icon icon={Check} />
                </button>
                <button
                  disabled={!ready}
                  className="button secondary"
                  onClick={() => setView("overview")}
                >
                  Back to overview
                </button>
              </div>
            </>
          )}
          {view === "evidence" && (
            <>
              <div className="demo-title">
                <h3 tabIndex={-1}>
                  {approved
                    ? "Decision recorded. Evidence next."
                    : "What this model assumes."}
                </h3>
                <span className="pill blue">
                  {approved ? "Awaiting measurement" : "Scenario model"}
                </span>
              </div>
              <dl className="signal-list">
                <dt>Baseline</dt>
                <dd>
                  1,200 units due − 960 units capacity = 240-unit shortfall.
                </dd>
                <dt>{approved ? "Approved plan" : "Scenario boundaries"}</dt>
                <dd>
                  {approved
                    ? option === "move"
                      ? "Reallocate two qualified resources. Donor capacity remains 60 units above demand."
                      : "Add six overtime hours. A 60-unit gap still needs an owner."
                    : "Fixed productivity, matching skills, unchanged quality and no additional work arrivals."}
                </dd>
                <dt>Verification</dt>
                <dd>
                  Compare completed units, SLA, quality and donor-team impact in
                  the next period. Approval alone does not establish
                  improvement.
                </dd>
              </dl>
              <div className="demo-actions">
                <button
                  disabled={!ready}
                  className="button"
                  onClick={() => setView("overview")}
                >
                  Return to overview <Icon icon={ArrowRight} />
                </button>
                <button
                  disabled={!ready}
                  className="button secondary"
                  onClick={reset}
                >
                  <Icon icon={RotateCcw} /> Reset demo
                </button>
              </div>
            </>
          )}
        </div>
        <p className="demo-caption">
          Scenario model · Units and costs are synthetic, not company results.
        </p>
        <div className="sr-only" role="status" aria-live="polite">
          {view === "evidence" && approved
            ? "Simulated plan approved. Results still require measurement."
            : ""}
        </div>
      </div>
      <noscript>
        <div className="no-js">
          The example compares demand of 1,200 units with capacity of 960.
          Moving two qualified people adds 240 units. Their donor team retains
          60 units of spare capacity. These are assumptions, not verified
          improvements.
        </div>
      </noscript>
    </div>
  );
}
