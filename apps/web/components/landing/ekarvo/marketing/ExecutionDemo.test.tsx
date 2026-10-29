import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExecutionDemo } from "./ExecutionDemo";
import DrivePage, {
  metadata,
} from "@/app/landing/products/autonomous-execution/page";
vi.mock("next/navigation", () => ({
  usePathname: () => "/landing/products/autonomous-execution",
}));
vi.mock("framer-motion", () => ({ useReducedMotion: () => false }));
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));
const tick = () =>
  act(() => {
    vi.advanceTimersByTime(1000);
  });
function run() {
  click("Confirm example contract");
  click("Run simulation");
}
function approval() {
  run();
  tick();
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("Drive execution island", () => {
  it("keeps useful static narrative and disabled controls before hydration", () => {
    const html = renderToStaticMarkup(<ExecutionDemo compact />);
    expect(html).toContain(
      "Define a reconciled exception report for 20 synthetic records.",
    );
    expect(html).toContain("disabled");
    expect(html).not.toContain("opacity:0");
    expect(html).toContain("/downloads/outcome-contract.txt");
  });
  it("shows pending feedback, pauses and cancels stale work on rapid reset", () => {
    render(<ExecutionDemo />);
    run();
    expect(
      screen.getByRole("button", { name: "Classifying records…" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("region", { name: "Synthetic report execution" }),
    ).toHaveAttribute("aria-busy", "true");
    click("Pause simulation");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent("paused");
    click("Resume simulation");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent("needs your approval");
    click("Approve report creation");
    expect(
      screen.getByRole("button", { name: "Verifying evidence…" }),
    ).toBeDisabled();
    click("Reset simulation");
    run();
    click("Reset simulation");
    tick();
    tick();
    expect(screen.getByRole("status")).toHaveTextContent("Define a reconciled");
    expect(
      screen.getByRole("button", { name: "Confirm example contract" }),
    ).toBeEnabled();
    expect(screen.queryByText("Verified", { exact: true })).toBeNull();
  });
  it("handles rejection, changed scope, blocked evidence, retry and download", () => {
    const create = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:evidence");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    render(<ExecutionDemo />);
    approval();
    click("Reject");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No report was written",
    );
    click("Reset simulation");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Simulate missing receipt" }),
    );
    approval();
    click("Approve report creation");
    click("Raise an exception");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent("needs your approval");
    click("Approve report creation");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent("receipt is missing");
    click("Download evidence");
    expect(create).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    click("Recover simulated receipt");
    tick();
    expect(screen.getByRole("status")).toHaveTextContent(
      "20 records classified; 18 matched; 2 exceptions documented.",
    );
    expect(revoke).toHaveBeenCalledWith("blob:evidence");
  });
  it("keeps the same live status node mounted across state and reset updates", () => {
    render(<ExecutionDemo compact />);
    const status = screen.getByRole("status");
    const unchanged = (text: string) => {
      expect(screen.getByRole("status")).toBe(status);
      expect(status).toHaveTextContent(text);
    };
    click("Confirm example contract");
    unchanged("contract is complete");
    click("Run simulation");
    unchanged("Classifying 20 records");
    tick();
    unchanged("needs your approval");
    click("Approve report creation");
    unchanged("Checking classification");
    tick();
    unchanged("20 records classified");
    click("Reset simulation");
    unchanged("Define a reconciled");
  });
  it("cancels all pending timers when unmounted", () => {
    const { unmount } = render(<ExecutionDemo compact />);
    run();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("renders source Drive hierarchy, mapped links, metadata and full banner", () => {
    render(<DrivePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Set the result. Control the work.",
    );
    for (const name of ["Products", "Approach", "Platform", "Trust", "Company"])
      expect(screen.getAllByRole("link", { name }).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: "A defined result, with proof behind it.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "From defined work to verified result.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Inside an Outcome Contract" }),
    ).toHaveAttribute("href", "/landing/approach#outcome-contract");
    expect(
      screen
        .getAllByRole("link", { name: "Discuss a workflow" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/landing/contact?product=autonomous-execution",
        ),
    ).toBe(true);
    expect(document.querySelector(".film-closing-art img")).toHaveAttribute(
      "src",
      "/images/cinematic/study-evidence-dark.webp",
    );
    expect(metadata.title).toBe("Ekarvo Drive — Ekarvo");
    expect(metadata.description).toBe(
      "Ekarvo Drive. Define an outcome, set the authority, and connect completion to evidence.",
    );
    expect(metadata.alternates?.canonical).toContain(
      "/landing/products/autonomous-execution",
    );
  });
});
