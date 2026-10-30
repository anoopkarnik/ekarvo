import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { CinematicLanding } from "../CinematicLanding";
import { initCinematicLanding } from "./cinematicLanding";

vi.mock("next/navigation", () => ({ usePathname: () => "/landing" }));
// Graphics are independent of navigation. Keep all real DOM/navigation handlers.
vi.mock("./kineticWorld", () => ({ createKineticWorld: () => ({ resize() {}, update() {}, dispose() {} }) }));
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ""; });

async function setupFilm() {
  history.replaceState(null, "", location.pathname);
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
  await vi.waitFor(() => expect(root).toHaveClass("is-film"));
  return { root, scroll, cleanup };
}

it("accumulates rapid next/previous commands from the pending rail destination", async () => {
  const { root, scroll, cleanup } = await setupFilm();
  try {
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


it.each(["Home", "End", "PageUp", "PageDown", "ArrowUp", "ArrowDown"])("discards a pending rail destination when %s scrolls with Next focused", async (key) => {
  const { root, scroll, cleanup } = await setupFilm();
  try {
    const next = root.querySelector<HTMLButtonElement>("[data-ek-next]")!;
    root.querySelector<HTMLAnchorElement>('[data-ek-rail="5"]')!.click();
    next.focus();
    vi.stubGlobal("scrollY", 1000);
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    next.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    next.click();
    expect(scroll.mock.lastCall?.[0]).toEqual({ top: 2000, behavior: "smooth" });
  } finally { cleanup(); }
});

it.each([
  ["button Space", "<button>Control</button>", " ", false, 6000],
  ["button Enter", "<button>Control</button>", "Enter", false, 6000],
  ["link Space", '<a href="#unrelated">Link</a>', " ", false, 2000],
  ["text input Home", "<input />", "Home", false, 6000],
  ["text input PageDown", "<input />", "PageDown", false, 2000],
  ["textarea PageDown", "<textarea></textarea>", "PageDown", false, 6000],
  ["select End", "<select><option>Choice</option></select>", "End", false, 6000],
  ["editable Home", '<div contenteditable="true">Text</div>', "Home", false, 6000],
  ["input button Home", '<input type="button" value="Control" />', "Home", false, 2000],
  ["consumed custom Home", '<button>Control</button>', "Home", true, 6000],
] as const)("respects native key handling for %s", async (_label, html, key, consumed, top) => {
  const { root, scroll, cleanup } = await setupFilm();
  try {
    root.querySelector<HTMLAnchorElement>('[data-ek-rail="5"]')!.click();
    document.body.insertAdjacentHTML("beforeend", html);
    const control = document.body.lastElementChild as HTMLElement;
    control.focus();
    vi.stubGlobal("scrollY", 1000);
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    if (consumed) event.preventDefault();
    control.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(consumed);
    root.querySelector<HTMLButtonElement>("[data-ek-next]")!.click();
    expect(scroll.mock.lastCall?.[0]).toEqual({ top, behavior: "smooth" });
  } finally { cleanup(); }
});
