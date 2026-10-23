import "@/app/landing/ekarvo.css";
import type { ReactElement, ReactNode } from "react";
import { TopNav } from "@/components/landing/ekarvo/components/TopNav";

// Auth pages share the landing page's look: always-dark EKARVO tokens and the same top nav.
export default function AuthGroupLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <div className="ekarvo-site theme-ekarvo dark relative isolate min-h-dvh bg-background text-foreground pt-16 [--auth-top-offset:4rem]">
      <TopNav />
      {children}
    </div>
  );
}
