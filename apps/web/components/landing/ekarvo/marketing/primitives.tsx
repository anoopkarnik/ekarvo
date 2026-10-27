import React, { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "./Icon";
import { marketingHref } from "./navigation";

export interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
  artwork?: ReactNode;
}

export function PageHero({ eyebrow, title, body, children, artwork }: PageHeroProps) {
  return (
    <section className="page-hero directed-page-hero">
      <div className="container directed-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{body}</p>
        {children}
      </div>
      {artwork}
    </section>
  );
}

export interface MarketingCTAProps {
  title?: ReactNode;
  body?: ReactNode;
  artwork?: ReactNode;
}

export function MarketingCTA({
  title = "Which workflow should change first?",
  body = "Tell us where work slows, who owns the decision, and what result you need.",
  artwork,
}: MarketingCTAProps) {
  return (
    <section className="marketing-cta film-closing">
      <div className="container">
        <div className="film-closing-copy">
          <p className="product-category">THE NEXT MOVE IS YOURS</p>
          <h2>{title}</h2>
          <p>{body}</p>
          <Link className="button" href={marketingHref("/contact")}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
        </div>
        {artwork}
      </div>
    </section>
  );
}

export function ProductLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={marketingHref(href)} className={`product-link ${className}`.trim()}>{children}<Icon icon={ArrowUpRight} /></Link>;
}
