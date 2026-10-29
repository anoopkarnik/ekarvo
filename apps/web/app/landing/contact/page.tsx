import React, { Suspense } from "react";
import { ArrowDown } from "lucide-react";
import { createSeoMetadata } from "@/lib/seo";
import { MarketingShell } from "@/components/landing/ekarvo/marketing/MarketingShell";
import { Icon } from "@/components/landing/ekarvo/marketing/Icon";
import {
  ContactWorkflowEntry,
  ContactWorkflowForm,
} from "@/components/landing/ekarvo/marketing/ContactWorkflowForm";
const title = "Discuss a workflow — Ekarvo";
const seo = createSeoMetadata({
  title,
  description:
    "Ekarvo connects operational insight to accountable outcomes through Ekarvo Pulse and Ekarvo Drive.",
  pathname: "/landing/contact",
});
export const metadata = {
  ...seo,
  title,
  openGraph: { ...seo.openGraph, title },
  twitter: { ...seo.twitter, title },
};
export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="container form-layout contact-landing">
        <div className="contact-introduction">
          <p className="product-category">START WITH THE WORK</p>
          <h1>
            What would you <br />
            like to change?
          </h1>
          <p className="lead">
            Describe the work you want to complete and what would count as a
            successful result.
          </p>
          <ul className="check-list">
            <li>Identify the workflow and its owner.</li>
            <li>Describe the current constraint.</li>
            <li>Define a measurable result.</li>
          </ul>
          <p className="small-copy muted contact-reassurance">
            Your brief stays on this computer. Save it here or download a copy
            to use in your next conversation.
          </p>
          <a
            className="text-link micro-press"
            href="/downloads/workflow-brief.txt"
            download
          >
            Download a blank brief <Icon icon={ArrowDown} />
          </a>
        </div>
        <div>
          <Suspense fallback={<ContactWorkflowForm />}>
            <ContactWorkflowEntry />
          </Suspense>
        </div>
      </section>
    </MarketingShell>
  );
}
