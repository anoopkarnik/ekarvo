import React, { type ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export interface MarketingShellProps {
  children: ReactNode;
  active?: string;
  cinematic?: boolean;
}

/** Server-compatible page frame; route and mobile menu state live in SiteHeader. */
export function MarketingShell({ children, active, cinematic = false }: MarketingShellProps) {
  return (
    <div className={`ek-site theme-ekarvo marketing-site${cinematic ? " dark cinematic-home" : ""}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader active={active} cinematic={cinematic} />
      <main id="main" className="page-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}
