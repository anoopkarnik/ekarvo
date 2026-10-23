import type { Metadata } from "next";
import LandingPage from "@/blocks/landing/LandingPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Autonomous Enterprise Operations",
  siteName: "EKARVO",
  description: "EKARVO connects operating intelligence (Pulse) with autonomous execution (Drive) so enterprises can understand operations, decide, execute across systems, and verify every outcome.",
  pathname: "/landing",
});

export default function Page() {
  return <LandingPage />;
}
