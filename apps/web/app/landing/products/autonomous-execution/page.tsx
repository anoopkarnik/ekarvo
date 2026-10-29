import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { Disclosure } from "@/components/landing/ekarvo/marketing/Disclosure";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { SpatialScene } from "@/components/landing/ekarvo/marketing/SpatialScene";
import { CapabilityAtlas } from "@/components/landing/ekarvo/marketing/CapabilityAtlas";
import { ExecutionDemo } from "@/components/landing/ekarvo/marketing/ExecutionDemo";
import "../../marketing-interactions.css";
const title = "Ekarvo Drive — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo Drive. Define an outcome, set the authority, and connect completion to evidence.",
  pathname: "/landing/products/autonomous-execution",
});
export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};
export default function DrivePage() {
  return (
    <MarketingShell active="Products">
      <section className="execution-landing">
        <div className="container execution-title">
          <p className="product-category">
            EKARVO DRIVE · AUTONOMOUS EXECUTION
          </p>
          <h1>
            Set the result. <br />
            Control the work.
          </h1>
          <p>
            Specify what counts as done, which actions are permitted, and what
            evidence will confirm completion.
          </p>
          <div className="actions">
            <a
              className="button"
              href="/landing/contact?product=autonomous-execution"
            >
              Discuss a workflow <Icon icon={ArrowUpRight} />
            </a>
            <a className="product-link" href="#journey">
              Discover the approach <Icon icon={ArrowDown} />
            </a>
          </div>
        </div>
        <SpatialScene
          mode="execution"
          eager
          label="A blue signal advances through defined work, authority, action and verification on a connected path."
        />
      </section>
      <section className="marketing-section container reveal-up">
        <p className="company-statement reveal-up">
          The next chapter of enterprise operations starts with a better
          question. <em>What needs to be done?</em>
        </p>
      </section>
      <section className="example-section" id="workflow-example">
        <div className="container example-layout reveal-stagger">
          <div className="example-copy reveal-up">
            <p className="product-category reveal-fade">ONE BOUNDED WORKFLOW</p>
            <h2 className="reveal-up">
              Move a request from intent to proven completion.
            </h2>
            <p className="reveal-up">
              A request crosses teams and systems. Define its owner, due time,
              permitted actions and acceptance checks. Route the work, pause for
              approval where needed and assign exceptions to a person.
            </p>
            <p className="reveal-up">
              A request is complete only when its agreed result is confirmed by
              the right source and the required evidence is present.
            </p>
            <a
              className="product-link micro-press reveal-up"
              href="/landing/approach#outcome-contract"
            >
              See how the outcome is defined <Icon icon={ArrowUpRight} />
            </a>
          </div>
          <div
            className="example-panel example-panel-dark glass glass-3 reveal-up"
            aria-label="Request execution workflow"
          >
            <p className="example-kicker reveal-fade">
              ONE REQUEST · CLEAR ACCOUNTABILITY
            </p>
            <ol className="example-flow reveal-stagger">
              <li className="reveal-up">
                <span>DEFINE</span>
                <strong>A clear result and a named owner.</strong>
                <p>
                  Set the scope, limits, permissions and test for completion.
                </p>
              </li>
              <li className="reveal-up">
                <span>EXECUTE</span>
                <strong>Coordinated work within those limits.</strong>
                <p>
                  Seek approval for consequential actions. Send exceptions to
                  the owner.
                </p>
              </li>
              <li className="reveal-up">
                <span>VERIFY</span>
                <strong>Evidence against the agreed result.</strong>
                <p>
                  Confirm the outcome from the source. Missing evidence keeps
                  the request open.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>
      <section
        className="marketing-section quiet-section reveal-stagger"
        id="journey"
      >
        <div className="container reveal-stagger">
          <div className="marketing-heading reveal-up">
            <h2 className="reveal-up">
              A defined result, with proof behind it.
            </h2>
            <p className="reveal-up">
              Set the authority before work starts, then test completion against
              the evidence that matters.
            </p>
          </div>
          <div className="outcome-steps reveal-stagger">
            <article className="outcome-step glass glass-2 micro-lift reveal-up">
              <h3>Define the result.</h3>
              <p>
                Agree what done means. Specify the inputs, acceptance criteria,
                owner and limits.
              </p>
            </article>
            <article className="outcome-step glass glass-2 micro-lift reveal-up">
              <h3>Coordinate the work.</h3>
              <p>
                Connect permitted actions and human decisions. Make exceptions
                visible when the path changes.
              </p>
            </article>
            <article className="outcome-step glass glass-2 micro-lift reveal-up">
              <h3>Verify completion.</h3>
              <p>
                Check the result against its criteria. Preserve the evidence and
                make uncertainty explicit.
              </p>
            </article>
          </div>
          <a
            className="product-link micro-press reveal-up"
            href="/landing/approach#outcome-contract"
          >
            Inside an Outcome Contract <Icon icon={ArrowUpRight} />
          </a>
        </div>
      </section>
      <section className="marketing-section container" id="capabilities">
        <div className="marketing-heading">
          <div>
            <p className="product-category">EKARVO DRIVE CAPABILITIES</p>
            <h2>From defined work to verified result.</h2>
          </div>
          <p>
            Explore the proposed capabilities for design, execution,
            orchestration, assurance and deployment.
          </p>
        </div>
        <CapabilityAtlas initialSelection={{ product: "drive" }} />
        <noscript>
          <div className="example-panel">
            <h3>Design. Execute. Orchestrate. Assure. Deploy.</h3>
            <p>
              Drive is designed to keep each step inside a defined scope, with
              human decisions and evidence connected.
            </p>
            <a
              className="product-link"
              href="/landing/contact?product=autonomous-execution"
            >
              Discuss a workflow <Icon icon={ArrowUpRight} />
            </a>
          </div>
        </noscript>
      </section>
      <section
        className="marketing-section quiet-section"
        id="execution"
        aria-labelledby="execution-heading"
      >
        <div className="container">
          <div className="marketing-heading">
            <div>
              <p className="product-category">Ekarvo Drive</p>
              <h2 id="execution-heading">
                From defined work
                <br />
                to verified completion.
              </h2>
            </div>
            <p>
              Inspect the contract, run the simulation, decide whether to
              approve report creation and test what happens when evidence is
              missing.
            </p>
          </div>
          <ExecutionDemo />
        </div>
      </section>
      <section className="marketing-section container reveal-stagger">
        <div className="marketing-heading reveal-up">
          <h2 className="reveal-up">
            Autonomy with
            <br />a clear boundary.
          </h2>
        </div>
        <div className="principles-grid reveal-stagger">
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Purpose before action.</h3>
            <p>
              A defined workflow, an accountable owner and a measurable unit of
              completion.
            </p>
          </article>
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Authority before execution.</h3>
            <p>
              Explicit permissions and human approval for consequential
              decisions.
            </p>
          </article>
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Evidence before certainty.</h3>
            <p>
              Completion established by criteria, rather than an attempted
              action or a confident answer.
            </p>
          </article>
        </div>
        <a className="product-link micro-press reveal-up" href="/landing/trust">
          Explore trust and control <Icon icon={ArrowUpRight} />
        </a>
      </section>
      <section
        className="marketing-section container faq"
        aria-labelledby="authority-heading"
      >
        <div className="marketing-heading">
          <h2 id="authority-heading">Authority and approval</h2>
        </div>
        <Disclosure question="Objective and owner">
          <p>
            Prepare a report for 20 synthetic records. Owner: demo process
            owner.
          </p>
        </Disclosure>
        <Disclosure question="Acceptance and evidence">
          <p>
            Classify all 20 records, document exception reasons and verify a
            receipt in the synthetic report destination. Unmatched records are
            valid report contents.
          </p>
        </Disclosure>
        <Disclosure question="Limits and escalation">
          <p>
            20 records, zero financial spend, this browser session only. Missing
            evidence blocks completion and returns the issue to the demo process
            owner.
          </p>
        </Disclosure>
      </section>
      <MarketingCTA
        title="Start with an outcome worth defining."
        body="Bring one workflow, its constraints and a clear definition of success."
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
      />
    </MarketingShell>
  );
}
