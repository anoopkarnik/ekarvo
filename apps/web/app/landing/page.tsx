import type { Metadata } from "next";
import LandingPage from "@/blocks/landing/LandingPage";
import { createSeoMetadata } from "@/lib/seo";
import "./cinematic.css";

export const metadata: Metadata = createSeoMetadata({
  title: "Make ambition operational.",
  siteName: "EKARVO",
  description: "Ekarvo is building a path from operational intelligence to permitted action and evidence of completion.",
  pathname: "/landing",
});

export default function Page() {
  return <LandingPage />;
}
