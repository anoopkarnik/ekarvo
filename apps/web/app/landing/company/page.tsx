import React from "react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { MarketingCTA } from "@/components/landing/ekarvo/marketing/primitives";
import { marketingHref } from "@/components/landing/ekarvo/marketing/navigation";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import { ArrowUpRight } from "lucide-react";

const title = "Our vision — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo’s vision: enterprises define outcomes and intelligent systems deliver them. Meet the thinking behind accountable autonomous operations.",
  pathname: "/landing/company",
});

export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

export default function CompanyPage() {
  return (
    <MarketingShell active="Company">
      <section className="company-editorial-hero">
        <div className="container">
          <p className="product-category">THE AUTONOMOUS EXECUTION COMPANY</p>
          <h1>
            Responsibility <br />
            <span>belongs to people.</span>
          </h1>
          <div className="company-judgment">
            <p>
              We believe enterprises should define the result and retain
              authority over consequential decisions.
            </p>
            <blockquote>
              “The system may coordinate the work. <br />A person stays
              accountable for the result.”
            </blockquote>
            <p className="judgment-label">THE PRINCIPLE BEHIND EKARVO</p>
          </div>
          <div className="outcome-rule" aria-hidden="true"></div>
        </div>
      </section>
      <section className="company-human-chapter">
        <figure className="company-photograph">
          <picture>
            <source
              media="(max-width:650px)"
              srcSet="/images/company/human-judgment-small.webp"
            />
            <img
              src="/images/company/human-judgment.webp"
              width="1800"
              height="1200"
              loading="lazy"
              decoding="async"
              alt="A person climbs a quiet stairway toward daylight, framed by concrete walls."
            />
          </picture>
          <figcaption className="container">
            <p className="company-statement">
              Work moves across people, systems and decisions.{" "}
              <em>Responsibility should move with it.</em>
            </p>
            <a
              className="photo-credit"
              href="https://unsplash.com/photos/3tOdzLcyVww"
              target="_blank"
              rel="noopener noreferrer"
            >
              Photograph by MAK / Unsplash <Icon icon={ArrowUpRight} />
            </a>
          </figcaption>
        </figure>
      </section>
      <section className="marketing-section quiet-section">
        <div className="container marketing-copy-columns">
          <div>
            <p className="product-category">OUR PURPOSE</p>
            <h2>
              Close the gap
              <br />
              between intent
              <br />
              and outcome.
            </h2>
          </div>
          <div>
            <p>
              Enterprise operations hold extraordinary knowledge. Too often,
              that knowledge is divided across tools, teams and handoffs.
            </p>
            <p>
              Ekarvo’s direction brings operational context, controlled
              execution and evidence together. The ambition is a world where
              enterprises define outcomes and intelligent systems deliver them.
            </p>
          </div>
        </div>
      </section>
      <section className="marketing-section container">
        <div className="marketing-heading">
          <h2>Start with operating intelligence and build toward autonomy.</h2>
          <p>Two distinct products serve a connected long-term vision.</p>
        </div>
        <div className="marketing-copy-columns">
          <article>
            <h3>Ekarvo Pulse</h3>
            <p>
              Our initial focus is enterprise operations: the connection between
              commitments, capacity, work, quality and economics.
            </p>
            <a
              className="product-link"
              href={marketingHref("/products/operations-os")}
            >
              Explore Ekarvo Pulse <Icon icon={ArrowUpRight} />
            </a>
          </article>
          <article>
            <h3>Ekarvo Drive</h3>
            <p>
              The next direction brings bounded enterprise workflows under a
              clear outcome, explicit authority and evidence of completion.
            </p>
            <a
              className="product-link"
              href={marketingHref("/products/autonomous-execution")}
            >
              Explore Ekarvo Drive <Icon icon={ArrowUpRight} />
            </a>
          </article>
        </div>
      </section>
      <section className="marketing-section quiet-section">
        <div className="container marketing-copy-columns">
          <h2>Our way of building.</h2>
          <ol className="marketing-steps-list">
            <li>
              Start with a problem that matters to the person who owns it.
            </li>
            <li>Make the work simpler before making it autonomous.</li>
            <li>Keep human authority and accountability explicit.</li>
            <li>Measure the result. Learn from the evidence.</li>
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
        title="Build the next chapter of operations."
        body="Start a conversation about the work you want to change."
      />
    </MarketingShell>
  );
}
