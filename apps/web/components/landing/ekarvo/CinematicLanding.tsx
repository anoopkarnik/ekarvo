"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { initCinematicLanding } from "./film/cinematicLanding";
import { CONTACT_HREF, chapters, readingEvidence } from "./film/content";
import { Icon, SiteFooter, SiteHeader } from "./SiteChrome";

function Film() {
  const root = useRef<HTMLDivElement>(null);

  // The film mutates its own DOM per frame (opacity, classes, labels); React renders it once.
  useEffect(() => (root.current ? initCinematicLanding(root.current) : undefined), []);

  return (
    <div className="ek-film" data-ek-film ref={root}>
      <p className="ek-film-assist sr-only">Visual story: a work carrier follows a blue signal and stops at a disconnected joint. Pulse separates four connected information layers: demand, capacity, quality, and cost. The joint aligns and a permission shutter opens. Drive carries the work to its success condition. The result rises into the matching acceptance shape after verification. The final view shows the complete path. This is a visual expression of Ekarvo's proposed operating model.</p>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-ek-status></p>
      <div className="ek-film-stage">
        <div className="ek-world-fallback" aria-hidden="true">
          <picture className="ek-world-frame ek-world-frame--before">
            <source media="(max-width: 650px)" srcSet="/images/cinematic/film-mobile-0.webp" />
            <img src="/images/cinematic/film-desktop-0.webp" width={1440} height={804} alt="" fetchPriority="high" decoding="async" />
          </picture>
        </div>
        <div className="ek-world-camera" data-ek-camera aria-hidden="true"></div>
        <div className="ek-world-labels" aria-hidden="true">
          <svg className="ek-label-tethers">
            {[0, 1, 2, 3].map((i) => <line key={i} data-ek-tether={i} />)}
            {[0, 1].map((i) => <line key={`proof-${i}`} data-ek-proof-tether />)}
          </svg>
          {["Demand", "Capacity", "Quality", "Cost"].map((label) => <span key={label} className="ek-layer-label" data-ek-layer>{label}</span>)}
          {["Success condition", "Result"].map((label) => <span key={label} className="ek-layer-label ek-proof-label" data-ek-proof>{label}</span>)}
        </div>
        <div className="ek-film-atmosphere" aria-hidden="true"></div>
        <div className="ek-film-vignette" aria-hidden="true"></div>
        <nav className="ek-chapter-rail" aria-label="Landing story chapters">
          {chapters.map((chapter, index) => (
            <a key={chapter.id} href={`#${chapter.id}`} aria-label={`Go to ${chapter.marker.toLowerCase()}`} data-ek-rail={index}><span></span></a>
          ))}
        </nav>
        <div className="ek-film-story">
          {chapters.map((chapter, index) => {
            const evidence = readingEvidence[index]!;
            const Heading = index === 0 ? "h1" : "h2";
            return (
              <section
                key={chapter.id}
                className={`ek-chapter ek-chapter--${chapter.align} ek-chapter--${chapter.id}`}
                id={chapter.id}
                data-ek-chapter={index}
                aria-labelledby={`${chapter.id}-title`}
              >
                <div className="ek-chapter-copy">
                  <p className="ek-marker">{chapter.marker}</p>
                  <Heading id={`${chapter.id}-title`}>{chapter.title}</Heading>
                  <p className="ek-deck">{chapter.body}</p>
                  {chapter.id === "opening" && (
                    <div className="ek-chapter-actions">
                      <a className="ek-link-primary" href="#fracture">Follow the story <Icon icon={ArrowDown} /></a>
                      <Link className="ek-link-plain" href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
                      <button type="button" className="ek-link-plain ek-reading-return" data-ek-reading-return><Icon icon={ArrowLeft} /> Return to the film</button>
                    </div>
                  )}
                  {chapter.id === "outcome" && (
                    <div className="ek-chapter-actions">
                      <Link className="ek-link-primary" href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
                      <Link className="ek-link-plain" href="/sign-in">Log in <Icon icon={ArrowUpRight} /></Link>
                    </div>
                  )}
                </div>
                <aside className={`ek-reading-evidence ek-reading-evidence--${evidence.kind}`} aria-label="Independent market research">
                  <div className="ek-evidence-topline"><span>{evidence.eyebrow}</span><span className="ek-evidence-mark" aria-hidden="true">E</span></div>
                  {evidence.metrics ? (
                    <div className="ek-evidence-metrics">
                      {evidence.metrics.map((item) => <div key={item.label} className="ek-evidence-metric"><strong>{item.value}</strong><span>{item.label}</span></div>)}
                    </div>
                  ) : (
                    <div className="ek-evidence-feature">
                      <strong>{evidence.metric}</strong>
                      {evidence.metricLabel && <span className="ek-evidence-stat-label">{evidence.metricLabel}</span>}
                    </div>
                  )}
                  <p className="ek-evidence-copy">{evidence.text}</p>
                  <div className="ek-evidence-footer">
                    <p>{evidence.scope}</p>
                    <a href={evidence.url} target="_blank" rel="noopener noreferrer">{evidence.source}<Icon icon={ArrowUpRight} size={16} /></a>
                  </div>
                  <p className="ek-evidence-note">External research · Market context, not Ekarvo performance data</p>
                </aside>
                {chapter.id === "outcome" && (
                  <>
                    <picture className="ek-static-ending">
                      <source media="(max-width: 650px)" srcSet="/images/cinematic/film-mobile-6.webp" />
                      <img src="/images/cinematic/film-desktop-6.webp" width={1440} height={804} alt="The blue route passes through the aligned joint and reaches its outlined success condition." loading="lazy" decoding="async" />
                    </picture>
                    <div className="ek-film-credits">
                      <Link href={CONTACT_HREF}>Contact</Link>
                      <Link href="/landing/legal/privacy-policy">Privacy</Link>
                      <Link href="/landing/legal/terms-of-service">Terms</Link>
                      <a href="/downloads/ekarvo-overview.txt" download>Overview <Icon icon={ArrowDown} /></a>
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
        <div className="ek-film-transport">
          <button type="button" className="ek-reading-toggle" data-ek-reading aria-pressed="false">
            <span className="ek-reading-icon"><Icon icon={BookOpen} /></span>
            <span className="ek-reading-copy">
              <span className="ek-reading-title" data-ek-reading-title>Read the story</span>
              <span className="ek-reading-subtitle" data-ek-reading-subtitle>Chapter by chapter, at your pace</span>
            </span>
            <span className="ek-reading-arrow"><Icon icon={ArrowRight} size={16} /></span>
          </button>
          <span className="ek-scroll-hint">Scroll to move through the story</span>
          <div className="ek-film-steps">
            <button type="button" data-ek-prev aria-label="Previous chapter"><Icon icon={ArrowLeft} /></button>
            <button type="button" data-ek-next aria-label="Next chapter"><Icon icon={ArrowRight} /></button>
          </div>
        </div>
        <div className="ek-film-progress" aria-hidden="true"><span data-ek-progress></span></div>
      </div>
      <div className="ek-film-anchors" aria-hidden="true">
        {chapters.map((chapter, index) => <span key={chapter.id} data-ek-anchor-id={chapter.id} data-ek-anchor={index}></span>)}
      </div>
    </div>
  );
}

export function CinematicLanding() {
  return (
    <div className="ek-site cinematic-home">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="page-content">
        <Film />
      </main>
      <SiteFooter />
    </div>
  );
}

export default CinematicLanding;
