import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecisionProof } from "./DecisionProof";
import PulsePage, { metadata } from "@/app/landing/products/operations-os/page";
vi.mock("next/navigation", () => ({
  usePathname: () => "/landing/products/operations-os",
}));
afterEach(cleanup);

describe("Pulse product flow", () => {
  it("keeps its initial explanation visible in server HTML before JavaScript", () => {
    const html = renderToStaticMarkup(<DecisionProof />);
    expect(html).toContain("A commitment starts to drift.");
    expect(html).toContain("opacity:1");
    expect(html).not.toContain("opacity:0");
  });
  it("wires authority, exception recovery, evidence and learning to the pure model", () => {
    render(<DecisionProof />);
    fireEvent.click(screen.getByRole("button", { name: "Execute" }));
    expect(
      screen.getByRole("button", { name: /Run example action/ }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Simulate" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Reassign eligible capacity/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Authorize" }));
    fireEvent.click(screen.getByRole("button", { name: /Approve this scope/ }));
    fireEvent.click(screen.getByRole("button", { name: "Execute" }));
    fireEvent.click(screen.getByRole("button", { name: /Raise an exception/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Paused.");
    screen.getByRole("button", { name: /Return for approval/ }).focus();
    fireEvent.click(
      screen.getByRole("button", { name: /Return for approval/ }),
    );
    expect(
      screen.getByRole("button", { name: /Approve this scope/ }),
    ).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: /Approve this scope/ }));
    fireEvent.click(screen.getByRole("button", { name: "Execute" }));
    fireEvent.click(screen.getByRole("button", { name: /Run example action/ }));
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Check example evidence/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "learning remains open",
    );
    fireEvent.click(screen.getByRole("button", { name: "Learn" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Capture the learning/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Example loop complete",
    );
    fireEvent.click(screen.getByRole("button", { name: /Start again/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Compare two possible responses.",
    );
  });
  it("renders the source hierarchy, metadata and exact public route links", () => {
    render(<PulsePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "See the whole operation.",
    );
    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("contentinfo")).toBeVisible();
    for (const name of ["Products", "Approach", "Platform", "Trust", "Company"])
      expect(screen.getAllByRole("link", { name }).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("navigation", { name: "Ekarvo Pulse page sections" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Discuss an operating decision/ }),
    ).toHaveAttribute("href", "/landing/contact?product=operations-os");
    expect(
      screen.getByRole("link", { name: /Explore the shared platform/ }),
    ).toHaveAttribute("href", "/landing/platform");
    expect(
      screen.getByRole("heading", {
        name: "Capacity is short. Which response holds the commitment?",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "See the work in context." }),
    ).toBeVisible();
    expect(metadata.title).toBe("Ekarvo Pulse — Ekarvo");
    expect(metadata.description).toBe(
      "Ekarvo Pulse. A connected operating picture for enterprise operations, from demand and capacity to quality and economics.",
    );
    expect(metadata.alternates?.canonical).toContain(
      "/landing/products/operations-os",
    );
  });
});
