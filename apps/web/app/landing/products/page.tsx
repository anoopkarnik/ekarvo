import React from "react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { ProductCarousel } from "@/components/landing/ekarvo/marketing/ProductCarousel";
import { ProductMap } from "@/components/landing/ekarvo/marketing/ProductMap";
import {
  MarketingCTA,
  ProductLink,
} from "@/components/landing/ekarvo/marketing/primitives";
import { PRODUCTS } from "@/components/landing/ekarvo/marketing/data";
import "../marketing-interactions.css";

const title = "Products — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Meet Ekarvo Pulse and Ekarvo Drive. Two connected product directions for better enterprise operations.",
  pathname: "/landing/products",
});
export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};

export default function ProductsPage() {
  return (
    <MarketingShell active="Products">
      <section className="product-map-landing container">
        <header>
          <p className="product-category">THE EKARVO PRODUCT FAMILY</p>
          <h1>
            See the work.
            <br />
            Carry it forward.
          </h1>
          <p className="lead">
            Ekarvo Pulse brings the operating picture together. Ekarvo Drive
            connects defined work to authority and evidence.
          </p>
        </header>
      </section>
      <ProductCarousel products={PRODUCTS} />
      <section
        className="marketing-section container product-capabilities"
        aria-label="Connected product capabilities"
      >
        <ProductMap />
      </section>
      <section className="marketing-section container">
        <div className="marketing-heading">
          <h2>
            Start with what
            <br />
            needs to change.
          </h2>
          <p>
            The right product starts with
            <br />a clear operational problem.
          </p>
        </div>
        <div className="principles-grid product-principles">
          <article>
            <h3>Connect the operation.</h3>
            <p>
              Bring demand, capacity, quality and cost into the same decision.
              Start with Ekarvo Pulse.
            </p>
            <ProductLink href="/products/operations-os">
              Explore Ekarvo Pulse
            </ProductLink>
          </article>
          <article>
            <h3>Coordinate execution.</h3>
            <p>
              Define the result, set the authority and follow the evidence.
              Explore Ekarvo Drive.
            </p>
            <ProductLink href="/products/autonomous-execution">
              Explore the approach
            </ProductLink>
          </article>
          <article>
            <h3>Find the first step.</h3>
            <p>
              Describe your operation and the change that matters. Build the
              brief around a measurable outcome.
            </p>
            <ProductLink href="/contact">Let’s talk</ProductLink>
          </article>
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
