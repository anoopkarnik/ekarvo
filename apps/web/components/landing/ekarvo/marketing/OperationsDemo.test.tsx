import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationsDemo } from "./OperationsDemo";
import DemoPage, { metadata } from "@/app/landing/demo/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/landing/demo" }));
const click = (name: string | RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));
function metric(label: string) {
  return screen.getByText(label).closest(".metric")!;
}
afterEach(cleanup);

describe("Pulse capacity scenario", () => {
  it("renders source initial values and useful static fallback before hydration", () => {
    const html = renderToStaticMarkup(<OperationsDemo />);
    expect(html).toContain("Product concept · Synthetic data");
    expect(html).toContain("1,200");
    expect(html).toContain("960");
    expect(html).toContain("240");
    expect(html).toContain("disabled");
    expect(html).toContain("These are assumptions, not verified improvements.");
    expect(html).not.toContain("opacity:0");
    render(<OperationsDemo />);
    expect(metric("Capacity / day")).toHaveTextContent("960");
    expect(metric("Unit shortfall")).toHaveTextContent("240");
    expect(screen.getByText("Capacity risk")).toBeVisible();
  });

  it("records a resource move with donor consequences but keeps verification open", () => {
    render(<OperationsDemo />);
    click("Compare scenarios");
    expect(
      screen.getByRole("button", { name: /Reallocate capacity/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/0 units remain uncovered/)).toBeVisible();
    expect(
      screen.getByText(
        /Donor team: 300 units of spare capacity before the move; 60 after/,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Reallocate capacity/ }),
    ).toHaveTextContent("₹0 incremental spend");
    click("Approve simulated plan");
    expect(
      screen.getByRole("heading", {
        name: "Decision recorded. Evidence next.",
      }),
    ).toHaveFocus();
    expect(screen.getByText("Awaiting measurement")).toBeVisible();
    expect(
      screen.getByText(
        /Reallocate two qualified resources. Donor capacity remains 60/,
      ),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Results still require measurement",
    );
    expect(
      screen.getByText(/Approval alone does not establish improvement/),
    ).toBeVisible();
    click("Return to overview");
    expect(metric("Capacity / day")).toHaveTextContent("1200");
    expect(metric("Unit shortfall")).toHaveTextContent("0");
    expect(screen.getByText("Plan approved")).toBeVisible();
  });

  it("shows overtime cost, partial capacity and no donor impact without claiming completion", () => {
    render(<OperationsDemo />);
    click("Scenarios");
    click(/Approve overtime/);
    expect(
      screen.getByRole("button", { name: /Approve overtime/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /Approve overtime/ }),
    ).toHaveTextContent("180 units / day · ₹3,600 incremental spend");
    expect(screen.getByText(/60 units remain uncovered/)).toBeVisible();
    expect(
      screen.getByText(/No donor-team impact. Assumes ₹600 per overtime hour/),
    ).toBeVisible();
    click("Approve simulated plan");
    expect(
      screen.getByText(
        "Add six overtime hours. A 60-unit gap still needs an owner.",
      ),
    ).toBeVisible();
    expect(screen.getByText("Awaiting measurement")).toBeVisible();
    expect(screen.queryByText("Verified", { exact: true })).toBeNull();
    click("Return to overview");
    expect(metric("Capacity / day")).toHaveTextContent("1140");
    expect(metric("Unit shortfall")).toHaveTextContent("60");
  });

  it("clears approval when the choice changes and resets every output to source defaults", () => {
    render(<OperationsDemo />);
    click("Compare scenarios");
    click(/Approve overtime/);
    click("Approve simulated plan");
    click("Scenarios");
    click(/Reallocate capacity/);
    click("Evidence");
    expect(
      screen.getByRole("heading", { name: "What this model assumes." }),
    ).toBeVisible();
    expect(screen.getByText("Scenario model", { exact: true })).toBeVisible();
    click("Scenarios");
    click(/Approve overtime/);
    click("Approve simulated plan");
    click("Reset demo");
    expect(screen.getByRole("button", { name: /^Overview$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(metric("Work units due")).toHaveTextContent("1,200");
    expect(metric("Capacity / day")).toHaveTextContent("960");
    expect(metric("Unit shortfall")).toHaveTextContent("240");
    expect(screen.getByText("Capacity risk")).toBeVisible();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    click("Scenarios");
    expect(
      screen.getByRole("button", { name: /Reallocate capacity/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/0 units remain uncovered/)).toBeVisible();
    click("Evidence");
    expect(
      screen.getByRole("heading", { name: "What this model assumes." }),
    ).toBeVisible();
  });
});

describe("Combined synthetic demo route", () => {
  it("renders the exact source hierarchy, anchors, synthetic notice, metadata and closing art", () => {
    render(<DemoPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test a decision and inspect its evidence.",
    );
    expect(
      screen.getByText(
        "Two local demonstrations make the proposed products concrete. All records, costs and results are synthetic. No live business systems are connected.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Close a capacity gap. See the trade-offs.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "From defined work to verified completion.",
      }),
    ).toBeVisible();
    for (const [name, hash] of [
      ["Ekarvo Pulse", "operations"],
      ["Ekarvo Drive", "execution"],
    ]) {
      expect(
        within(document.querySelector(".page-hero")!).getByRole("link", {
          name,
        }),
      ).toHaveAttribute("href", `#${hash}`);
      expect(document.getElementById(hash!)).not.toBeNull();
    }
    expect(
      screen.getByRole("region", { name: "Synthetic report execution" }),
    ).toBeVisible();
    expect(document.querySelector(".film-closing-art img")).toHaveAttribute(
      "src",
      "/images/cinematic/study-evidence-dark.webp",
    );
    expect(metadata.title).toBe("Interactive product demos — Ekarvo");
    expect(metadata.description).toBe(
      "Ekarvo connects operational insight to accountable outcomes through Ekarvo Pulse and Ekarvo Drive.",
    );
    expect(metadata.alternates?.canonical).toContain("/landing/demo");
  });
});
