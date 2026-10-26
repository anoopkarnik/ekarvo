import "@/app/landing/ekarvo.css";
import type { ReactElement, ReactNode } from "react";
import { SiteHeader } from "@/components/landing/ekarvo/SiteChrome";

// Auth pages share the landing film's look: always-dark EKARVO tokens and the site header.
// The header is sticky (in flow), so AuthLayout subtracts its height to stay one screen tall.
export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <div className="ek-site theme-ekarvo dark relative isolate [--auth-top-offset:var(--header-height)]">
      <SiteHeader />
      {children}
    </div>
  );
}
