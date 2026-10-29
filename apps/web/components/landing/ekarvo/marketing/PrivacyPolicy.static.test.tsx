import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import PrivacyPolicy from "@/blocks/landing/PrivacyPolicy";
vi.mock("@/components/landing/LegalPageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));
describe("Privacy policy static request management", () => {
  it("renders authoritative policy and appended deletion instructions without a query provider", () => {
    const policy = {
      lastUpdated: "October 29, 2026",
      companyLegalName: "Synthetic Company",
      country: "Synthetic Country",
      siteName: "Synthetic Site",
      websiteUrl: "https://example.test",
      supportEmailAddress: "privacy@example.test",
    };
    const html = renderToString(<PrivacyPolicy privacyPolicy={policy} />);
    expect(html).toContain("Interpretation and Definitions");
    expect(html).toContain("Synthetic Company");
    expect(html).toContain("Children&#x27;s Privacy");
    expect(html).toContain("privacy@example.test");
    expect(html).toContain('id="delete"');
    expect(html).toContain(
      "Ask the person running this local site to remove the request file using its receipt ID.",
    );
    expect(html).toContain('disabled=""');
  });
});
