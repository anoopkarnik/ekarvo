import React from "react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { marketingHref } from "@/components/landing/ekarvo/marketing/navigation";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { ArrowUpRight } from "lucide-react";
import { SpatialScene } from "@/components/landing/ekarvo/marketing/SpatialScene";

const title = "The platform — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Intelligence, Execution and Assurance. The shared foundation behind Ekarvo Pulse and Ekarvo Drive.",
  pathname: "/landing/platform",
});

export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

export default function PlatformPage() {
  return (
    <MarketingShell active="Platform">
      <section className="platform-landing">
        <header className="container platform-masthead">
          <p className="product-category">THE SHARED FOUNDATION</p>
          <h1>
            A shared foundation. <br />
            <span>Built to connect.</span>
          </h1>
          <p className="lead">
            Intelligence, Execution and Assurance connect the products through a
            consistent view of work, authority and evidence.
          </p>
        </header>
        <div
          className="container architecture-key"
          aria-label="Architecture relationships"
        >
          <span>Source data</span>
          <span>Models</span>
          <span>Decisions</span>
          <span>Controls</span>
          <span>Interfaces</span>
          <span>Evidence</span>
        </div>
        <figure className="platform-blueprint">
          <SpatialScene
            mode="platform"
            eager
            label="A connected signal links operating intelligence, controlled execution and assurance."
          />
          <figcaption className="container definition-row platform-layer-notes">
            <article>
              <h2>Intelligence</h2>
              <p>
                Understand the objective, operating context and constraints.
                Connect recommendations to source evidence.
              </p>
            </article>
            <article>
              <h2>Execution</h2>
              <p>
                Coordinate permitted actions, human approvals and the handoffs
                between systems.
              </p>
            </article>
            <article>
              <h2>Assurance</h2>
              <p>
                Govern authority, preserve the evidence and evaluate completion
                across the lifecycle.
              </p>
            </article>
          </figcaption>
        </figure>
      </section>
      <section className="marketing-section quiet-section platform-manifesto">
        <div className="container editorial-feature">
          <div>
            <p className="product-category">A FOUNDATION FOR BOTH PRODUCTS</p>
            <h2>Connected by design.</h2>
            <p>
              Ekarvo Pulse brings the operating picture together. Ekarvo Drive
              organizes a defined path to completion. The same principles
              connect both: consistent definitions, explicit authority and
              traceable evidence.
            </p>
            <a className="product-link" href={marketingHref("/products")}>
              Meet the products <Icon icon={ArrowUpRight} />
            </a>
          </div>
        </div>
      </section>
      <section className="marketing-section container">
        <div className="marketing-copy-columns">
          <div>
            <p className="product-category">THE INTEGRATION APPROACH</p>
            <h2>Your systems in a shared operating context.</h2>
          </div>
          <ol className="marketing-steps-list">
            <li>Preserve the source of truth and its definitions.</li>
            <li>Validate data quality before recommending an action.</li>
            <li>Separate permission to read from permission to change.</li>
            <li>
              Agree the supported scope and integration path for each workflow.
            </li>
          </ol>
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
