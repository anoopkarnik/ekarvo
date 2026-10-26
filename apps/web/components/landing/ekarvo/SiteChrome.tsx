"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowUpRight, Menu, type LucideIcon } from "lucide-react";
import { CONTACT_HREF, headerNav } from "./film/content";

// Header and footer of the Website marketing site, shared by /landing, the legal pages and auth.
// Styles live in app/landing/ekarvo.css (.ek-site); the landing film recolors them in cinematic.css.

export const Icon = ({ icon: Glyph, size = 20 }: { icon: LucideIcon; size?: 16 | 20 }) => (
  <Glyph size={size} strokeWidth={1.75} className={`site-icon site-icon--${size}`} aria-hidden="true" />
);

/** Chapter anchors scroll the film on /landing and open it at that chapter from anywhere else. */
function useChapterHref() {
  const onLanding = usePathname() === "/landing";
  return (hash: string) => (onLanding ? hash : `/landing${hash}`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const chapter = useChapterHref();
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menu.current?.removeAttribute("open");
  const showLogin = pathname !== "/sign-in";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={chapter("#opening")} className="wordmark" aria-label="Ekarvo home">EKARVO</Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {headerNav.map(([label, href]) => <Link key={href} href={chapter(href)}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          {showLogin && <Link className="header-login" href="/sign-in">Log in</Link>}
          <Link className="button header-cta" href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
        </div>
        <details
          className="mobile-menu"
          ref={menu}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !menu.current?.open) return;
            closeMenu();
            menu.current.querySelector("summary")?.focus();
          }}
        >
          <summary aria-label="Open navigation">Menu <Icon icon={Menu} /></summary>
          <nav aria-label="Mobile navigation" onClick={(event) => { if ((event.target as Element).closest("a")) closeMenu(); }}>
            {headerNav.map(([label, href]) => <Link key={href} href={chapter(href)}>{label}</Link>)}
            {showLogin && <Link href="/sign-in">Log in</Link>}
            <Link href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const chapter = useChapterHref();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href={chapter("#opening")} className="wordmark">EKARVO</Link>
            <p className="footer-signature">See it through.</p>
            <p>The Autonomous Execution Company.</p>
          </div>
          <div>
            <p className="footer-label">Products</p>
            <Link href={chapter("#pulse")}>Ekarvo Pulse</Link>
            <Link href={chapter("#drive")}>Ekarvo Drive</Link>
          </div>
          <div>
            <p className="footer-label">Explore</p>
            <Link href={chapter("#fracture")}>The story</Link>
            <Link href={chapter("#authority")}>Trust & control</Link>
            <Link href={chapter("#evidence")}>Proof of completion</Link>
          </div>
          <div>
            <p className="footer-label">Start a conversation</p>
            <Link href={CONTACT_HREF}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
            <Link href="/sign-in">Log in</Link>
            <a href="/downloads/ekarvo-overview.txt" download>Download overview <Icon icon={ArrowDown} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Ekarvo. From the first decision to evidence of completion.
            <br />
            The Autonomous Execution Company.
          </p>
          <div>
            <Link href="/landing/legal/privacy-policy">Privacy</Link>
            <Link href="/landing/legal/terms-of-service">Terms</Link>
            <Link href="/landing/legal/cancellation-refund-policies">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
