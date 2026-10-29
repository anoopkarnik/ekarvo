import React from "react";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render as renderReact, screen, waitFor, type RenderOptions } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpatialScene } from "./SpatialScene";
import { ProductMap } from "./ProductMap";
import { StoryPlate } from "./StoryPlate";
import { MARKETING_ASSETS } from "./data";

const graphics = vi.hoisted(() => ({ fail: false, updatesFail: false, delay: undefined as Promise<void> | undefined, started: vi.fn(), dispose: vi.fn() }));
const render = (ui: React.ReactNode, options?: RenderOptions) => renderReact(ui, { wrapper: ({ children }) => <div className="ek-site marketing-site">{children}</div>, ...options });
// The GPU is the external boundary. Keep component visibility, preference, and lifecycle real.
vi.mock("./sceneRuntime", () => ({
  createStudyWorld: async (host: HTMLElement) => {
    graphics.started();
    await graphics.delay;
    if (graphics.fail) throw new Error("WebGL context unavailable");
    const canvas = document.createElement("canvas");
    host.appendChild(canvas);
    return {
      update: () => { if (graphics.updatesFail) throw new Error("Context lost during render"); },
      resize: () => {},
      dispose: () => { graphics.dispose(); canvas.remove(); },
    };
  },
}));

let stylesheet: HTMLStyleElement;
let motion: MediaQueryList;
let intersect: (visible: boolean) => void;
beforeEach(() => {
  stylesheet = document.createElement("style");
  stylesheet.textContent = readFileSync(new NodeURL("../../../../app/landing/marketing.css", import.meta.url), "utf8");
  document.head.appendChild(stylesheet);
  graphics.delay = undefined;
  graphics.started.mockClear();
  graphics.fail = false;
  graphics.updatesFail = false;
  graphics.dispose.mockClear();
  const target = new EventTarget();
  motion = Object.assign(target, { matches: false, media: "(prefers-reduced-motion: reduce)", onchange: null }) as MediaQueryList;
  vi.stubGlobal("matchMedia", () => motion);
  vi.stubGlobal("WebGL2RenderingContext", class {});
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      if (target.tagName === "FIGURE") intersect = (visible) => this.callback([{ isIntersecting: visible, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => { cleanup(); stylesheet.remove(); vi.unstubAllGlobals(); });

const scenes = [
  ["operations", "dark"], ["execution", "dark"], ["evidence", "paper"],
  ["platform", "paper"], ["trust", "paper"],
] as const;

function expectPoster(figure: HTMLElement) {
  expect(figure.querySelector("picture")).toBeInTheDocument();
  expect(figure).not.toHaveClass("study-ready");
  expect(figure.querySelector("picture")).not.toHaveAttribute("hidden");
  expect(getComputedStyle(figure.querySelector("picture")!).visibility).not.toBe("hidden");
}

describe("static-first scenes", () => {
  it.each(scenes)("server-renders %s artwork, dimensions, and copy without a canvas", (mode, theme) => {
    const html = renderToStaticMarkup(<SpatialScene mode={mode} label={`A connected ${mode} signal reaches a verified result.`} />);
    const root = document.createElement("div");
    root.innerHTML = html;
    const figure = root.querySelector("figure")!;
    expect(figure).toHaveAttribute("aria-label", `A connected ${mode} signal reaches a verified result.`);
    const img = figure.querySelector("picture img")!;
    const mobile = figure.querySelector("picture source")!;
    expect(img).toHaveAttribute("src", `/images/cinematic/study-${mode}-${theme}.webp`);
    expect(img).toHaveAttribute("width", "1440");
    expect(img).toHaveAttribute("height", "640");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(mobile).toHaveAttribute("srcset", `/images/cinematic/study-${mode}-${theme}-mobile.webp`);
    expect(mobile).toHaveAttribute("width", "390");
    expect(mobile).toHaveAttribute("height", "360");
    expect(figure.querySelector("canvas")).toBeNull();
    expect(figure.querySelector("figcaption")?.textContent?.length).toBeGreaterThan(20);
    for (const path of [img.getAttribute("src"), mobile.getAttribute("srcset")]) {
      expect(MARKETING_ASSETS.some((asset) => asset.path === path)).toBe(true);
    }
  });

  it.each(["operations", "execution"] as const)("uses the paper variant for %s and honors eager loading", (mode) => {
    render(<SpatialScene mode={mode} surface="paper" eager label="A connected product on paper." />);
    const figure = screen.getByRole("figure", { name: "A connected product on paper." });
    expect(figure.querySelector("img")).toHaveAttribute("src", `/images/cinematic/study-${mode}-paper.webp`);
    expect(figure.querySelector("img")).toHaveAttribute("loading", "eager");
    expect(figure.querySelector("img")).toHaveAttribute("fetchpriority", "high");
  });

  it("keeps the poster for reduced motion without creating graphics", async () => {
    Object.assign(motion, { matches: true });
    render(<SpatialScene mode="trust" label="Authority precedes action." />);
    await act(async () => intersect?.(true));
    const figure = screen.getByRole("figure", { name: "Authority precedes action." });
    expectPoster(figure);
    expect(figure.querySelector("canvas")).toBeNull();
    expect(screen.getByText("Permission precedes action")).toBeVisible();
  });

  it("initializes only in view, then restores the poster when reduced motion changes", async () => {
    render(<SpatialScene mode="operations" label="Four inputs form one operating picture." />);
    const figure = screen.getByRole("figure");
    expect(figure.querySelector("canvas")).toBeNull();
    await act(async () => intersect(true));
    await waitFor(() => expect(figure).toHaveClass("study-ready"));
    expect(figure.querySelector("canvas")).toBeInTheDocument();
    await act(async () => {
      Object.assign(motion, { matches: true });
      motion.dispatchEvent(new Event("change"));
    });
    expectPoster(figure);
    expect(figure.querySelector("canvas")).toBeNull();
    expect(graphics.dispose).toHaveBeenCalledTimes(1);
  });

  it("restores the poster if a queued frame sees reduced motion before the preference event", async () => {
    render(<SpatialScene mode="operations" label="Four inputs form one operating picture." />);
    const figure = screen.getByRole("figure");
    await act(async () => intersect(true));
    await waitFor(() => expect(figure).toHaveClass("study-ready"));
    // A browser may update matches before delivering MediaQueryList's change event.
    Object.assign(motion, { matches: true });
    await act(async () => { window.dispatchEvent(new Event("scroll")); });
    await waitFor(() => expectPoster(figure));
    expect(figure.querySelector("canvas")).toBeNull();
    expect(screen.getByText("Four inputs. One operating picture.")).toBeVisible();
  });

  it("retains static artwork and product links when graphics are unsupported", async () => {
    vi.stubGlobal("WebGLRenderingContext", undefined);
    vi.stubGlobal("WebGL2RenderingContext", undefined);
    render(<><SpatialScene mode="execution" label="Work reaches its acceptance condition." /><ProductMap /></>);
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    const figure = screen.getByRole("figure");
    expectPoster(figure);
    expect(figure.querySelector("canvas")).toBeNull();
    expect(screen.getByRole("link", { name: "Explore controlled execution" })).toBeVisible();
  });

  it("resumes enhancement after motion preferences change while graphics are loading", async () => {
    let release!: () => void;
    graphics.delay = new Promise<void>((resolve) => { release = resolve; });
    render(<SpatialScene mode="trust" label="Authority precedes action." />);
    const figure = screen.getByRole("figure");
    await act(async () => intersect(true));
    await waitFor(() => expect(graphics.started).toHaveBeenCalled());
    await act(async () => {
      Object.assign(motion, { matches: true });
      motion.dispatchEvent(new Event("change"));
      Object.assign(motion, { matches: false });
      motion.dispatchEvent(new Event("change"));
    });
    await act(async () => release());
    await waitFor(() => expect(figure).toHaveClass("study-ready"));
    expect(figure.querySelectorAll("canvas")).toHaveLength(1);
  });

  it("does not attach late graphics after the scene unmounts", async () => {
    let release!: () => void;
    graphics.delay = new Promise<void>((resolve) => { release = resolve; });
    const { unmount } = render(<SpatialScene mode="trust" label="Authority precedes action." />);
    const figure = screen.getByRole("figure");
    await act(async () => intersect(true));
    await waitFor(() => expect(graphics.started).toHaveBeenCalled());
    unmount();
    await act(async () => release());
    expect(figure.querySelector("canvas")).toBeNull();
    expect(graphics.dispose).toHaveBeenCalledTimes(1);
  });

  it("preserves poster, captions, and adjacent links when WebGL initialization fails", async () => {
    graphics.fail = true;
    render(<><SpatialScene mode="execution" label="Work reaches its acceptance condition." /><ProductMap /></>);
    await act(async () => intersect(true));
    const figure = screen.getByRole("figure");
    await waitFor(() => expect(figure).toHaveClass("study-static"));
    expectPoster(figure);
    expect(figure.querySelector("canvas")).toBeNull();
    expect(screen.getByText("Authority stays connected to every step.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Explore controlled execution" })).toBeVisible();
  });

  it("returns to the poster if the graphics context is lost", async () => {
    render(<SpatialScene mode="platform" label="Intelligence, execution and assurance connect." />);
    const figure = screen.getByRole("figure");
    await act(async () => intersect(true));
    await waitFor(() => expect(figure).toHaveClass("study-ready"));
    await act(async () => { figure.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost", { bubbles: true, cancelable: true })); });
    expectPoster(figure);
    expect(figure.querySelector("canvas")).toBeNull();
    expect(screen.getByText("One connected foundation")).toBeVisible();
  });

  it("catches rendering failures and disposes graphics on unmount", async () => {
    const { unmount } = render(<SpatialScene mode="evidence" label="A result carries its evidence." />);
    const figure = screen.getByRole("figure");
    await act(async () => intersect(true));
    await waitFor(() => expect(figure).toHaveClass("study-ready"));
    graphics.updatesFail = true;
    await act(async () => { window.dispatchEvent(new Event("scroll")); });
    await waitFor(() => expect(figure).toHaveClass("study-static"));
    expectPoster(figure);
    unmount();
    expect(graphics.dispose).toHaveBeenCalledTimes(1);
  });
});

describe("source assets and visual primitives", () => {
  it("ships every mapped asset with the original frozen source hash", () => {
    const source = new Map(readFileSync(new NodeURL("../../../../../../qa/marketing-parity/source-tree.sha256", import.meta.url), "utf8")
      .trim().split("\n").map((line) => [line.slice(66), line.slice(0, 64)]));
    const required = [
      ...["human-judgment", "human-judgment-small"].map((name) => `/images/company/${name}.webp`),
      ...[...scenes.map(([mode, theme]) => [mode, theme]), ["operations", "paper"], ["execution", "paper"]].flatMap(([mode, theme]) => [`/images/cinematic/study-${mode}-${theme}.webp`, `/images/cinematic/study-${mode}-${theme}-mobile.webp`]),
      "/images/cinematic/study-evidence-dark.webp",
      ...["film-desktop-0", "film-desktop-6", "film-mobile-0", "film-mobile-6"].map((name) => `/images/cinematic/${name}.webp`),
      ...["ekarvo-overview", "outcome-contract", "workflow-brief"].map((name) => `/downloads/${name}.txt`),
    ];
    expect(MARKETING_ASSETS.map((asset) => asset.path).sort()).toEqual(required.sort());
    for (const asset of MARKETING_ASSETS) {
      const bytes = readFileSync(new NodeURL(`../../../../public${asset.path}`, import.meta.url));
      expect(createHash("sha256").update(bytes).digest("hex"), asset.path).toBe(source.get(`public${asset.path}`));
      expect(asset.sha256, asset.path).toBe(source.get(`public${asset.path}`));
    }
  });

  it("links product suites and renders the complete connected lifecycle without scripts", () => {
    render(<ProductMap />);
    for (const name of ["Plan", "Operate", "Develop", "Optimize"]) {
      expect(screen.getByRole("link", { name: new RegExp(`^${name}`) })).toHaveAttribute("href", `/landing/products/operations-os#pulse-${name.toLowerCase()}`);
    }
    const lifecycle = screen.getByRole("list", { name: "Connected work lifecycle" });
    expect(Array.from(lifecycle.children).map((node) => node.textContent)).toEqual(["Detect", "Understand", "Simulate", "Authorize", "Execute", "Verify", "Learn"]);
    expect(screen.getByRole("link", { name: "Explore controlled execution" })).toHaveAttribute("href", "/landing/products/autonomous-execution");
  });

  it("makes the three-stage story and its caption available as static content", () => {
    render(<StoryPlate eyebrow="THE APPROACH" title="Done has a condition." body="Evidence supports the result." stages={["Context", "Authority", "Evidence"]} />);
    expect(screen.getByRole("heading", { name: "Done has a condition." })).toBeVisible();
    expect(screen.getByRole("list", { name: "Context to Authority to Evidence" }).children).toHaveLength(3);
    expect(screen.getByText("Evidence supports the result.")).toBeVisible();
  });
});
