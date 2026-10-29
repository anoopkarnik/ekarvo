import React from "react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { marketingHref } from "@/components/landing/ekarvo/marketing/navigation";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SpatialScene } from "@/components/landing/ekarvo/marketing/SpatialScene";
import { StoryPlate } from "@/components/landing/ekarvo/marketing/StoryPlate";

const title = "Our approach — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Explore how Ekarvo defines an outcome, governs the work and verifies completion.",
  pathname: "/landing/approach",
});

export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

const anatomy = [
  [
    "The result",
    "What must be completed, for whom and within which boundaries.",
  ],
  [
    "The authority",
    "Which actions are permitted, and which decisions need a person.",
  ],
  [
    "The evidence",
    "What proves completion and who owns an unresolved exception.",
  ],
];

export default function ApproachPage() {
  return (
    <MarketingShell active="Approach">
      <section className="approach-landing">
        <div className="container approach-masthead">
          <p className="product-category">THE EKARVO APPROACH</p>
          <h1>
            Done is more <br />
            than a status.
          </h1>
          <div>
            <p className="lead">
              A completed outcome has a defined result, clear boundaries and
              evidence that supports the claim.
            </p>
            <a className="product-link" href="#outcome-contract">
              Inside an Outcome Contract <Icon icon={ArrowDown} />
            </a>
          </div>
        </div>
        <div className="approach-record">
          <SpatialScene
            mode="evidence"
            eager
            label="A connected signal reaches the verification stage only after context, decision and action."
          />
        </div>
      </section>
      <StoryPlate
        eyebrow="THE RESULT COMES FIRST"
        title="Give every decision a clear destination."
        body="Define the outcome before work starts, so each action has a boundary and completion has a test."
        stages={[
          "Defined result",
          "Permitted action",
          "Evidence of completion",
        ]}
      />
      <section className="marketing-section container">
        <div className="outcome-steps">
          <article className="outcome-step">
            <h3>Define the result</h3>
            <p>
              Start with the outcome. Agree the scope, acceptance criteria and
              accountable owner.
            </p>
          </article>
          <article className="outcome-step">
            <h3>Coordinate the work</h3>
            <p>
              Coordinate the work across approved systems and human decisions.
              Keep exceptions in view.
            </p>
          </article>
          <article className="outcome-step">
            <h3>Verify completion</h3>
            <p>
              Evaluate the evidence against the criteria. Keep incomplete work
              and uncertain results visible.
            </p>
          </article>
        </div>
      </section>
      <section
        className="marketing-section quiet-section"
        id="outcome-contract"
      >
        <div className="container">
          <div className="marketing-heading">
            <div>
              <p className="product-category">THE OUTCOME CONTRACT</p>
              <h2>
                Clarity before
                <br />
                the first action.
              </h2>
            </div>
            <p>
              A shared definition of what must happen,
              <br />
              what may happen and what proves it happened.
            </p>
          </div>
          <div className="principles-grid">
            {anatomy.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <a
            className="product-link"
            href="/downloads/outcome-contract.txt"
            download
          >
            Download an example contract <Icon icon={ArrowDown} />
          </a>
        </div>
      </section>
      <section className="marketing-section container">
        <div className="marketing-copy-columns">
          <div>
            <h2>
              Make the distinction
              <br />
              that matters.
            </h2>
            <p className="lead">
              An approved plan is not a measured improvement. A sent message is
              not a resolved issue.
            </p>
          </div>
          <div>
            <p>
              The outcome determines the work and the test for completion. That
              is how the conversation moves from activity to accountability.
            </p>
            <p>
              An Outcome Contract is a product specification for the workflow.
              Commercial scope and commitments are agreed separately.
            </p>
            <a className="product-link" href={marketingHref("/trust")}>
              Our control principles <Icon icon={ArrowUpRight} />
            </a>
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
      />
    </MarketingShell>
  );
}
