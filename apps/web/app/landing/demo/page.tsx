import React from "react";
import { ArrowDown } from "lucide-react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import {
  PageHero,
  MarketingCTA,
} from "@/components/landing/ekarvo/marketing/primitives";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { OperationsDemo } from "@/components/landing/ekarvo/marketing/OperationsDemo";
import { ExecutionDemo } from "@/components/landing/ekarvo/marketing/ExecutionDemo";
import "../marketing-interactions.css";

const title = "Interactive product demos — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo connects operational insight to accountable outcomes through Ekarvo Pulse and Ekarvo Drive.",
  pathname: "/landing/demo",
});
export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

export default function DemoPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Explore the product concepts"
        title="Test a decision and inspect its evidence."
        body="Two local demonstrations make the proposed products concrete. All records, costs and results are synthetic. No live business systems are connected."
      >
        <div className="actions">
          <a className="button" href="#operations">
            Ekarvo Pulse <Icon icon={ArrowDown} />
          </a>
          <a className="button secondary" href="#execution">
            Ekarvo Drive <Icon icon={ArrowDown} />
          </a>
        </div>
      </PageHero>
      <section id="operations" className="section container">
        <div className="demo-section-header">
          <div>
            <p className="eyebrow">Ekarvo Pulse</p>
            <h2>
              Close a capacity gap.
              <br />
              See the trade-offs.
            </h2>
          </div>
          <p>
            Compare resource allocation with overtime. Review the donor-team
            effect and the remaining shortfall before approving a plan.
          </p>
        </div>
        <OperationsDemo />
      </section>
      <section id="execution" className="section demo-subtle">
        <div className="container">
          <div className="demo-section-header">
            <div>
              <p className="eyebrow">Ekarvo Drive</p>
              <h2>
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
          <ExecutionDemo compact />
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
