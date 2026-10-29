import React from "react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { marketingHref } from "@/components/landing/ekarvo/marketing/navigation";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { ArrowUpRight } from "lucide-react";
import { SpatialScene } from "@/components/landing/ekarvo/marketing/SpatialScene";
import { Disclosure } from "@/components/landing/ekarvo/marketing/Disclosure";

const title = "Trust and control — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo’s design principles for accountable execution: explicit authority, human oversight, clear evidence and bounded autonomy.",
  pathname: "/landing/trust",
});

export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

const levels = [
  [
    "Read within scope",
    "The system can see only the data needed for the task.",
  ],
  [
    "Recommend a next step",
    "A person decides whether to take the proposed action.",
  ],
  [
    "Act after approval",
    "The system acts only on the exact scope a person approved.",
  ],
  [
    "Act within agreed limits",
    "The system works inside defined rules, budgets and boundaries.",
  ],
  [
    "Coordinate a bounded workflow",
    "The system can connect permitted steps and send exceptions to an owner.",
  ],
];

export default function TrustPage() {
  return (
    <MarketingShell active="Trust">
      <section className="trust-landing container">
        <header className="trust-masthead">
          <p className="product-category">CONFIDENCE, BY DESIGN</p>
          <h1>
            More autonomy needs <br />
            clearer accountability.
          </h1>
          <p className="lead">
            The path to autonomous operations needs a clear answer to three
            questions: who can act, what can happen, and how do we know it is
            done?
          </p>
        </header>
        <div className="trust-custody-art">
          <SpatialScene
            mode="trust"
            eager
            label="A blue signal links context, authority, action and evidence through a single visible chain."
          />
        </div>
        <div className="definition-row provenance-strip">
          <article>
            <p className="product-category">AUTHORITY</p>
            <h2>Explicit permission.</h2>
            <p>
              Permissions tied to the action, system and scope. Authority is
              delegated, never assumed.
            </p>
          </article>
          <article>
            <p className="product-category">HUMAN INTERVENTION</p>
            <h2>An accountable decision.</h2>
            <p>
              Human approval for consequential actions. A clear owner when work
              needs attention.
            </p>
          </article>
          <article>
            <p className="product-category">EVIDENCE</p>
            <h2>A traceable result.</h2>
            <p>
              Completion linked to agreed criteria. Uncertainty remains visible
              until it is resolved.
            </p>
          </article>
        </div>
      </section>
      <section className="marketing-section quiet-section">
        <div className="container custody-editorial">
          <div>
            <p className="product-category">BOUNDED BY INTENT</p>
            <h2>
              Authority follows <br />
              the work.
            </h2>
            <p>
              Control belongs throughout the workflow, from its first
              instruction to its final evidence.
            </p>
          </div>
          <ol
            className="custody-questions"
            aria-label="Chain of accountability"
          >
            <li>What was requested?</li>
            <li>Who authorized the action?</li>
            <li>Where did a person intervene?</li>
            <li>What establishes completion?</li>
          </ol>
        </div>
      </section>
      <section className="marketing-section container">
        <div className="marketing-heading">
          <h2>
            Permission grows
            <br />
            with definition.
          </h2>
          <p>
            A graduated model for the authority
            <br />a workflow can receive.
          </p>
        </div>
        <div className="authority-list">
          {levels.map(([title, body]) => (
            <article className="authority-row" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="marketing-legal-note">
          No level grants unrestricted authority. The system boundary, approval
          rules and recovery path must be defined for each workflow.
        </p>
      </section>
      <section className="marketing-section quiet-section">
        <div className="container marketing-copy-columns">
          <div>
            <h2>
              Confidence comes
              <br />
              from the details.
            </h2>
            <p>
              These principles guide the product design. Specific controls, data
              handling, deployment requirements and supporting evidence form
              part of the review for each engagement.
            </p>
            <a className="product-link" href={marketingHref("/contact")}>
              Discuss your requirements <Icon icon={ArrowUpRight} />
            </a>
          </div>
          <div className="faq">
            <Disclosure
              id="missing-evidence"
              question="What happens when evidence is missing?"
            >
              <p>
                Completion cannot be established. The workflow needs an owner,
                an explanation of the missing evidence and a recovery step.
              </p>
            </Disclosure>
            <Disclosure
              id="stopping-actions"
              question="Can an action always be stopped?"
            >
              <p>
                Pausing stops new dispatches. It may not reverse an in-flight
                action. Unknown effects must be reconciled before a retry.
              </p>
            </Disclosure>
            <Disclosure
              id="scope-changes"
              question="What happens when the scope changes?"
            >
              <p>
                An approval belongs to a defined action. A changed target,
                effect or material scope requires a new decision.
              </p>
            </Disclosure>
          </div>
        </div>
      </section>
      <MarketingCTA
        artwork={
          <picture className="film-closing-art" aria-hidden="true">
            <img
              src="/images/cinematic/study-evidence-dark.webp"
              alt=""
              width={1440}
              height={640}
              loading="lazy"
              decoding="async"
            />
          </picture>
        }
        title="Bring your requirements into the conversation."
        body="Define the workflow, the controls and the evidence your organization needs."
      />
    </MarketingShell>
  );
}
