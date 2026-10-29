import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { Disclosure } from "@/components/landing/ekarvo/marketing/Disclosure";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { SpatialScene } from "@/components/landing/ekarvo/marketing/SpatialScene";
import { CapabilityAtlas } from "@/components/landing/ekarvo/marketing/CapabilityAtlas";
import { DecisionProof } from "@/components/landing/ekarvo/marketing/DecisionProof";
import "../../marketing-interactions.css";

const title = "Ekarvo Pulse — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo Pulse. A connected operating picture for enterprise operations, from demand and capacity to quality and economics.",
  pathname: "/landing/products/operations-os",
});
export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

export default function PulsePage() {
  return (
    <MarketingShell active="Products">
      <section className="operations-landing">
        <div className="container product-editorial-title">
          <p className="product-category">
            EKARVO PULSE · OPERATING INTELLIGENCE
          </p>
          <h1>See the whole operation.</h1>
          <div className="product-editorial-summary">
            <p>
              Bring demand, capacity, work, quality and cost into one view.
              Understand the consequences before you decide.
            </p>
            <div className="actions">
              <a
                className="button"
                href="/landing/contact?product=operations-os"
              >
                Discuss a workflow <Icon icon={ArrowUpRight} />
              </a>
              <a className="product-link" href="#capabilities">
                Explore the capabilities <Icon icon={ArrowDown} />
              </a>
            </div>
          </div>
        </div>
        <SpatialScene
          mode="operations"
          eager
          label="A connected signal links operating context, choices and outcomes through four connected information layers."
        />
      </section>
      <nav
        className="product-anchor-nav glass glass-1 reveal-up"
        aria-label="Ekarvo Pulse page sections"
      >
        <div className="container">
          <a href="#workflow-example">A work example</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#how-it-connects">The shared foundation</a>
        </div>
      </nav>
      <section className="marketing-section container reveal-up">
        <p className="company-statement reveal-up">
          An operational commitment touches every part of the business.{" "}
          <em>Your operating picture should too.</em>
        </p>
      </section>
      <section className="example-section" id="workflow-example">
        <div className="container example-layout reveal-stagger">
          <div className="example-copy reveal-up">
            <p className="product-category reveal-fade">
              THE OPERATING DECISION
            </p>
            <h2 className="reveal-up">
              Capacity is short. Which response holds the commitment?
            </h2>
            <p className="reveal-up">
              When a work queue has more work than the team can cover, a planner
              needs to know the gap, the available skills, the cost of a
              resource move and the operational risk of waiting.
            </p>
            <p className="reveal-up">
              Ekarvo Pulse is designed to connect those signals. A leader
              chooses the response. The team then measures what changed in
              actual work.
            </p>
            <a
              className="product-link micro-press reveal-up"
              href="/landing/contact?product=operations-os"
            >
              Discuss an operating decision <Icon icon={ArrowUpRight} />
            </a>
          </div>
          <div
            className="example-panel glass glass-3 reveal-up"
            aria-label="Capacity decision workflow"
          >
            <p className="example-kicker reveal-fade">
              FROM CONSTRAINT TO MEASURED RESULT
            </p>
            <ol className="example-flow reveal-stagger">
              <li className="reveal-up">
                <span>INPUT</span>
                <strong>Demand, effective capacity and skill coverage.</strong>
                <p>Identify the uncovered work and its commitment deadline.</p>
              </li>
              <li className="reveal-up">
                <span>DECISION</span>
                <strong>Move capacity or approve overtime?</strong>
                <p>Compare coverage, cost and the effect on other teams.</p>
              </li>
              <li className="reveal-up">
                <span>CHECK</span>
                <strong>Did the intervention work?</strong>
                <p>
                  Measure actual queue, service and cost results. An approved
                  plan alone is not proof.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>
      <section className="marketing-section quiet-section reveal-stagger">
        <div className="container principles-grid reveal-stagger">
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Anticipate the constraint.</h3>
            <p>
              Read demand against effective capacity, skills and service
              commitments.
            </p>
          </article>
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Compare the trade-offs.</h3>
            <p>
              Connect a resource decision to its cost, quality and impact on
              other teams.
            </p>
          </article>
          <article className="glass glass-2 micro-lift reveal-up">
            <h3>Measure what changed.</h3>
            <p>
              Follow the intervention through to the result. Keep estimates
              separate from evidence.
            </p>
          </article>
        </div>
      </section>
      <section
        className="marketing-section container"
        aria-labelledby="proof-heading"
      >
        <div className="marketing-heading">
          <div>
            <p className="product-category">A CONNECTED WORK EXAMPLE</p>
            <h2 id="proof-heading">Follow the decision through.</h2>
          </div>
          <p>
            Explore a synthetic workflow from signal to evidence and learning.
            No connected system or real work is changed.
          </p>
        </div>
        <DecisionProof />
        <noscript>
          <p className="small-copy">
            Compare the response, authorize the scope, record the action, verify
            the evidence and retain the learning. The interactive example
            requires JavaScript.
          </p>
        </noscript>
      </section>
      <section className="marketing-section container" id="capabilities">
        <div className="marketing-heading">
          <div>
            <p className="product-category">EKARVO PULSE CAPABILITIES</p>
            <h2>See the work in context.</h2>
          </div>
          <p>
            Explore the proposed capabilities across planning, operations,
            development and optimization. Select a group and module to see how
            it connects.
          </p>
        </div>
        <CapabilityAtlas />
        <noscript>
          <div className="example-panel">
            <h3>Plan. Operate. Develop. Optimize.</h3>
            <p>
              Pulse is designed to connect the operating picture across these
              four capability groups.
            </p>
            <a
              className="product-link"
              href="/landing/contact?product=operations-os"
            >
              Discuss a workflow <Icon icon={ArrowUpRight} />
            </a>
          </div>
        </noscript>
      </section>
      <section
        className="marketing-section quiet-section reveal-stagger"
        id="how-it-connects"
      >
        <div className="container editorial-feature reveal-stagger">
          <div className="editorial-image-window glass glass-2 reveal-scale">
            <SpatialScene
              mode="platform"
              label="The connected signal appears on a light surface, linking work context to a verified result."
            />
          </div>
          <div className="reveal-up">
            <p className="product-category reveal-fade">
              ONE CONNECTED FOUNDATION
            </p>
            <h2 className="reveal-up">
              Keep what works and connect what matters.
            </h2>
            <p className="reveal-up">
              A modular approach to enterprise operations. Add capability where
              it is missing. Bring existing systems into a consistent view of
              work, decisions and economics.
            </p>
            <a
              className="product-link micro-press reveal-up"
              href="/landing/platform"
            >
              Explore the shared platform <Icon icon={ArrowUpRight} />
            </a>
          </div>
        </div>
      </section>
      <section className="marketing-section container reveal-stagger">
        <div className="marketing-copy-columns reveal-stagger">
          <div className="reveal-up">
            <h2 className="reveal-up">
              Built for the people
              <br />
              behind the commitment.
            </h2>
            <p className="lead reveal-up">
              Operations leaders, workflow owners, planners, quality teams and
              transformation teams can work from the same operating picture.
            </p>
          </div>
          <div className="faq reveal-up">
            <Disclosure question="What is the starting point?">
              <p>
                One recurring operating problem with an accountable owner,
                authorized data and a measurable baseline. Scope the first
                workflow before expanding across capabilities.
              </p>
            </Disclosure>
            <Disclosure question="Does this replace the existing stack?">
              <p>
                The product direction combines selected native capabilities with
                connections to existing systems. HR systems and invasive
                employee monitoring are outside its scope. Specific integration
                needs are agreed during discovery.
              </p>
            </Disclosure>
            <Disclosure question="How do we evaluate fit?">
              <p>
                Start with the work, the decision and the desired outcome. Use
                discovery to establish supported scope, data requirements and
                the implementation path for your operation.
              </p>
            </Disclosure>
          </div>
        </div>
      </section>
      <MarketingCTA
        title="Put the whole operation in perspective."
        body="Tell us where work becomes difficult. Start with the decision that matters."
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
