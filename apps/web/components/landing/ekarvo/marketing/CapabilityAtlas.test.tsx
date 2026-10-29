import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { CapabilityAtlas } from "./CapabilityAtlas";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("capability atlas", () => {
  it("selects Pulse, a group and a module with pressed state and live detail", () => {
    render(<CapabilityAtlas />);
    expect(
      screen.getByRole("button", {
        name: /Operating Intelligence Ekarvo Pulse/i,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /OPERATE 4/ }));
    expect(screen.getByRole("button", { name: /OPERATE 4/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Quality" }));
    expect(screen.getByRole("button", { name: "Quality" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const detail = screen.getByRole("region", { name: "Selected capability" });
    expect(detail).toHaveAttribute("aria-live", "polite");
    expect(
      within(detail).getByRole("heading", { name: "Quality" }),
    ).toBeVisible();
    expect(
      within(detail).getByText(
        "Connect quality signals to the work and its owner.",
      ),
    ).toBeVisible();
    expect(within(detail).getByRole("link")).toHaveAttribute(
      "href",
      "/landing/products/operations-os",
    );
  });
  it("switches product and resets the selected group and module", () => {
    render(<CapabilityAtlas />);
    fireEvent.click(screen.getByRole("button", { name: /OPERATE 4/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: /Autonomous Execution Ekarvo Drive/i,
      }),
    );
    expect(screen.getByRole("button", { name: /DESIGN 3/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Studio" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/landing/products/autonomous-execution",
    );
  });
  it("accepts an initial selection", () => {
    render(
      <CapabilityAtlas
        initialSelection={{
          product: "drive",
          group: "assure",
          module: "Observe",
        }}
      />,
    );
    expect(screen.getByRole("button", { name: "Observe" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("selects and focuses matching direct hash entry and later hash changes", () => {
    window.history.replaceState(
      null,
      "",
      "/landing/products/operations-os#pulse-plan",
    );
    render(<CapabilityAtlas initialSelection={{ product: "drive" }} />);
    expect(screen.getByRole("button", { name: /PLAN 4/ })).toHaveFocus();
    window.history.replaceState(null, "", "#drive-assure");
    fireEvent(window, new HashChangeEvent("hashchange"));
    expect(screen.getByRole("button", { name: /ASSURE 2/ })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Verify" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("ignores invalid hashes and exposes static content before JavaScript", () => {
    window.history.replaceState(null, "", "#pulse-missing");
    render(<CapabilityAtlas />);
    expect(screen.getByRole("button", { name: "Forecast" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const html = renderToStaticMarkup(<CapabilityAtlas />);
    expect(html).toContain(
      "Compare likely work volume with available capacity.",
    );
    expect(html).toContain("/landing/products/operations-os");
  });
});
