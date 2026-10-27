import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Icon } from "./marketing/Icon";
import { MarketingLogin } from "./marketing/SiteHeader";
import { marketingHref } from "./marketing/navigation";

export { Icon } from "./marketing/Icon";
export { SiteHeader } from "./marketing/SiteHeader";

// Shared by marketing, legal and auth surfaces. Only route/menu state needs a client boundary.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href={marketingHref("/")} className="wordmark">EKARVO</Link>
            <p className="footer-signature">See it through.</p>
            <p>The Autonomous Execution Company.</p>
          </div>
          <div>
            <p className="footer-label">Products</p>
            <Link href={marketingHref("/products/operations-os")}>Ekarvo Pulse</Link>
            <Link href={marketingHref("/products/autonomous-execution")}>Ekarvo Drive</Link>
            <Link href={marketingHref("/platform")}>The shared platform</Link>
          </div>
          <div>
            <p className="footer-label">Explore</p>
            <Link href={marketingHref("/approach")}>Our approach</Link>
            <Link href={marketingHref("/platform")}>Platform architecture</Link>
            <Link href={marketingHref("/trust")}>Trust & control</Link>
            <Link href={marketingHref("/company")}>Company</Link>
          </div>
          <div>
            <p className="footer-label">Start a conversation</p>
            <Link href={marketingHref("/contact")}>Discuss a workflow <Icon icon={ArrowUpRight} /></Link>
            <MarketingLogin />
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
