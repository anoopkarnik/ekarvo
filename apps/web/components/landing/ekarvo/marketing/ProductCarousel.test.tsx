import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCarousel } from "./ProductCarousel";
import ProductsPage, { metadata } from "@/app/landing/products/page";
import { PRODUCTS } from "./data";

vi.mock("./SpatialScene", () => ({
  SpatialScene: ({ label }: { label: string }) => <figure aria-label={label} />,
}));

let reduced = false;
let motionChange: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, cb: () => void) => {
        motionChange = cb;
      },
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  reduced = false;
  motionChange = undefined;
});

function setup() {
  const view = render(<ProductCarousel products={PRODUCTS} />);
  const track = screen.getByRole("group", { name: "Product views" });
  Object.defineProperty(track, "clientWidth", {
    configurable: true,
    value: 600,
  });
  return {
    ...view,
    track,
    back: screen.getByRole("button", { name: "Previous product" }),
    next: screen.getByRole("button", { name: "Next product" }),
  };
}
function selected(name: string, index: number) {
  expect(screen.getByRole("button", { name })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    `${name}, ${index + 1} of 2`,
  );
}

describe("Products carousel", () => {
  it("starts on Pulse with bounded navigation and inactive links inert", () => {
    const { container, back, next } = setup();
    selected("Ekarvo Pulse", 0);
    expect(
      screen.getByRole("heading", { name: "Ekarvo Pulse", level: 2 }),
    ).toBeInTheDocument();
    expect(back).toBeDisabled();
    expect(next).toBeEnabled();
    const slides = container.querySelectorAll("[data-product-slide]");
    expect(slides[0]).not.toHaveAttribute("inert");
    expect(slides[1]).toHaveAttribute("inert");
    expect(within(slides[0] as HTMLElement).getByRole("link")).toHaveAttribute(
      "href",
      "/landing/products/operations-os",
    );
    expect(slides[1]!.querySelector("a")).toHaveAttribute("tabindex", "-1");
  });
  it("selects tabs, updates status and enforces the last boundary", () => {
    const { container, back, next } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Ekarvo Drive" }));
    selected("Ekarvo Drive", 1);
    expect(next).toBeDisabled();
    expect(back).toBeEnabled();
    expect(
      container.querySelectorAll("[data-product-slide]")[0],
    ).toHaveAttribute("inert");
    expect(
      screen.getByRole("link", { name: "Explore Ekarvo Drive" }),
    ).toHaveAttribute("href", "/landing/products/autonomous-execution");
    expect(
      screen.getByRole("link", { name: "Explore Ekarvo Drive" }),
    ).toHaveAttribute("tabindex", "0");
    act(() => vi.advanceTimersByTime(600));
    expect(
      screen.getByRole("group", { name: "Product views" }).scrollLeft,
    ).toBe(600);
  });
  it("handles arrow keys and clamps at either end without moving keyboard focus", () => {
    const { track } = setup();
    track.focus();
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    selected("Ekarvo Pulse", 0);
    fireEvent.keyDown(track, { key: "ArrowRight" });
    selected("Ekarvo Drive", 1);
    fireEvent.keyDown(track, { key: "ArrowRight" });
    selected("Ekarvo Drive", 1);
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    selected("Ekarvo Pulse", 0);
    expect(track).toHaveFocus();
  });
  it("replaces pending animation on rapid opposite commands and ignores stale scrollend", () => {
    const { track, back, next } = setup();
    fireEvent.click(next);
    act(() => vi.advanceTimersByTime(80));
    expect(track.scrollLeft).toBeGreaterThan(0);
    fireEvent.click(back);
    fireEvent.scroll(track);
    fireEvent(track, new Event("scrollend"));
    selected("Ekarvo Pulse", 0);
    act(() => vi.advanceTimersByTime(1000));
    expect(track.scrollLeft).toBe(0);
    selected("Ekarvo Pulse", 0);
    expect(back).toBeDisabled();
    expect(next).toBeEnabled();
    fireEvent.click(next);
    fireEvent.click(back);
    fireEvent.click(next);
    act(() => vi.advanceTimersByTime(1000));
    expect(track.scrollLeft).toBe(600);
    selected("Ekarvo Drive", 1);
    expect(next).toBeDisabled();
  });
  it("uses immediate movement for reduced motion, including preference changes mid-animation", () => {
    reduced = true;
    const { track, next, back } = setup();
    fireEvent.click(next);
    expect(track.scrollLeft).toBe(600);
    reduced = false;
    fireEvent.click(back);
    act(() => vi.advanceTimersByTime(50));
    expect(track.scrollLeft).toBeGreaterThan(0);
    expect(track.scrollLeft).toBeLessThan(600);
    reduced = true;
    act(() => motionChange?.());
    expect(track.scrollLeft).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(track.scrollLeft).toBe(0);
  });
  it("selects a directly scrolled slide and retains selection after resize", () => {
    const { track, next } = setup();
    fireEvent.pointerDown(track);
    track.scrollLeft = 600;
    fireEvent.scroll(track);
    act(() => vi.advanceTimersByTime(150));
    selected("Ekarvo Drive", 1);
    expect(next).toBeDisabled();
    Object.defineProperty(track, "clientWidth", {
      configurable: true,
      value: 400,
    });
    fireEvent(window, new Event("resize"));
    expect(track.scrollLeft).toBe(400);
  });

  it("moves focus to the track when a keyboard command deactivates its link", () => {
    const { track } = setup();
    const link = screen.getByRole("link", { name: "Explore Ekarvo Pulse" });
    link.focus();
    fireEvent.keyDown(link, { key: "ArrowRight" });
    selected("Ekarvo Drive", 1);
    expect(track).toHaveFocus();
  });

  it("keeps both product links available in server-rendered content", () => {
    const markup = renderToStaticMarkup(
      <ProductCarousel products={PRODUCTS} />,
    );
    expect(markup).not.toContain("inert");
    expect(markup).not.toContain('tabindex="-1"');
    expect(markup).toContain("Explore Ekarvo Pulse");
    expect(markup).toContain("Explore Ekarvo Drive");
  });
});

describe("Products overview route", () => {
  it("renders source masthead, map, principles, CTA, active Products navigation and mapped links", () => {
    const { container } = render(<ProductsPage />);
    const main = within(screen.getByRole("main"));
    expect(main.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(main.getByRole("heading", { level: 1 })).toHaveTextContent(
      "See the work.Carry it forward.",
    );
    expect(main.getByText("THE EKARVO PRODUCT FAMILY")).toBeInTheDocument();
    expect(
      main.getByRole("region", { name: "Connected product capabilities" }),
    ).toBeInTheDocument();
    for (const heading of [
      "Connect the operation.",
      "Coordinate execution.",
      "Find the first step.",
      "Which workflow should change first?",
    ])
      expect(main.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).getByRole("link", { name: "Products" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      main.getByRole("link", { name: "Explore the approach" }),
    ).toHaveAttribute("href", "/landing/products/autonomous-execution");
    expect(
      main.getByRole("link", { name: "Discuss a workflow" }),
    ).toHaveAttribute("href", "/landing/contact");
    expect(container.querySelector(".film-closing-art img")).toHaveAttribute(
      "src",
      "/images/cinematic/study-evidence-dark.webp",
    );
  });
  it("sets the source title, description and mapped canonical", () => {
    expect(metadata.title).toBe("Products — Ekarvo");
    expect(metadata.description).toBe(
      "Meet Ekarvo Pulse and Ekarvo Drive. Two connected product directions for better enterprise operations.",
    );
    expect(metadata.alternates?.canonical).toMatch(/\/landing\/products$/);
  });
});
