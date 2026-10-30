"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import { Icon } from "./Icon";
import { MARKETING_NAV, marketingHref } from "./navigation";

export interface SiteHeaderProps {
  active?: string;
  cinematic?: boolean;
}

/** The footer shares the header's existing sign-in omission rule. */
export function MarketingLogin({ className }: { className?: string }) {
  return usePathname() === "/sign-in" ? null : <Link className={className} href="/sign-in">Log in</Link>;
}

export function SiteHeader({ active, cinematic = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menu.current?.removeAttribute("open");
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menu.current?.open) return;
      menu.current.removeAttribute("open");
      menu.current.querySelector("summary")?.focus();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);
  const current = (label: string, href: string) => (
    active ? active === label || active === href : pathname === href || pathname?.startsWith(`${href}/`)
  ) ? "page" as const : undefined;

  return (
    <header className={`site-header${cinematic ? " site-header--cinematic" : ""}`}>
      <div className="container header-inner">
        <Link href={marketingHref("/")} className="wordmark" aria-label="Ekarvo home">EKARVO</Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {MARKETING_NAV.map(([label, href]) => <Link key={href} href={href} aria-current={current(label, href)}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <MarketingLogin className="header-login" />
          <Link className="button header-cta" href={marketingHref("/contact")}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
        </div>
        <details
          className="mobile-menu"
          ref={menu}
        >
          <summary>Menu <Icon icon={Menu} /></summary>
          <nav aria-label="Mobile navigation" onClick={(event) => { if ((event.target as Element).closest("a")) closeMenu(); }}>
            {MARKETING_NAV.map(([label, href]) => <Link key={href} href={href} aria-current={current(label, href)}>{label}</Link>)}
            <MarketingLogin />
            <Link href={marketingHref("/contact")}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
