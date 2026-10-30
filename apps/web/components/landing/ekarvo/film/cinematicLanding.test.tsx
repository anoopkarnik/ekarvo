import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { CinematicLanding } from "../CinematicLanding";
import { initCinematicLanding } from "./cinematicLanding";

vi.mock("next/navigation", () => ({ usePathname: () => "/landing" }));
// Graphics are independent of navigation. Keep all real DOM/navigation handlers.
vi.mock("./kineticWorld", () => ({ createKineticWorld: () => ({ resize() {}, update() {}, dispose() {} }) }));
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });

it("accumulates rapid next/previous commands from the pending rail destination", async () => {
  document.body.innerHTML = renderToStaticMarkup(<CinematicLanding />);
  const root = document.querySelector<HTMLElement>("[data-ek-film]")!;
  Object.defineProperty(root, "offsetHeight", { value: 6600 });
  vi.stubGlobal("innerHeight", 600);
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const scroll = vi.fn();
  vi.stubGlobal("scrollTo", scroll);
  const cleanup = initCinematicLanding(root);
  try {
    await vi.waitFor(() => expect(root).toHaveClass("is-film"));
    const next = root.querySelector<HTMLButtonElement>("[data-ek-next]")!;
    const previous = root.querySelector<HTMLButtonElement>("[data-ek-prev]")!;
    next.click(); next.click(); next.click();
    expect(scroll.mock.lastCall?.[0]).toEqual({ top: 3000, behavior: "smooth" });
    root.querySelector<HTMLAnchorElement>('[data-ek-rail="5"]')!.click();
    previous.click(); previous.click();
    expect(scroll.mock.lastCall?.[0]).toEqual({ top: 3000, behavior: "smooth" });
    const reading = root.querySelector<HTMLButtonElement>("[data-ek-reading]")!;
    history.replaceState(null, "", location.pathname);
    reading.click(); reading.click();
    await vi.waitFor(() => expect(root).toHaveClass("is-film"));
    next.click();
    expect(scroll.mock.lastCall?.[0]).toEqual({ top: 1000, behavior: "smooth" });
  } finally { cleanup(); }
});
