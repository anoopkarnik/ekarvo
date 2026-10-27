import "./ekarvo.css";
import "./marketing.css";
import type { ReactNode } from "react";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return <div className="relative w-full">{children}</div>;
}
